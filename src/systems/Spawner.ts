import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import React from 'react';
import { GAME_CONFIG, COLLISION_CATEGORIES } from '../config/gameConfig';
import { EnemyManager } from './EnemyManager';

export interface GameObject {
    sprite: PIXI.Container;
    body: Matter.Body;
    offset?: { x: number, y: number };
    type?: string;
}


export interface CoinObject extends GameObject {
    collected: boolean;
}

export interface MovingPlatform {
    sprite: PIXI.Container;
    body: Matter.Body;
    initialY: number;
    baseX: number;
    timeOffset: number;
}

export class SpawnerSystem {
    private engine: Matter.Engine;
    private app: PIXI.Application;
    private textures: Record<string, PIXI.Texture>;
    private animations: Record<string, PIXI.Texture[]>;

    public obstacles: GameObject[] = [];
    public platforms: GameObject[] = [];
    public movingPlatforms: MovingPlatform[] = [];
    public coins: CoinObject[] = [];

    public lastPlatformEndX: number = 0;
    private enemyManager: EnemyManager | null = null;

    constructor(engine: Matter.Engine, app: PIXI.Application, textures: Record<string, PIXI.Texture>, animations: Record<string, PIXI.Texture[]>) {
        this.engine = engine;
        this.app = app;
        this.textures = textures;
        this.animations = animations;
        this.lastPlatformEndX = 0;
    }

    public setEnemyManager(em: EnemyManager) {
        this.enemyManager = em;
    }

    public initPlatforms() {
        const startWidth = 1000;
        this.createPlatform(0, startWidth, 'ground', true);
        this.lastPlatformEndX = startWidth;
    }

    private randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    public spawnSzolaGap(startX: number): number {
        const gapSize = GAME_CONFIG.szolaGapSize;
        const midX = startX + (gapSize / 2);
        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;

        // Initial centered position
        const initialY = groundY - 50;

        // 1. Create Body (Floor only)
        // Static body that we will move manually via setPosition
        const bodyWidth = 100; // Hitbox width for floor
        const bodyHeight = GAME_CONFIG.szolaFloorHeight;

        const body = Matter.Bodies.rectangle(midX, initialY + GAME_CONFIG.szolaHitboxOffsetY, bodyWidth, bodyHeight, {
            isStatic: true,
            isSensor: false,
            label: 'ground_moving',
            friction: 1.0,
            frictionAir: 0,
            density: 1000,
            inertia: Infinity,
            collisionFilter: {
                category: COLLISION_CATEGORIES.GROUND,
                mask: COLLISION_CATEGORIES.PLAYER | COLLISION_CATEGORIES.ENEMY | COLLISION_CATEGORIES.ENEMY_PROJECTILE
            }
        });
        Matter.World.add(this.engine.world, body);

        // 2. Create Sprite
        let sprite: PIXI.Container;
        if (this.textures.szola) {
            const s = new PIXI.Sprite(this.textures.szola);
            s.anchor.set(0.5, 0.5);
            s.scale.set(GAME_CONFIG.szolaScale);
            s.zIndex = 2;
            sprite = s;
        } else {
            const g = new PIXI.Graphics();
            g.rect(-50, -50, 100, 100).fill(0xFFFF00);
            sprite = g;
        }
        sprite.x = midX;
        sprite.y = initialY;
        this.app.stage.addChild(sprite);

        this.movingPlatforms.push({
            sprite,
            body,
            initialY,
            baseX: midX,
            timeOffset: Math.random() * 10000
        });


        const coinsPerSide = 7;
        const jumpHeight = 90;


        const spawnArc = (x1: number, x2: number, baseY: number) => {
            for (let i = 1; i <= coinsPerSide; i++) {
                const t = i / (coinsPerSide + 1);
                const cx = x1 + (x2 - x1) * t;
                const arcOffset = 4 * jumpHeight * t * (1 - t);
                const cy = baseY - arcOffset;

                this.createCollectible(cx, cy);
            }
        };

        spawnArc(startX, midX, initialY - 20);
        spawnArc(midX, startX + gapSize, initialY - 20);

        return startX + gapSize;
    }

    public createPlatform(x: number, width: number, label: string = 'ground', safe: boolean = false): number {
        const height = GAME_CONFIG.platformHeight;
        const y = GAME_CONFIG.height - 50;

        const sprite = new PIXI.TilingSprite({
            texture: this.textures.floor,
            width: width,
            height: height
        });
        sprite.tileScale.set(3);
        sprite.x = x;
        sprite.y = y;
        sprite.zIndex = 2;
        this.app.stage.addChild(sprite);

        const body = Matter.Bodies.rectangle(
            x + width / 2,
            y + height / 2,
            width, height,
            { isStatic: true, label: label, friction: 0 }
        );
        Matter.World.add(this.engine.world, body);
        this.platforms.push({ sprite, body });

        if (safe) return x + width;

        const obstaclesOnThisPlatform: { type: 'low' | 'high', x: number, width: number }[] = [];
        const edgeBuffer = GAME_CONFIG.platformEdgeBuffer;
        const minGap = GAME_CONFIG.obstacleMinGap;
        let currentX = x + edgeBuffer;
        const endX = (x + width) - edgeBuffer;

        while (currentX < endX) {
            if (Math.random() < 0.4) {
                const isHigh = Math.random() > 0.5;
                const obsWidth = isHigh ? GAME_CONFIG.klopsztangaHitboxWidth : 40;
                if (currentX + obsWidth > endX) break;

                this.spawnObstacleAt(currentX, isHigh);
                obstaclesOnThisPlatform.push({ type: isHigh ? 'high' : 'low', x: currentX, width: obsWidth });
                currentX += obsWidth + minGap + (Math.random() * 100);
            } else {
                currentX += 100;
            }
        }

        if (this.enemyManager) {
            const hasHigh = obstaclesOnThisPlatform.some(o => o.type === 'high');
            let groundEnemyX: number | null = null;
            const safeStartBuffer = 500;
            const safeRunX = x + safeStartBuffer;
            const safeEndX = (x + width) - edgeBuffer;

            if (safeRunX < safeEndX) {
                const safeWidth = safeEndX - safeRunX;
                const safeMidX = safeRunX + (safeWidth / 2);

                if (obstaclesOnThisPlatform.length === 0 && Math.random() < 0.5) {
                    const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                    const cfg = GAME_CONFIG.ENEMY_CONFIG.BLUE as any;
                    let spawnY = groundY - (cfg.height / 2);
                    if (cfg.spawnHeightOffset) spawnY -= cfg.spawnHeightOffset;
                    this.enemyManager.spawnEnemyAt('BLUE', safeMidX, spawnY);
                    groundEnemyX = safeMidX;
                }
                else if (!hasHigh && Math.random() < 0.6) {
                    for (let k = 0; k < 3; k++) {
                        const testX = this.randomRange(safeRunX, safeEndX);
                        const safeDistanceForRed = 550;
                        const isSafe = !obstaclesOnThisPlatform.some(o => Math.abs(o.x - testX) < safeDistanceForRed);

                        if (isSafe) {
                            this.enemyManager.spawnEnemyAt('RED', testX, GAME_CONFIG.height - GAME_CONFIG.platformHeight - 25);
                            groundEnemyX = testX;
                            break;
                        }
                    }
                }
            }

            if (Math.random() < 0.4) {
                const yellowSafeDist = 300;

                for (let retry = 0; retry < 5; retry++) {
                    const spawnX = this.randomRange(x + edgeBuffer, x + width - edgeBuffer);
                    const distToObstacles = obstaclesOnThisPlatform.every(o => Math.abs(o.x - spawnX) >= yellowSafeDist);
                    const distToGroundEnemy = groundEnemyX === null || Math.abs(groundEnemyX - spawnX) >= yellowSafeDist;

                    if (distToObstacles && distToGroundEnemy) {
                        const cfg = GAME_CONFIG.ENEMY_CONFIG.YELLOW as any;
                        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                        const spawnY = groundY - cfg.flyHeight;
                        this.enemyManager.spawnEnemyAt('YELLOW', spawnX, spawnY);
                        break;
                    }
                }
            }
        }

        return x + width;
    }

    public update(delta: number, worldSpeed: number, enemyManager?: EnemyManager, gameState?: React.MutableRefObject<any>) {
        if (enemyManager && !this.enemyManager) this.enemyManager = enemyManager;
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            const plat = this.platforms[i];
            Matter.Body.translate(plat.body, { x: -worldSpeed * delta, y: 0 });
            plat.sprite.x = plat.body.position.x - (plat.sprite.width / 2);

            if (plat.sprite.x + plat.sprite.width < -200) {
                this.app.stage.removeChild(plat.sprite);
                Matter.World.remove(this.engine.world, plat.body);
                this.platforms.splice(i, 1);
            }
        }
        const now = Date.now();
        for (let i = this.movingPlatforms.length - 1; i >= 0; i--) {
            const p = this.movingPlatforms[i];
            p.baseX -= worldSpeed * delta;
            const waveY = Math.sin((now + p.timeOffset) * GAME_CONFIG.szolaMoveSpeed) * GAME_CONFIG.szolaMoveRange;
            const newY = p.initialY + waveY;
            Matter.Body.setPosition(p.body, {
                x: p.baseX,
                y: newY + GAME_CONFIG.szolaHitboxOffsetY
            });
            p.sprite.x = p.baseX + GAME_CONFIG.szolaVisualOffsetX;
            p.sprite.y = newY + GAME_CONFIG.szolaVisualOffsetY;

            if (p.sprite.x < -200) {
                this.app.stage.removeChild(p.sprite);
                Matter.World.remove(this.engine.world, p.body);
                this.movingPlatforms.splice(i, 1);
            }
        }

        let rightmostX = -1000;
        this.platforms.forEach(p => {
            const rightEdge = p.body.position.x + (p.sprite.width / 2);
            if (rightEdge > rightmostX) rightmostX = rightEdge;
        });

        if (rightmostX === -1000) rightmostX = GAME_CONFIG.width;
        this.lastPlatformEndX = rightmostX;

        if (this.lastPlatformEndX < GAME_CONFIG.width + 300) {
            if (gameState && gameState.current.score >= GAME_CONFIG.MOMO_EVENT.triggerCoinCount && !gameState.current.hasTriggeredMomo) {
                gameState.current.hasTriggeredMomo = true;
                this.spawnMomoPlatform(this.lastPlatformEndX);
                return;
            }

            const makeGap = Math.random() > 0.3;
            let gapSize = 0;

            if (makeGap) {
                if (Math.random() < 0.2) {
                    const nextStart = this.spawnSzolaGap(this.lastPlatformEndX);
                    const newWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
                    this.createPlatform(nextStart, newWidth);
                    return;
                }

                gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);
                const gapCenterX = this.lastPlatformEndX + (gapSize / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                this.spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
            }

            const newX = this.lastPlatformEndX + gapSize;
            const newWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
            this.createPlatform(newX, newWidth);
        }

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            Matter.Body.translate(obs.body, { x: -worldSpeed * delta, y: 0 });
            obs.sprite.x = obs.body.position.x + (obs.offset?.x || 0);
            obs.sprite.y = obs.body.position.y + (obs.offset?.y || 0);
            if (obs.sprite.x < -100) {
                this.app.stage.removeChild(obs.sprite);
                Matter.World.remove(this.engine.world, obs.body);
                this.obstacles.splice(i, 1);
            }
        }

        for (let i = this.coins.length - 1; i >= 0; i--) {
            const c = this.coins[i];
            Matter.Body.translate(c.body, { x: -worldSpeed * delta, y: 0 });
            c.sprite.x = c.body.position.x;
            c.sprite.y = c.body.position.y;
            if (c.sprite.x < -100) {
                this.app.stage.removeChild(c.sprite);
                Matter.World.remove(this.engine.world, c.body);
                this.coins.splice(i, 1);
            }
        }
    }

    public spawnObstacleAt(x: number, isHigh: boolean, forceType: 'meta' | null = null) {
        const type = isHigh ? 'obstacle_high' : 'obstacle_low';
        const groundLevelY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
        let sprite: PIXI.Container;
        let bodyWidth = 40;
        let bodyHeight = 40;
        let bodyY = groundLevelY - bodyHeight;

        if (!isHigh) {
            const rand = Math.random();
            let spawnedType = 'barrel';

            if (this.textures.kafelok && rand < 0.25) spawnedType = 'kafelok';
            else if (this.textures.bum && rand < 0.5) spawnedType = 'bum';
            else if (this.textures.opony && rand < 0.75) spawnedType = 'opony';

            if (spawnedType === 'kafelok') {
                const kafelok = new PIXI.Sprite(this.textures.kafelok);
                kafelok.scale.set(GAME_CONFIG.kafelokScale);
                kafelok.anchor.set(0.5, 1.0);
                kafelok.x = x + GAME_CONFIG.kafelokVisualOffsetX;
                kafelok.y = groundLevelY + GAME_CONFIG.kafelokVisualOffsetY;
                kafelok.zIndex = 3;
                sprite = kafelok;

                bodyWidth = GAME_CONFIG.kafelokHitboxWidth;
                bodyHeight = GAME_CONFIG.kafelokHitboxHeight;
                bodyY = groundLevelY - (bodyHeight / 2) + GAME_CONFIG.kafelokHitboxOffsetY;

            } else if (spawnedType === 'bum') {
                const bum = new PIXI.Sprite(this.textures.bum);
                bum.scale.set(GAME_CONFIG.bumScale);
                bum.anchor.set(0.5, 1.0);
                bum.x = x + GAME_CONFIG.bumVisualOffsetX;
                bum.y = groundLevelY + GAME_CONFIG.bumVisualOffsetY;
                bum.zIndex = 3;
                sprite = bum;

                bodyWidth = GAME_CONFIG.bumHitboxWidth;
                bodyHeight = GAME_CONFIG.bumHitboxHeight;
                bodyY = groundLevelY - (bodyHeight / 2) + GAME_CONFIG.bumHitboxOffsetY;

            } else if (spawnedType === 'opony') {
                const opony = new PIXI.Sprite(this.textures.opony);
                opony.scale.set(GAME_CONFIG.oponyScale);
                opony.anchor.set(0.5, 1.0);
                opony.x = x + GAME_CONFIG.oponyVisualOffsetX;
                opony.y = groundLevelY + GAME_CONFIG.oponyVisualOffsetY;
                opony.zIndex = 3;
                sprite = opony;
                bodyWidth = GAME_CONFIG.oponyHitboxWidth;
                bodyHeight = GAME_CONFIG.oponyHitboxHeight;
                bodyY = groundLevelY - (bodyHeight / 2) + GAME_CONFIG.oponyHitboxOffsetY;
            } else if (this.animations && this.animations.barrel) {
                const barrel = new PIXI.AnimatedSprite(this.animations.barrel);
                barrel.animationSpeed = 0.15;
                barrel.play();

                barrel.scale.set(GAME_CONFIG.barrelScale);
                barrel.anchor.set((GAME_CONFIG as any).barrelAnchorX || 0.4, (GAME_CONFIG as any).barrelAnchorY || 0.72);

                barrel.x = x + GAME_CONFIG.barrelVisualOffsetX;
                barrel.y = groundLevelY + GAME_CONFIG.barrelVisualOffsetY;

                barrel.zIndex = 3;
                sprite = barrel;

                bodyWidth = GAME_CONFIG.barrelHitboxWidth;
                bodyHeight = GAME_CONFIG.barrelHitboxHeight;
                bodyY = groundLevelY - (GAME_CONFIG.barrelHitboxHeight / 2) + GAME_CONFIG.barrelHitboxOffsetY;
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 40, 40).fill(0xff0000);
                g.x = x; g.y = groundLevelY - 20; sprite = g;
            }
            let coinJumpHeight: number = GAME_CONFIG.coinLowObsHeight;
            if (spawnedType === 'kafelok') {
                coinJumpHeight = GAME_CONFIG.kafelokCoinJumpHeight;
            }

            this.spawnCoinGroup(x, bodyY, coinJumpHeight, 'jump');
        } else {
            const useMeta = forceType === 'meta' || (!forceType && Math.random() > 0.5);

            if (useMeta && this.textures.meta) {
                const meta = new PIXI.Sprite(this.textures.meta);
                meta.anchor.set(0.5, 0.5);
                meta.scale.set(GAME_CONFIG.metaScale);
                meta.x = x + GAME_CONFIG.metaVisualOffsetX;
                meta.y = groundLevelY + GAME_CONFIG.metaVisualOffsetY;
                meta.zIndex = 3;
                sprite = meta;

                bodyWidth = GAME_CONFIG.metaHitboxWidth;
                bodyHeight = GAME_CONFIG.metaHitboxHeight;
                bodyY = groundLevelY + GAME_CONFIG.metaHitboxOffsetY;

            } else if (!useMeta && this.textures.klopsztanga) {
                const cb = new PIXI.Sprite(this.textures.klopsztanga);
                cb.anchor.set(0.5, 1.0); cb.scale.set(GAME_CONFIG.klopsztangaScale);
                cb.x = x + GAME_CONFIG.klopsztangaVisualOffsetX;
                cb.y = groundLevelY + GAME_CONFIG.klopsztangaVisualOffsetY;
                cb.zIndex = 1.5; sprite = cb;

                bodyWidth = GAME_CONFIG.klopsztangaHitboxWidth;
                bodyHeight = GAME_CONFIG.klopsztangaHitboxHeight;
                bodyY = groundLevelY + GAME_CONFIG.klopsztangaHitboxOffsetY;
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 50, 120).fill(0x0000ff);
                g.x = x; g.y = groundLevelY; sprite = g;

                bodyWidth = GAME_CONFIG.klopsztangaHitboxWidth;
                bodyHeight = GAME_CONFIG.klopsztangaHitboxHeight;
                bodyY = groundLevelY + GAME_CONFIG.klopsztangaHitboxOffsetY;
            }

            this.spawnCoinGroup(x, groundLevelY, GAME_CONFIG.coinSlideHeight, 'slide');
        }

        this.app.stage.addChild(sprite);
        let hitboxX = x;
        const isMeta = sprite instanceof PIXI.Sprite && sprite.texture === this.textures.meta;

        if (isHigh && !isMeta) hitboxX += GAME_CONFIG.klopsztangaHitboxOffsetX;
        else if (isHigh && isMeta) hitboxX += GAME_CONFIG.metaHitboxOffsetX;
        if (isHigh && !isMeta) hitboxX += GAME_CONFIG.klopsztangaHitboxOffsetX;
        else if (isHigh && isMeta) hitboxX += GAME_CONFIG.metaHitboxOffsetX;
        else if (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) hitboxX += GAME_CONFIG.oponyHitboxOffsetX;
        else if (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.bum) hitboxX += GAME_CONFIG.bumHitboxOffsetX;

        const body = Matter.Bodies.rectangle(hitboxX, bodyY, bodyWidth, bodyHeight, { isSensor: true, label: type });
        Matter.World.add(this.engine.world, body);

        let offset = { x: 0, y: 0 };
        if (sprite && body) {
            offset = { x: sprite.x - body.position.x, y: sprite.y - body.position.y };
        }

        this.obstacles.push({ sprite, body, offset, type: isHigh ? 'high' : 'low' });
    }

    public spawnMomoPlatform(startX: number) {
        const cfg = GAME_CONFIG.MOMO_EVENT;
        const platformWidth = cfg.platformWidth;
        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
        const endX = this.createPlatform(startX, platformWidth, 'ground', true);
        this.lastPlatformEndX = endX;
        const centerX = startX + (platformWidth / 2);

        if (this.textures.serce_tattoo) {
            const shop = new PIXI.Sprite(this.textures.serce_tattoo);
            shop.anchor.set(0.5, 1.0);
            shop.scale.set(cfg.shopScale);
            shop.x = centerX + cfg.shopOffsetX;
            shop.y = groundY + cfg.shopOffsetY;
            shop.zIndex = 1.5;
            this.app.stage.addChild(shop);

            const shopBody = Matter.Bodies.rectangle(centerX + cfg.shopOffsetX, groundY - 100, 1, 1, {
                isStatic: true, isSensor: true, label: 'momo_decor'
            });
            Matter.World.add(this.engine.world, shopBody);
            this.obstacles.push({ sprite: shop, body: shopBody, offset: { x: shop.x - shopBody.position.x, y: shop.y - shopBody.position.y } });
        }

        if (this.animations.momo && this.animations.momo.length > 0) {
            const momo = new PIXI.AnimatedSprite(this.animations.momo);
            momo.anchor.set(0.5, 1.0);
            momo.scale.set(cfg.momoScale);
            momo.x = centerX + cfg.momoOffsetX;
            momo.y = groundY + cfg.momoOffsetY;
            momo.zIndex = 3;
            momo.animationSpeed = 0.08;
            momo.play();
            this.app.stage.addChild(momo);

            const momoBody = Matter.Bodies.rectangle(centerX + cfg.momoOffsetX, groundY - 50, 1, 1, {
                isStatic: true, isSensor: true, label: 'momo_decor'
            });
            Matter.World.add(this.engine.world, momoBody);
            this.obstacles.push({ sprite: momo, body: momoBody, offset: { x: momo.x - momoBody.position.x, y: momo.y - momoBody.position.y } });
        }


        const sensorX = startX + cfg.modalTriggerDistance;
        const sensorY = groundY - 40;
        const sensorBody = Matter.Bodies.rectangle(sensorX, sensorY, 60, 80, {
            isStatic: true,
            isSensor: true,
            label: 'momo_sensor'
        });
        Matter.World.add(this.engine.world, sensorBody);

        const sensorSprite = new PIXI.Graphics();
        sensorSprite.x = sensorX;
        sensorSprite.y = sensorY;
        this.obstacles.push({ sprite: sensorSprite, body: sensorBody, offset: { x: 0, y: 0 }, type: 'momo_sensor' });
    }

    private createCollectible(x: number, y: number) {
        let sprite: PIXI.Container;
        if (this.animations && this.animations.kluska) {
            const kluska = new PIXI.AnimatedSprite(this.animations.kluska);
            kluska.animationSpeed = GAME_CONFIG.kluskaAnimationSpeed;
            kluska.play(); kluska.scale.set(GAME_CONFIG.kluskaScale);
            kluska.anchor.set(0.5); kluska.x = x; kluska.y = y;
            sprite = kluska;
        } else {
            const graphics = new PIXI.Graphics();
            graphics.circle(0, 0, GAME_CONFIG.coinSize / 2).fill(0xFFD700);
            sprite = graphics;
        }
        sprite.zIndex = 3;
        this.app.stage.addChild(sprite);
        const body = Matter.Bodies.circle(x, y, GAME_CONFIG.kluskaHitbox, { isSensor: true, isStatic: true, label: 'coin' });
        Matter.World.add(this.engine.world, body);
        this.coins.push({ sprite, body, collected: false });
    }

    public spawnCoinGroup(centerX: number, refY: number, heightOffset: number, type: 'jump' | 'slide') {
        if (Math.random() > GAME_CONFIG.coinSpawnChance) return;
        const count = Math.floor(Math.random() * GAME_CONFIG.maxCoinGroupSize) + 1;
        const spacing = GAME_CONFIG.coinSpacing;
        const curve = GAME_CONFIG.coinArcCurve;
        const centerIndex = (count - 1) / 2;

        for (let k = 0; k < count; k++) {
            const xOffset = (k - centerIndex) * spacing;
            let yPos = refY - heightOffset;
            if (type === 'jump' && count >= 3) {
                const distFromCenter = Math.abs(k - centerIndex);
                yPos += distFromCenter * curve;
            }
            this.createCollectible(centerX + xOffset, yPos);
        }
    }

    public removeCoin(coinBody: Matter.Body) {
        const index = this.coins.findIndex(c => c.body === coinBody);
        if (index !== -1) {
            const c = this.coins[index];
            this.app.stage.removeChild(c.sprite);
            Matter.World.remove(this.engine.world, c.body);
            this.coins.splice(index, 1);
        }
    }

    public cleanup() {
        this.obstacles.forEach(o => Matter.World.remove(this.engine.world, o.body));
        this.platforms.forEach(p => Matter.World.remove(this.engine.world, p.body));
        this.movingPlatforms.forEach(p => Matter.World.remove(this.engine.world, p.body));
        this.coins.forEach(c => Matter.World.remove(this.engine.world, c.body));
        this.obstacles = []; this.platforms = []; this.coins = []; this.movingPlatforms = [];
    }
}