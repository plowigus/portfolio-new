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
    fireSprite?: PIXI.AnimatedSprite;
    fireTimer?: number;
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
    sprite: PIXI.Container | PIXI.Sprite | PIXI.AnimatedSprite | PIXI.Graphics;
    type: 'BULLET' | 'BOMB';
    active: boolean;
    groundedTime: number;
    isTumbling?: boolean;
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
        } else if (type === 'RED') {
            const redCfg = GAME_CONFIG.ENEMY_CONFIG.RED as any;
            if (this.assetManager.animations[redCfg.assetName || 'klasyk']) {
                const anim = new PIXI.AnimatedSprite(this.assetManager.animations[redCfg.assetName || 'klasyk']);
                anim.animationSpeed = redCfg.animationSpeed || 0.15;
                anim.play();
                anim.anchor.set(redCfg.anchorX || 0.5, redCfg.anchorY || 0.5);
                anim.scale.set(redCfg.scale || 0.8);
                // Adjust position
                // Visual offsets based on config
                // NOTE: anim.x/y set later, but we can wrap in container if needed. 
                // Since we assume simple sprite sync, we'll just return the sprite.
                visual = anim;

                // --- Fire FX ---
                if (redCfg.fireAssetName && this.assetManager.animations[redCfg.fireAssetName]) {
                    const fireAnim = new PIXI.AnimatedSprite(this.assetManager.animations[redCfg.fireAssetName]);
                    fireAnim.anchor.set(1, 0.5); // Grows left from gun
                    fireAnim.scale.set(redCfg.fireScale || 1.0);
                    fireAnim.x = (redCfg.fireOffsetX || -40);
                    fireAnim.y = (redCfg.fireOffsetY || -15);
                    fireAnim.animationSpeed = redCfg.fireAnimationSpeed || 0.3;
                    fireAnim.visible = false;
                    fireAnim.loop = true; // or false if oneshot, but we control visibility

                    // We need a container to hold both body and fire if we want them to move together easily
                    // But 'anim' is the visual. So we can add fire as child of anim?
                    // AnimatedSprite extends Sprite extends Container. Yes.
                    anim.addChild(fireAnim);

                    // Store ref in enemy object later, but we need to extract it or pass it.
                    // Actually, we can just attach it to the visual for now, but we need a reference in `this.enemies`.
                    // We'll attach it temporarily to the visual object as a property if we can, or return it.
                    // Better: `visual` is assigned to `enemy.sprite`. We can access children? 
                    // Or we can assume enemy creation logic below needs modification to accept fireSprite.
                    // Let's modify the `visual` creation to include it, and then extract it? 
                    // No, `spawnEnemyAt` creates the `Enemy` object at the end. We can store it in a local var.
                    (visual as any).fireSpriteRef = fireAnim;
                }
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, cfg.width, cfg.height);
                g.fill(cfg.color);
                g.pivot.set(cfg.width / 2, cfg.height / 2);
                visual = g;
            }
        } else {
            const yellowCfg = GAME_CONFIG.ENEMY_CONFIG.YELLOW as any;
            if (this.assetManager.animations[yellowCfg.assetName || 'pigeon']) {
                const anim = new PIXI.AnimatedSprite(this.assetManager.animations[yellowCfg.assetName || 'pigeon']);
                anim.animationSpeed = yellowCfg.animationSpeed || 0.15;
                anim.play();
                anim.anchor.set(0.5); // Center anchor for rotation
                anim.scale.set(yellowCfg.scale || 1);

                // Visual Offsets
                anim.x += (yellowCfg.visualOffsetX || 0);
                anim.y += (yellowCfg.visualOffsetY || 0);

                visual = anim;
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, cfg.width, cfg.height);
                g.fill(cfg.color);
                g.pivot.set(cfg.width / 2, cfg.height / 2);
                visual = g;
            }
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


            body = Matter.Body.create({
                parts: [chassis, w1, w2],
                friction: 0.8,
                frictionAir: 0.001,
                density: 0.05,
                restitution: 0,
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
            fireSprite: (visual as any).fireSpriteRef,
            fireTimer: 0
        });
    }

    private spawnBullet(x: number, y: number, targetX: number) {
        const pcfg = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE;
        const redCfg = GAME_CONFIG.ENEMY_CONFIG.RED as any;
        const dir = targetX > x ? 1 : -1;

        // Trash Ball Logic
        let sprite: PIXI.Container | PIXI.Sprite | PIXI.Graphics;
        let isTumbling = false;

        if (redCfg.projectileAsset && this.assetManager.animations[redCfg.projectileAsset]) {
            // Container for Glow + Sprite
            const container = new PIXI.Container();

            // 1. Glow (Toxic Green)
            const glow = new PIXI.Graphics();
            const glowSize = (redCfg.projectileHitboxSize || 15) + (redCfg.projectileGlowSizeOffset || 5);
            glow.circle(0, 0, glowSize);
            glow.fill({
                color: redCfg.projectileGlowColor || 0xAAFF00,
                alpha: redCfg.projectileGlowAlpha ?? 0.6
            });
            glow.filters = [new PIXI.BlurFilter({
                strength: redCfg.projectileGlowBlur || 10,
                quality: 3
            })];
            container.addChild(glow);

            // 2. Sprite
            const anim = new PIXI.AnimatedSprite(this.assetManager.animations[redCfg.projectileAsset]);
            anim.animationSpeed = redCfg.projectileAnimationSpeed || 0.15;
            anim.play();
            anim.anchor.set(0.5);
            anim.scale.set(redCfg.projectileScale || 0.8);
            container.addChild(anim);

            sprite = container;
            isTumbling = true;
        } else {
            const graphics = new PIXI.Graphics();
            graphics.circle(0, 0, pcfg.size);
            graphics.fill(0xFF4444);
            sprite = graphics;
        }

        sprite.x = x;
        sprite.y = y;
        sprite.zIndex = 6;
        this.app.stage.addChild(sprite);

        const hitboxSize = redCfg.projectileHitboxSize || pcfg.size;

        const body = Matter.Bodies.circle(x, y, hitboxSize, {
            label: 'bullet', isSensor: true, frictionAir: 0,
            collisionFilter: { category: COLLISION_CATEGORIES.ENEMY_PROJECTILE, mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND },
        });

        const speed = redCfg.projectileSpeed || pcfg.bulletSpeed;
        Matter.Body.setVelocity(body, { x: dir * speed, y: 0 });
        Matter.World.add(this.engine.world, body);

        this.projectiles.push({ body, sprite, type: 'BULLET', active: true, groundedTime: -1, isTumbling });
    }

    private spawnBomb(x: number, y: number) {
        const pcfg = GAME_CONFIG.ENEMY_CONFIG.PROJECTILE;
        const yellowCfg = GAME_CONFIG.ENEMY_CONFIG.YELLOW as any;

        let sprite: PIXI.Container | PIXI.Sprite | PIXI.Graphics | PIXI.AnimatedSprite;

        if (yellowCfg.projectileAsset && this.assetManager.animations[yellowCfg.projectileAsset]) {
            const anim = new PIXI.AnimatedSprite(this.assetManager.animations[yellowCfg.projectileAsset]);
            anim.animationSpeed = yellowCfg.projectileAnimationSpeed || 0.1;
            anim.play();
            anim.anchor.set(0.5);
            anim.scale.set(yellowCfg.projectileScale || 1);
            sprite = anim;
        } else {
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, pcfg.size * 2, pcfg.size * 2);
            graphics.fill(0xFFFFFF);
            graphics.pivot.set(pcfg.size, pcfg.size);
            sprite = graphics;
        }

        sprite.x = x; sprite.y = y;
        // 💩 Poop behind ground (zIndex 2)
        sprite.zIndex = (yellowCfg.projectileAsset === 'pigeon_poop') ? 1 : 6;
        this.app.stage.addChild(sprite);

        const hitboxSize = yellowCfg.projectileHitboxSize || pcfg.size;

        // Note: For rectangle body, width/height is 2*size usually, but here we use hitboxSize maybe as radius or half-width?
        // Original code: pcfg.size * 2.  hitboxSize is likely radius.
        // Let's assume hitboxSize is RADIUS roughly, so width = hitboxSize * 2.
        // But config says `projectileHitboxSize: 12`. 12*2 = 24.
        // If we want a circle for the poop (it drops), maybe circle body is better?
        // Original was rectangle. Let's stick to rectangle for now but sized correctly.
        // If hitboxSize is 12, then box is 24x24.

        const bodySize = hitboxSize * 2;

        const body = Matter.Bodies.rectangle(x, y, bodySize, bodySize, {
            label: 'bomb', isStatic: false, isSensor: true, frictionAir: 0,
            collisionFilter: { category: COLLISION_CATEGORIES.ENEMY_PROJECTILE, mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.GROUND },
        });
        Matter.Body.setVelocity(body, { x: 0, y: (pcfg as any).bombSpeed || 10 });
        Matter.World.add(this.engine.world, body);
        this.projectiles.push({ body, sprite, type: 'BOMB', active: true, groundedTime: -1 });
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

                        // Show Fire
                        if (enemy.fireSprite) {
                            enemy.fireSprite.visible = true;
                            enemy.fireSprite.gotoAndPlay(0);
                            enemy.fireTimer = (cfg.fireDuration || 20);
                        }
                    }

                    // Handle Fire Duration
                    if (enemy.fireTimer && enemy.fireTimer > 0) {
                        enemy.fireTimer -= 1; // using frames approach or delta? Config says frames.
                        // But update uses delta (fractional). Let's assume delta ~ 1.0 for 60fps.
                        // If delta is time-based, we might need to adjust. 
                        // Let's stick to simple decrement for now or use delta if game is time-based.
                        // The game seems to use delta. Let's start with decrementing by delta.
                        // enemy.fireTimer -= delta; 

                        if (enemy.fireTimer <= 0) {
                            enemy.fireTimer = 0;
                            if (enemy.fireSprite) enemy.fireSprite.visible = false;
                        }
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

            // Rotation for Trash Ball (Tumbling)
            if (proj.isTumbling) {
                proj.sprite.rotation -= 0.15 * delta;
            }
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