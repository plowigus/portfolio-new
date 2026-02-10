import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG, COLLISION_CATEGORIES } from '../config/gameConfig';
import { PLAYER_CONFIG } from '../config/playerConfig';

export type EnemyType = 'BLUE' | 'RED' | 'YELLOW';

export interface Enemy {
    body: Matter.Body;
    sprite: PIXI.Graphics;
    type: EnemyType;
    active: boolean;
    hp: number;
    attackTimer: number;
    burstShotsRemaining: number;
    burstCooldown: number;
    isGrounded?: boolean;
}

export interface Projectile {
    body: Matter.Body;
    sprite: PIXI.Graphics;
    type: 'BULLET' | 'BOMB';
    active: boolean;
    groundedTime: number;
}

export class EnemyManager {
    private engine: Matter.Engine;
    private app: PIXI.Application;
    public enemies: Enemy[] = [];
    public projectiles: Projectile[] = [];
    public enemiesDefeated: number = 0;
    private debugGraphics: PIXI.Graphics;

    constructor(engine: Matter.Engine, app: PIXI.Application) {
        this.engine = engine;
        this.app = app;
        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.zIndex = 100;
        this.app.stage.addChild(this.debugGraphics);
    }

    /**
     * Spawn Enemy at specific coordinates (Logic driven by Spawner now)
     */
    public spawnEnemyAt(type: EnemyType, x: number, y: number) {
        const cfg = GAME_CONFIG.ENEMY_CONFIG[type] as any;

        // Limits
        const count = this.enemies.filter(e => e.type === type).length;
        if (cfg.maxCount && count >= cfg.maxCount) return;

        const graphics = new PIXI.Graphics();

        // Simple fill fix
        graphics.rect(0, 0, cfg.width, cfg.height);
        graphics.fill(cfg.color);

        graphics.pivot.set(cfg.width / 2, cfg.height / 2);
        graphics.x = x;
        graphics.y = y;
        graphics.zIndex = 50;
        this.app.stage.addChild(graphics);

        let isStatic = false;
        let frictionAir = 0;
        let density = 0.001;
        let isSensor = false;

        if (type === 'RED') {
            isStatic = true;
        } else if (type === 'BLUE') {
            isStatic = false;
            frictionAir = 0.01;
        } else if (type === 'YELLOW') {
            isStatic = true;
            isSensor = true;
        }

        const body = Matter.Bodies.rectangle(
            x, y, cfg.width, cfg.height,
            {
                isSensor,
                isStatic,
                label: `enemy_${type}`,
                frictionAir,
                density,
                collisionFilter: {
                    category: COLLISION_CATEGORIES.ENEMY,
                    mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND | COLLISION_CATEGORIES.PLAYER_ATTACK,
                },
            }
        );

        if (type === 'BLUE') {
            Matter.Body.setInertia(body, Infinity);
        }

        Matter.World.add(this.engine.world, body);

        this.enemies.push({
            body,
            sprite: graphics,
            type,
            active: true,
            hp: cfg.hp,
            // 🛠️ FIX: Czerwony startuje z "naładowanym" atakiem, żeby strzelić od razu po pojawieniu się
            attackTimer: type === 'RED' ? (cfg.attackCooldown || 0) : 0,
            burstShotsRemaining: 0,
            burstCooldown: 0,
        });
    }

    private spawnBullet(x: number, y: number, targetX: number) {
        const pcfg = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE;
        const dir = targetX > x ? 1 : -1;

        const graphics = new PIXI.Graphics();
        graphics.circle(0, 0, pcfg.size);
        graphics.fill(0xFF4444);
        graphics.x = x;
        graphics.y = y;
        graphics.zIndex = 6;
        this.app.stage.addChild(graphics);

        const body = Matter.Bodies.circle(x, y, pcfg.size, {
            label: 'bullet',
            isSensor: true,
            frictionAir: 0,
            collisionFilter: {
                category: COLLISION_CATEGORIES.ENEMY_PROJECTILE,
                mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND,
            },
        });

        Matter.Body.setVelocity(body, { x: dir * pcfg.bulletSpeed, y: 0 });
        Matter.World.add(this.engine.world, body);
        this.projectiles.push({ body, sprite: graphics, type: 'BULLET', active: true, groundedTime: -1 });
    }

    private spawnBomb(x: number, y: number) {
        const pcfg = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE;

        const graphics = new PIXI.Graphics();
        graphics.rect(0, 0, pcfg.size * 2, pcfg.size * 2);
        graphics.fill(0xFFFFFF);
        graphics.pivot.set(pcfg.size, pcfg.size);
        graphics.x = x;
        graphics.y = y;
        graphics.zIndex = 6;
        this.app.stage.addChild(graphics);

        const body = Matter.Bodies.rectangle(x, y, pcfg.size * 2, pcfg.size * 2, {
            label: 'bomb',
            isStatic: false,
            isSensor: true,
            frictionAir: 0,
            collisionFilter: {
                category: COLLISION_CATEGORIES.ENEMY_PROJECTILE,
                mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND,
            },
        });

        Matter.Body.setVelocity(body, { x: 0, y: (pcfg as any).bombSpeed || 10 });
        Matter.World.add(this.engine.world, body);

        this.projectiles.push({ body, sprite: graphics, type: 'BOMB', active: true, groundedTime: -1 });
    }

    public update(delta: number, playerBody: Matter.Body, gameState: any, worldSpeed: number = 0) {
        if (this.debugGraphics) this.debugGraphics.clear();

        // Debug Hitbox Logic
        let activeHitbox: { x: number; y: number; w: number; h: number } | null = null;
        if (gameState.attackState.isPlaying) {
            const attackType = gameState.attackState.type === 'kick' ? 'KICK' : 'PUNCH';
            const config = PLAYER_CONFIG[attackType];
            if (config && config.attackHitbox) {
                const hb = config.attackHitbox;
                const facingDir = gameState.facing === 'left' ? -1 : 1;
                activeHitbox = {
                    x: playerBody.position.x + (hb.offsetX * facingDir) - hb.width / 2,
                    y: playerBody.position.y + hb.offsetY - hb.height / 2,
                    w: hb.width,
                    h: hb.height
                };
            }
        }

        const playerX = playerBody.position.x;

        // --- ENEMY LOOP ---
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const cfg = GAME_CONFIG.ENEMY_CONFIG[enemy.type] as any;

            // 1. World Scroll
            if (worldSpeed > 0) {
                Matter.Body.translate(enemy.body, { x: -worldSpeed * delta, y: 0 });
            }

            // 2. Behavior
            if (enemy.type === 'BLUE') {
                const targetVx = -cfg.baseSpeed;
                Matter.Body.setVelocity(enemy.body, { x: targetVx, y: enemy.body.velocity.y });

            } else if (enemy.type === 'RED') {
                // Turret Logic
                // Strzela tylko jak jest widoczny na ekranie (x < width)
                if (playerX < enemy.body.position.x && enemy.body.position.x < GAME_CONFIG.width) {
                    enemy.attackTimer += delta;
                    // Dzięki inicjalizacji attackTimer = cooldown, ten warunek spełni się w pierwszej klatce widoczności
                    if (enemy.attackTimer >= cfg.attackCooldown) {
                        enemy.attackTimer = 0;
                        this.spawnBullet(enemy.body.position.x, enemy.body.position.y, playerX);
                    }
                }
            } else if (enemy.type === 'YELLOW') {
                if (enemy.burstShotsRemaining > 0) {
                    enemy.burstCooldown -= delta;
                    if (enemy.burstCooldown <= 0) {
                        enemy.burstCooldown = cfg.burstDelay || 15;
                        enemy.burstShotsRemaining--;
                        this.spawnBomb(enemy.body.position.x, enemy.body.position.y + cfg.height / 2 + 5);
                    }
                } else {
                    enemy.attackTimer += delta;
                    if (enemy.attackTimer >= cfg.attackCooldown) {
                        enemy.attackTimer = 0;
                        enemy.burstShotsRemaining = cfg.burstCount || 3;
                        enemy.burstCooldown = 0;
                    }
                }
            }

            // Sync Sprite
            if (enemy.sprite) {
                enemy.sprite.x = enemy.body.position.x;
                enemy.sprite.y = enemy.body.position.y;
                enemy.sprite.rotation = enemy.body.angle;
            }

            // Despawn
            if (enemy.body.position.y > GAME_CONFIG.height + 200 || enemy.body.position.x < -100) {
                this.removeEnemy(i);
                continue;
            }

            // Hit Logic
            if (activeHitbox) {
                const eb = enemy.body.bounds;
                const overlaps = activeHitbox.x < eb.max.x && activeHitbox.x + activeHitbox.w > eb.min.x &&
                    activeHitbox.y < eb.max.y && activeHitbox.y + activeHitbox.h > eb.min.y;
                if (overlaps) {
                    enemy.hp--;
                    if (enemy.hp <= 0) {
                        this.removeEnemy(i);
                        this.enemiesDefeated++;
                        continue;
                    }
                }
            }

            // Player Damage
            if (Matter.Collision.collides(playerBody, enemy.body)) {
                if (!gameState.attackState.isPlaying) {
                    const knockDir = playerX < enemy.body.position.x ? -1 : 1;
                    Matter.Body.setVelocity(playerBody, { x: knockDir * 10, y: -5 });
                    gameState.playerHitThisFrame = true;
                }
            }
        }

        // --- PROJECTILES ---
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            if (worldSpeed > 0) {
                Matter.Body.translate(proj.body, { x: -worldSpeed * delta, y: 0 });
            }

            if (proj.sprite) {
                proj.sprite.x = proj.body.position.x;
                proj.sprite.y = proj.body.position.y;
                proj.sprite.rotation = proj.body.angle;
            }

            if (proj.body.position.y > GAME_CONFIG.height + 100 || proj.body.position.x < -100) {
                this.removeProjectile(i);
                continue;
            }

            if (Matter.Collision.collides(playerBody, proj.body)) {
                gameState.playerHitThisFrame = true;
                Matter.Body.setVelocity(playerBody, { x: -5, y: -5 });
                this.removeProjectile(i);
            }

            if (proj.type === 'BOMB') {
                const cfg = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE;
                if (!proj.body.isStatic) {
                    Matter.Body.applyForce(proj.body, proj.body.position, { x: 0, y: (cfg as any).bombGravity * 0.001 });
                }
            }
        }
    }

    public removeEnemy(index: number) {
        if (index < 0 || index >= this.enemies.length) return;
        const e = this.enemies[index];
        if (e.sprite) { this.app.stage.removeChild(e.sprite); e.sprite.destroy(); }
        Matter.World.remove(this.engine.world, e.body);
        this.enemies.splice(index, 1);
    }

    public removeProjectile(index: number) {
        if (index < 0 || index >= this.projectiles.length) return;
        const p = this.projectiles[index];
        if (p.sprite) { this.app.stage.removeChild(p.sprite); p.sprite.destroy(); }
        Matter.World.remove(this.engine.world, p.body);
        this.projectiles.splice(index, 1);
    }

    public cleanup() {
        while (this.enemies.length > 0) this.removeEnemy(0);
        while (this.projectiles.length > 0) this.removeProjectile(0);
        this.enemiesDefeated = 0;
        if (this.debugGraphics) this.debugGraphics.clear();
    }
}