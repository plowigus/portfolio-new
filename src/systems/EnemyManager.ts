import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG, COLLISION_CATEGORIES } from '../config/gameConfig';
import { PLAYER_CONFIG } from '../config/playerConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

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
}

export interface Projectile {
    body: Matter.Body;
    sprite: PIXI.Graphics;
    type: 'BULLET' | 'BOMB';
    active: boolean;
    groundedTime: number;
}

// ─── Manager ─────────────────────────────────────────────────────────────────

export class EnemyManager {
    private engine: Matter.Engine;
    private app: PIXI.Application;
    public enemies: Enemy[] = [];
    public projectiles: Projectile[] = [];
    public enemiesDefeated: number = 0; // Publiczny licznik do GameEngine
    private spawnTimer: number = 0;
    private debugGraphics: PIXI.Graphics;

    constructor(engine: Matter.Engine, app: PIXI.Application) {
        this.engine = engine;
        this.app = app;

        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.zIndex = 100;
        this.app.stage.addChild(this.debugGraphics);

        this.debugGraphics.zIndex = 100;
        this.app.stage.addChild(this.debugGraphics);

        // ⚡ SPAWN DELAY: Start with 60 frames (1s) delay before first spawn
        // (Interval is 120, so starting at 60 means 60 frames left)
        this.spawnTimer = Math.max(0, GAME_CONFIG.enemySpawnInterval - 60);
    }

    // ─── Spawn Enemy ─────────────────────────────────────────────────────────
    public spawnEnemy(type: EnemyType, playerX: number) {
        const cfg = GAME_CONFIG.ENEMY_CONFIG[type];
        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;

        // Limit żółtych
        if (type === 'YELLOW') {
            const count = this.enemies.filter(e => e.type === 'YELLOW').length;
            if (count >= GAME_CONFIG.ENEMY_CONFIG.YELLOW.maxCount) return;
        }

        // Limit niebieskich
        if (type === 'BLUE') {
            const count = this.enemies.filter(e => e.type === 'BLUE').length;
            if (count >= GAME_CONFIG.ENEMY_CONFIG.BLUE.maxCount) return;
        }

        let spawnX: number;
        let spawnY: number;

        if (type === 'YELLOW') {
            const side = Math.random() > 0.5 ? 1 : -1;
            spawnX = playerX + side * (200 + Math.random() * 200);
            spawnY = groundY - GAME_CONFIG.ENEMY_CONFIG.YELLOW.flyHeight;
        } else if (type === 'RED') {
            // RED Limit: Max 2 total, Max 1 per side
            const reds = this.enemies.filter(e => e.type === 'RED');
            const leftRed = reds.find(e => e.body.position.x < GAME_CONFIG.width / 2);
            const rightRed = reds.find(e => e.body.position.x > GAME_CONFIG.width / 2);

            let isLeft: boolean;

            if (leftRed && rightRed) return; // Both sides occupied
            if (leftRed) isLeft = false;      // Left taken -> Force Right
            else if (rightRed) isLeft = true; // Right taken -> Force Left
            else isLeft = Math.random() > 0.5; // Both free -> Random

            spawnX = isLeft ? 80 : GAME_CONFIG.width - 80;
            spawnY = groundY - cfg.height / 2;
        } else {
            // BLUE: Always spawn LEFT, run RIGHT
            spawnX = -50;
            spawnY = groundY - cfg.height / 2;
        }

        const graphics = new PIXI.Graphics();
        graphics.rect(0, 0, cfg.width, cfg.height);
        graphics.fill(cfg.color);
        graphics.pivot.set(cfg.width / 2, cfg.height / 2);
        graphics.x = spawnX;
        graphics.y = spawnY;
        graphics.zIndex = 5;
        this.app.stage.addChild(graphics);

        const isSensor = type === 'YELLOW';
        const isStatic = type === 'RED';

        const body = Matter.Bodies.rectangle(
            spawnX, spawnY, cfg.width, cfg.height,
            {
                isSensor,
                isStatic,
                label: `enemy_${type}`,
                frictionAir: type === 'BLUE' ? 0.01 : 0,
                collisionFilter: {
                    category: COLLISION_CATEGORIES.ENEMY,
                    mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND | COLLISION_CATEGORIES.PLAYER_ATTACK,
                },
            }
        );
        Matter.Body.setInertia(body, Infinity);

        if (type === 'YELLOW') {
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
        }

        Matter.World.add(this.engine.world, body);

        this.enemies.push({
            body,
            sprite: graphics,
            type,
            active: true,
            hp: cfg.hp,
            attackTimer: 0,
            burstShotsRemaining: 0,
            burstCooldown: 0,
        });
    }

    // ─── Projectiles ─────────────────────────────────────────────────────────

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
            friction: 0,
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

    // ─── Update ──────────────────────────────────────────────────────────────

    public update(delta: number, playerBody: Matter.Body, gameState: any) {
        const currentWave = gameState.arenaWave || 1;
        const waveMultiplier = 1 + (currentWave - 1) * GAME_CONFIG.difficultyScaling;

        // Debug Hitbox Clear
        if (this.debugGraphics && !this.debugGraphics.destroyed) {
            this.debugGraphics.clear();
        }

        // --- ATTACK HITBOX LOGIC ---
        let activeHitbox: { x: number; y: number; w: number; h: number } | null = null;
        if (gameState.attackState.isPlaying) {
            const attackType = gameState.attackState.type === 'kick' ? 'KICK' : 'PUNCH';
            const config = PLAYER_CONFIG[attackType];

            if (config && config.attackHitbox) {
                const hb = config.attackHitbox;
                const facingDir = gameState.facing === 'left' ? -1 : 1;
                const hitboxX = playerBody.position.x + (hb.offsetX * facingDir);
                const hitboxY = playerBody.position.y + hb.offsetY;

                activeHitbox = {
                    x: hitboxX - hb.width / 2,
                    y: hitboxY - hb.height / 2,
                    w: hb.width,
                    h: hb.height,
                };

                if (GAME_CONFIG.debugMode && this.debugGraphics && !this.debugGraphics.destroyed) {
                    this.debugGraphics.rect(activeHitbox.x, activeHitbox.y, activeHitbox.w, activeHitbox.h);
                    this.debugGraphics.fill({ color: 0xff0000, alpha: 0.5 });
                }
            }
        }

        // --- SPAWN LOGIC ---
        if (gameState.isArenaActive) {
            this.spawnTimer += delta;

            // ⚡ AGRESSIVE SPAWN: If few enemies, spawn faster!
            let currentSpawnInterval = GAME_CONFIG.enemySpawnInterval / waveMultiplier;
            if (this.enemies.length < 3) {
                currentSpawnInterval = 30; // Very fast (0.5s at 60fps logic) start
            }

            if (this.spawnTimer >= currentSpawnInterval) {
                this.spawnTimer = 0;
                // Limit concurrent enemies (e.g. max 8) to avoid chaos
                if (this.enemies.length < 8) {
                    const roll = Math.random();
                    let type: EnemyType;
                    if (roll < 0.5) type = 'BLUE';
                    else if (roll < 0.8) type = 'RED';
                    else type = 'YELLOW';
                    this.spawnEnemy(type, playerBody.position.x);
                }
            }
        }

        const playerX = playerBody.position.x;
        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;

        // --- ENEMY LOOP ---
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            // AI
            if (enemy.type === 'BLUE') {
                const blueSpeed = GAME_CONFIG.ENEMY_CONFIG.BLUE.baseSpeed * waveMultiplier;
                // Run Left -> Right
                Matter.Body.setVelocity(enemy.body, { x: blueSpeed, y: enemy.body.velocity.y });

                // Despawn if off-screen RIGHT
                if (enemy.body.position.x > GAME_CONFIG.width + 100) {
                    this.removeEnemy(i);
                    // Do not count as defeated? Or just respawn logic handles it?
                    // "Poźniej są niszczone i za chwile znowu się pojawiają" -> just despawn.
                    continue;
                }
            } else if (enemy.type === 'RED') {
                // Burst Fire Logic
                if (enemy.burstShotsRemaining > 0) {
                    enemy.burstCooldown -= delta;
                    if (enemy.burstCooldown <= 0) {
                        enemy.burstCooldown = GAME_CONFIG.ENEMY_CONFIG.RED.burstDelay;
                        enemy.burstShotsRemaining--;
                        this.spawnBullet(enemy.body.position.x, enemy.body.position.y, playerX);
                    }
                } else {
                    enemy.attackTimer += delta;
                    if (enemy.attackTimer >= GAME_CONFIG.ENEMY_CONFIG.RED.attackCooldown) {
                        enemy.attackTimer = 0;
                        enemy.burstShotsRemaining = GAME_CONFIG.ENEMY_CONFIG.RED.burstCount;
                        enemy.burstCooldown = 0;
                    }
                }
            } else if (enemy.type === 'YELLOW') {
                // Flying Logic
                const yCfg = GAME_CONFIG.ENEMY_CONFIG.YELLOW;
                const targetX = playerX;
                const currentX = enemy.body.position.x;
                const lerpX = currentX + (targetX - currentX) * 0.02 * delta;
                const flyY = groundY - yCfg.flyHeight;
                Matter.Body.setPosition(enemy.body, { x: lerpX, y: flyY });
                Matter.Body.setVelocity(enemy.body, { x: 0, y: 0 }); // Stay static in air

                enemy.attackTimer += delta;
                if (enemy.attackTimer >= yCfg.attackCooldown) {
                    enemy.attackTimer = 0;
                    this.spawnBomb(enemy.body.position.x, enemy.body.position.y + yCfg.height / 2 + 5);
                }
            }

            // Sprite Sync
            if (enemy.sprite && !enemy.sprite.destroyed) {
                enemy.sprite.x = enemy.body.position.x;
                enemy.sprite.y = enemy.body.position.y;
            }

            // COMBAT: Player Hit Enemy (Attack)
            if (activeHitbox) {
                const eb = enemy.body.bounds;
                const overlaps =
                    activeHitbox.x < eb.max.x &&
                    activeHitbox.x + activeHitbox.w > eb.min.x &&
                    activeHitbox.y < eb.max.y &&
                    activeHitbox.y + activeHitbox.h > eb.min.y;

                if (overlaps) {
                    enemy.hp -= 1;
                    if (enemy.hp <= 0) {
                        this.removeEnemy(i);
                        this.enemiesDefeated++; // Zliczamy zabójstwo!
                        if (GAME_CONFIG.debugMode) console.log(`💥 ${enemy.type} DESTROYED! (${this.enemiesDefeated} total)`);
                        continue;
                    }
                }
            }

            // COMBAT: Enemy Hit Player (Body Collision)
            // FIX: Blue enemies now deal damage
            if (enemy.type === 'BLUE' && Matter.Collision.collides(playerBody, enemy.body)) {
                if (!gameState.attackState.isPlaying) {
                    const knockDir = playerX < enemy.body.position.x ? -1 : 1;
                    Matter.Body.setVelocity(playerBody, { x: knockDir * 10, y: -5 });
                    // Flag damage for main loop
                    gameState.playerHitThisFrame = true;
                }
            }
        }

        // --- PROJECTILE LOOP ---
        const now = Date.now();
        const fizzleTime = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE.fizzleTime;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];

            if (proj.sprite && !proj.sprite.destroyed) {
                proj.sprite.x = proj.body.position.x;
                proj.sprite.y = proj.body.position.y;
                proj.sprite.rotation = proj.body.angle;
            }

            // Check Player Collision
            if (Matter.Collision.collides(playerBody, proj.body)) {
                const knockDir = playerX < proj.body.position.x ? -1 : 1;
                Matter.Body.setVelocity(playerBody, { x: knockDir * 8, y: -3 });
                gameState.playerHitThisFrame = true; // Deal Damage
                this.removeProjectile(i);
                continue;
            }

            if (proj.type === 'BOMB') {
                // Manual gravity for sensor bomb
                if (!proj.body.isStatic) {
                    const currentVy = proj.body.velocity.y;
                    Matter.Body.setVelocity(proj.body, { x: 0, y: currentVy + GAME_CONFIG.ENEMY_CONFIG.PROJECTILE.bombGravity * 0.1 });
                }
                // Ground logic
                const bombBottom = proj.body.position.y + GAME_CONFIG.ENEMY_CONFIG.PROJECTILE.size;
                if (bombBottom >= groundY) {
                    if (proj.groundedTime < 0) {
                        proj.groundedTime = now;
                        Matter.Body.setPosition(proj.body, {
                            x: proj.body.position.x,
                            y: groundY - GAME_CONFIG.ENEMY_CONFIG.PROJECTILE.size
                        });
                        Matter.Body.setVelocity(proj.body, { x: 0, y: 0 });
                        Matter.Body.setStatic(proj.body, true);
                    }
                    if (now - proj.groundedTime >= fizzleTime) {
                        this.removeProjectile(i);
                        continue;
                    }
                }
                if (proj.body.position.y > GAME_CONFIG.height + 100) {
                    this.removeProjectile(i);
                    continue;
                }
            } else if (proj.type === 'BULLET') {
                if (proj.body.position.x < -100 || proj.body.position.x > GAME_CONFIG.width + 100) {
                    this.removeProjectile(i);
                    continue;
                }
                if (proj.body.position.y >= groundY) {
                    this.removeProjectile(i);
                    continue;
                }
            }
        }
    }

    public removeEnemy(index: number) {
        if (index < 0 || index >= this.enemies.length) return;
        const enemy = this.enemies[index];
        if (enemy.sprite && !enemy.sprite.destroyed) {
            this.app.stage.removeChild(enemy.sprite);
            enemy.sprite.destroy();
        }
        if (enemy.body) Matter.World.remove(this.engine.world, enemy.body);
        this.enemies.splice(index, 1);
    }

    private removeProjectile(index: number) {
        if (index < 0 || index >= this.projectiles.length) return;
        const proj = this.projectiles[index];
        if (proj.sprite && !proj.sprite.destroyed) {
            this.app.stage.removeChild(proj.sprite);
            proj.sprite.destroy();
        }
        if (proj.body) Matter.World.remove(this.engine.world, proj.body);
        this.projectiles.splice(index, 1);
    }

    public cleanup() {
        for (let i = this.enemies.length - 1; i >= 0; i--) this.removeEnemy(i);
        this.enemies = [];
        for (let i = this.projectiles.length - 1; i >= 0; i--) this.removeProjectile(i);
        this.projectiles = [];
        this.enemiesDefeated = 0;

        if (this.debugGraphics && !this.debugGraphics.destroyed) {
            this.debugGraphics.clear();
            this.app.stage.removeChild(this.debugGraphics);
            this.debugGraphics.destroy();
        }
        // @ts-ignore
        this.debugGraphics = null;

        // ⚡ SPAWN DELAY RESET: 1s delay for next wave
        this.spawnTimer = Math.max(0, GAME_CONFIG.enemySpawnInterval - 60);
    }
}