import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG, COLLISION_CATEGORIES } from '../config/gameConfig';
import { PLAYER_CONFIG } from '../config/playerConfig';

export type EnemyType = 'BLUE' | 'RED' | 'YELLOW';

export interface HeldItem {
    body: Matter.Body;
    sprite: PIXI.AnimatedSprite | PIXI.Sprite | PIXI.Graphics;
    active: boolean;
}

export interface Enemy {
    body: Matter.Body;
    sprite: PIXI.Container | PIXI.Graphics;
    wheels?: PIXI.Sprite[];
    heldItem?: HeldItem;
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
    private assetManager: any;

    constructor(engine: Matter.Engine, app: PIXI.Application, assetManager: any) {
        this.engine = engine;
        this.app = app;
        this.assetManager = assetManager;
        this.debugGraphics = new PIXI.Graphics();
        this.debugGraphics.zIndex = 100;
        this.app.stage.addChild(this.debugGraphics);
    }

    public spawnEnemyAt(type: EnemyType, x: number, y: number) {
        const cfg = GAME_CONFIG.ENEMY_CONFIG[type] as any;

        const count = this.enemies.filter(e => e.type === type).length;
        if (cfg.maxCount && count >= cfg.maxCount) return;

        let visual: PIXI.Container | PIXI.Graphics;
        let wheels: PIXI.Sprite[] = [];
        let body: Matter.Body;

        // --- 1. VISUALS ---
        if (type === 'BLUE') {
            const container = new PIXI.Container();
            const bodyTex = this.assetManager.textures[cfg.bodyAsset || 'wozek'];
            const wheelTex = this.assetManager.textures[cfg.wheelAsset || 'wheel'];

            if (!bodyTex || !wheelTex) return;

            // Koła
            const leftWheel = new PIXI.Sprite(wheelTex);
            leftWheel.anchor.set(0.5);
            leftWheel.scale.set(cfg.wheelScale || 0.8);
            leftWheel.x = -(cfg.wheelOffsetX || 35);
            leftWheel.y = (cfg.wheelOffsetY || 25);
            container.addChild(leftWheel);
            wheels.push(leftWheel);

            const rightWheel = new PIXI.Sprite(wheelTex);
            rightWheel.anchor.set(0.5);
            rightWheel.scale.set(cfg.wheelScale || 0.8);
            rightWheel.x = (cfg.wheelOffsetX || 35);
            rightWheel.y = (cfg.wheelOffsetY || 25);
            container.addChild(rightWheel);
            wheels.push(rightWheel);

            // Kadłub
            const bodySprite = new PIXI.Sprite(bodyTex);
            bodySprite.anchor.set(0.5);
            bodySprite.y = cfg.hitboxOffsetY || 0;
            container.addChild(bodySprite);

            visual = container;
        } else {
            const g = new PIXI.Graphics();
            g.rect(0, 0, cfg.width, cfg.height);
            g.fill(cfg.color);
            g.pivot.set(cfg.width / 2, cfg.height / 2);
            visual = g;
        }

        visual.x = x;
        visual.y = y;
        visual.zIndex = 50;
        this.app.stage.addChild(visual);

        // --- 2. PHYSICS ---
        const commonProps = {
            label: `enemy_${type}`,
            collisionFilter: {
                category: COLLISION_CATEGORIES.ENEMY,
                mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND | COLLISION_CATEGORIES.PLAYER_ATTACK,
            }
        };

        if (type === 'BLUE') {
            const chassis = Matter.Bodies.rectangle(x, y - 10, cfg.width, cfg.height, commonProps);
            const wheelRadius = cfg.wheelRadius || 15;
            const w1 = Matter.Bodies.circle(x - cfg.wheelOffsetX, y + cfg.wheelOffsetY - 10, wheelRadius, commonProps);
            const w2 = Matter.Bodies.circle(x + cfg.wheelOffsetX, y + cfg.wheelOffsetY - 10, wheelRadius, commonProps);

            // 🛠️ CRITICAL FIX: USUNIĘTO inertia: Infinity
            // Teraz wózek może się obracać (przechylać), gdy jedno koło straci grunt.
            body = Matter.Body.create({
                parts: [chassis, w1, w2],
                friction: 0.8,      // 🛠️ Duże tarcie, żeby "chwycił" krawędź i się obrócił
                frictionAir: 0.001, // Mały opór powietrza dla płynniejszego lotu
                density: 0.05,      // Ciężki obiekt
                restitution: 0,     // Nie odbija się jak piłka
                inertia: Infinity,
                label: `enemy_${type}`
            });
        } else {
            let isStatic = type === 'RED' || type === 'YELLOW';
            let isSensor = type === 'YELLOW';
            body = Matter.Bodies.rectangle(x, y, cfg.width, cfg.height, {
                ...commonProps,
                isStatic,
                isSensor,
                frictionAir: 0,
                density: 0.001
            });
        }

        Matter.World.add(this.engine.world, body);

        // --- 3. DINNER (OBIOD) SPAWN ---
        let heldItem: HeldItem | undefined = undefined;

        if (type === 'BLUE') {
            const blueCfg = GAME_CONFIG.ENEMY_CONFIG.BLUE as any;

            if (Math.random() <= (blueCfg.hasDinnerChance || 0)) {
                let itemSprite: PIXI.AnimatedSprite | PIXI.Sprite | PIXI.Graphics;

                if (this.assetManager.animations['obiod']) {
                    const anim = new PIXI.AnimatedSprite(this.assetManager.animations['obiod']);
                    anim.animationSpeed = blueCfg.dinnerAnimSpeed || 0.1;
                    anim.play();
                    anim.anchor.set(0.5);
                    anim.scale.set(blueCfg.dinnerScale || 0.5);
                    itemSprite = anim;
                } else {
                    const g = new PIXI.Graphics();
                    g.circle(0, 0, 20).fill(0x00FF00);
                    itemSprite = g;
                }

                itemSprite.zIndex = 55;
                this.app.stage.addChild(itemSprite);

                const offX = blueCfg.dinnerOffsetX || 0;
                const offY = blueCfg.dinnerOffsetY || blueCfg.dinnerOffset || -90;
                const itemX = x + offX;
                const itemY = y + offY;

                const itemBody = Matter.Bodies.circle(itemX, itemY, (blueCfg.dinnerSize || 40) / 2, {
                    isSensor: true,
                    isStatic: true,
                    label: 'dinner_pickup',
                    collisionFilter: {
                        category: COLLISION_CATEGORIES.ENEMY,
                        mask: COLLISION_CATEGORIES.PLAYER,
                    }
                });

                Matter.World.add(this.engine.world, itemBody);

                heldItem = {
                    body: itemBody,
                    sprite: itemSprite,
                    active: true
                };
            }
        }

        this.enemies.push({
            body,
            sprite: visual,
            wheels,
            heldItem,
            type,
            active: true,
            hp: cfg.hp,
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
        graphics.x = x; graphics.y = y; graphics.zIndex = 6;
        this.app.stage.addChild(graphics);
        const body = Matter.Bodies.circle(x, y, pcfg.size, {
            label: 'bullet', isSensor: true, frictionAir: 0,
            collisionFilter: { category: COLLISION_CATEGORIES.ENEMY_PROJECTILE, mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND },
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
        graphics.x = x; graphics.y = y; graphics.zIndex = 6;
        this.app.stage.addChild(graphics);
        const body = Matter.Bodies.rectangle(x, y, pcfg.size * 2, pcfg.size * 2, {
            label: 'bomb', isStatic: false, isSensor: true, frictionAir: 0,
            collisionFilter: { category: COLLISION_CATEGORIES.ENEMY_PROJECTILE, mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND },
        });
        Matter.Body.setVelocity(body, { x: 0, y: (pcfg as any).bombSpeed || 10 });
        Matter.World.add(this.engine.world, body);
        this.projectiles.push({ body, sprite: graphics, type: 'BOMB', active: true, groundedTime: -1 });
    }

    public update(delta: number, playerBody: Matter.Body, gameState: any, worldSpeed: number = 0) {
        if (this.debugGraphics) this.debugGraphics.clear();

        // Debug hitboxy
        if (GAME_CONFIG.debugMode) {
            this.enemies.forEach(enemy => {
                if (enemy.type === 'BLUE') {
                    const cfg = GAME_CONFIG.ENEMY_CONFIG.BLUE as any;
                    const tolerance = cfg.collisionOffsetTop || -10;
                    const topY = enemy.body.bounds.min.y - tolerance;
                    const minX = enemy.body.bounds.min.x;
                    const maxX = enemy.body.bounds.max.x;
                    this.debugGraphics.moveTo(minX, topY);
                    this.debugGraphics.lineTo(maxX, topY);
                    this.debugGraphics.stroke({ width: 2, color: 0x00FF00 });
                }
            });
        }

        // Hitbox Ataku Gracza
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
        const gravity = GAME_CONFIG.gravity;
        const maxFallSpeed = GAME_CONFIG.maxFallSpeed;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const cfg = GAME_CONFIG.ENEMY_CONFIG[enemy.type] as any;

            // 1. World Scroll
            if (worldSpeed > 0) Matter.Body.translate(enemy.body, { x: -worldSpeed * delta, y: 0 });

            // 2. Behavior
            if (enemy.type === 'BLUE') {
                // --- MANUAL GRAVITY & MOVEMENT ---

                // KROK A: Obliczamy nową prędkość Y (Grawitacja)
                // Nie używamy applyForce, żeby zachować spójność z fizyką gry (delta based),
                // ale musimy uważać, by nie zablokować rotacji.
                let newVy = enemy.body.velocity.y + (gravity * delta);
                if (newVy > maxFallSpeed) newVy = maxFallSpeed;

                // KROK B: Ustawiamy prędkość X (Ruch) OSOBNO od Y? 
                // Matter.Body.setVelocity nadpisuje obie wartości.
                // Aby wózek mógł się przechylać ("Ragdoll"), nie możemy wymuszać pozycji Y na sztywno,
                // jeśli kolizja próbuje ją zmienić (np. tylne koło podbija wózek).
                // Jednak przy wyłączonej grawitacji globalnej, musimy ciągnąć w dół.

                const targetVx = -cfg.baseSpeed;

                // Aplikujemy prędkość. 
                // Dzięki usunięciu inertia: Infinity, siły kolizji (reakcja podłoża na tylne koło)
                // wygenerują moment obrotowy (Torque), co obróci wózek.
                Matter.Body.setVelocity(enemy.body, {
                    x: targetVx,
                    y: newVy
                });

                // Rotacja kół (wizualna)
                if (enemy.wheels) {
                    const spin = (cfg.rotationSpeed || 0.15) * delta;
                    enemy.wheels.forEach(wheel => { wheel.rotation -= spin; });
                }

                enemy.isGrounded = Math.abs(enemy.body.velocity.y) < 0.5;

            } else if (enemy.type === 'RED') {
                if (playerX < enemy.body.position.x && enemy.body.position.x < GAME_CONFIG.width) {
                    enemy.attackTimer += delta;
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

                // 🛠️ TERAZ WÓZEK TEŻ SIĘ OBRACA!
                // Wcześniej było: if (enemy.type !== 'BLUE') ...
                // Teraz pozwalamy BLUE na rotację sprite'a zgodnie z ciałem fizycznym.
                enemy.sprite.rotation = enemy.body.angle;
            }

            // --- DINNER (OBIOD) UPDATE ---
            // Aktualizacja pozycji obiadu (musi uwzględniać rotację wózka!)
            if (enemy.heldItem && enemy.heldItem.active) {
                const blueCfg = GAME_CONFIG.ENEMY_CONFIG.BLUE as any;

                // Offsety lokalne (względem środka wózka)
                const localX = blueCfg.dinnerOffsetX || 0;
                const localY = blueCfg.dinnerOffsetY || blueCfg.dinnerOffset || -90;

                // Obracamy offsety zgodnie z kątem wózka (Macierz rotacji 2D)
                const angle = enemy.body.angle;
                const rotatedX = localX * Math.cos(angle) - localY * Math.sin(angle);
                const rotatedY = localX * Math.sin(angle) + localY * Math.cos(angle);

                const targetX = enemy.body.position.x + rotatedX;
                const targetY = enemy.body.position.y + rotatedY;

                Matter.Body.setPosition(enemy.heldItem.body, { x: targetX, y: targetY });
                // Resetujemy prędkość obiadu, żeby nie "odleciał" od wózka
                Matter.Body.setVelocity(enemy.heldItem.body, { x: 0, y: 0 });

                enemy.heldItem.sprite.x = targetX;
                enemy.heldItem.sprite.y = targetY;
                enemy.heldItem.sprite.rotation = angle; // Obiad też się obraca

                if (Matter.Collision.collides(playerBody, enemy.heldItem.body)) {
                    gameState.playerHealedThisFrame = true;
                    this.app.stage.removeChild(enemy.heldItem.sprite);
                    if (enemy.heldItem.sprite instanceof PIXI.Sprite) {
                        enemy.heldItem.sprite.destroy();
                    }
                    Matter.World.remove(this.engine.world, enemy.heldItem.body);
                    enemy.heldItem.active = false;
                    enemy.heldItem = undefined;
                    console.log("🍖 ROLADA ZJEDZONA!");
                }
            }

            // Despawn off-screen
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

            // Kolizja Gracz vs Wróg
            if (Matter.Collision.collides(playerBody, enemy.body)) {
                if (!gameState.attackState.isPlaying) {
                    const enemyTopEdge = enemy.body.bounds.min.y;
                    const playerBottomEdge = playerBody.bounds.max.y;
                    const tolerance = cfg.collisionOffsetTop || -10;
                    // Uwzględniamy kąt przy sprawdzaniu "czy jest na górze" (prosty test)
                    const isAbove = playerBottomEdge <= (enemyTopEdge - tolerance);

                    if (enemy.type === 'BLUE' && isAbove) {
                        gameState.coyoteTimer = GAME_CONFIG.coyoteTime;
                    } else {
                        const knockDir = playerX < enemy.body.position.x ? -1 : 1;
                        Matter.Body.setVelocity(playerBody, { x: knockDir * 10, y: -5 });
                        gameState.playerHitThisFrame = true;
                    }
                }
            }
        }

        // Projectiles Loop
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            if (worldSpeed > 0) Matter.Body.translate(proj.body, { x: -worldSpeed * delta, y: 0 });
            if (proj.sprite) { proj.sprite.x = proj.body.position.x; proj.sprite.y = proj.body.position.y; proj.sprite.rotation = proj.body.angle; }
            if (proj.body.position.y > GAME_CONFIG.height + 100 || proj.body.position.x < -100) { this.removeProjectile(i); continue; }
            if (Matter.Collision.collides(playerBody, proj.body)) { gameState.playerHitThisFrame = true; Matter.Body.setVelocity(playerBody, { x: -5, y: -5 }); this.removeProjectile(i); }
            if (proj.type === 'BOMB' && !proj.body.isStatic) { Matter.Body.applyForce(proj.body, proj.body.position, { x: 0, y: (GAME_CONFIG.ENEMY_CONFIG.PROJECTILE as any).bombGravity * 0.001 }); }
        }
    }

    public removeEnemy(index: number) {
        if (index < 0 || index >= this.enemies.length) return;
        const e = this.enemies[index];

        if (e.heldItem) {
            if (e.heldItem.sprite) {
                this.app.stage.removeChild(e.heldItem.sprite);
                e.heldItem.sprite.destroy();
            }
            Matter.World.remove(this.engine.world, e.heldItem.body);
        }

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