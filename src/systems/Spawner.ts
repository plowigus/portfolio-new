import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';
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

export class SpawnerSystem {
    private engine: Matter.Engine;
    private app: PIXI.Application;
    private textures: Record<string, PIXI.Texture>;
    private animations: Record<string, PIXI.Texture[]>;

    public obstacles: GameObject[] = [];
    public platforms: GameObject[] = [];
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
        const startWidth = 1200;
        this.createPlatform(0, startWidth, 'ground', true);
        this.lastPlatformEndX = startWidth;
    }

    private randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
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
            let groundEnemyX: number | null = null; // Śledzenie pozycji wroga naziemnego

            // 1. Naziemni (BLUE lub RED)
            if (obstaclesOnThisPlatform.length === 0 && Math.random() < 0.5) {
                const midX = x + (width / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                const cfg = GAME_CONFIG.ENEMY_CONFIG.BLUE as any;
                let spawnY = groundY - (cfg.height / 2);
                if (cfg.spawnHeightOffset) spawnY -= cfg.spawnHeightOffset;
                this.enemyManager.spawnEnemyAt('BLUE', midX, spawnY);
                groundEnemyX = midX;
            }
            else if (!hasHigh && Math.random() < 0.6) {
                for (let k = 0; k < 3; k++) {
                    const testX = this.randomRange(x + edgeBuffer, x + width - edgeBuffer);
                    const isSafe = !obstaclesOnThisPlatform.some(o => Math.abs(o.x - testX) < GAME_CONFIG.enemySafeDistance);
                    if (isSafe) {
                        this.enemyManager.spawnEnemyAt('RED', testX, GAME_CONFIG.height - GAME_CONFIG.platformHeight - 25);
                        groundEnemyX = testX;
                        break;
                    }
                }
            }

            // 2. Latający (YELLOW) z nowymi restrykcjami dystansu
            if (Math.random() < 0.4) {
                const yellowSafeDist = 300; // Minimalny dystans 300px

                for (let retry = 0; retry < 5; retry++) {
                    const spawnX = this.randomRange(x + edgeBuffer, x + width - edgeBuffer);

                    // Sprawdzanie dystansu od przeszkód
                    const distToObstacles = obstaclesOnThisPlatform.every(o => Math.abs(o.x - spawnX) >= yellowSafeDist);

                    // Sprawdzanie dystansu od wroga naziemnego
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

    public update(delta: number, worldSpeed: number, enemyManager?: EnemyManager) {
        if (enemyManager && !this.enemyManager) this.enemyManager = enemyManager;
        if (worldSpeed <= 0) return;

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

        let rightmostX = -1000;
        this.platforms.forEach(p => {
            const rightEdge = p.body.position.x + (p.sprite.width / 2);
            if (rightEdge > rightmostX) rightmostX = rightEdge;
        });

        if (rightmostX === -1000) rightmostX = GAME_CONFIG.width;
        this.lastPlatformEndX = rightmostX;

        if (this.lastPlatformEndX < GAME_CONFIG.width + 300) {
            const makeGap = Math.random() > 0.3;
            let gapSize = 0;

            if (makeGap) {
                gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);
                const gapCenterX = this.lastPlatformEndX + (gapSize / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                this.spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
            }

            const newX = this.lastPlatformEndX + gapSize;
            const newWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
            this.createPlatform(newX, newWidth);
        }

        // Ruch przeszkód i monet
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

    public spawnObstacleAt(x: number, isHigh: boolean) {
        const type = isHigh ? 'obstacle_high' : 'obstacle_low';
        const groundLevelY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
        let sprite: PIXI.Container;
        let bodyWidth = 40;
        let bodyHeight = 40;
        let bodyY = groundLevelY - bodyHeight;

        if (!isHigh) {
            const spawnOpony = Math.random() > 0.5;
            if (spawnOpony && this.textures.opony) {
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
                barrel.animationSpeed = 0.15; barrel.play();
                barrel.scale.set(.68); barrel.anchor.set(0.4, 0.72);
                barrel.x = x; barrel.y = groundLevelY;
                barrel.zIndex = 3; sprite = barrel;
                bodyWidth = 30; bodyHeight = 40;
                bodyY = groundLevelY - (bodyHeight / 2);
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 40, 40).fill(0xff0000);
                g.x = x; g.y = groundLevelY - 20; sprite = g;
            }
            this.spawnCoinGroup(x, bodyY, GAME_CONFIG.coinLowObsHeight, 'jump');
        } else {
            if (this.textures.klopsztanga) {
                const cb = new PIXI.Sprite(this.textures.klopsztanga);
                cb.anchor.set(0.5, 1.0); cb.scale.set(GAME_CONFIG.klopsztangaScale);
                cb.x = x + GAME_CONFIG.klopsztangaVisualOffsetX;
                cb.y = groundLevelY + GAME_CONFIG.klopsztangaVisualOffsetY;
                cb.zIndex = 1.5; sprite = cb;
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 50, 120).fill(0x0000ff);
                g.x = x; g.y = groundLevelY; sprite = g;
            }
            bodyWidth = GAME_CONFIG.klopsztangaHitboxWidth;
            bodyHeight = GAME_CONFIG.klopsztangaHitboxHeight;
            bodyY = groundLevelY + GAME_CONFIG.klopsztangaHitboxOffsetY;
            this.spawnCoinGroup(x, groundLevelY, GAME_CONFIG.coinSlideHeight, 'slide');
        }

        this.app.stage.addChild(sprite);
        let hitboxX = x;
        if (isHigh) hitboxX += GAME_CONFIG.klopsztangaHitboxOffsetX;
        else if (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) hitboxX += GAME_CONFIG.oponyHitboxOffsetX;

        const body = Matter.Bodies.rectangle(hitboxX, bodyY, bodyWidth, bodyHeight, { isSensor: true, label: type });
        Matter.World.add(this.engine.world, body);

        let offset = { x: 0, y: 0 };
        if (isHigh && this.textures.klopsztanga) offset = { x: sprite.x - body.position.x, y: sprite.y - body.position.y };
        else if (!isHigh && sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) offset = { x: sprite.x - body.position.x, y: sprite.y - body.position.y };

        this.obstacles.push({ sprite, body, offset, type: isHigh ? 'high' : 'low' });
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
        this.coins.forEach(c => Matter.World.remove(this.engine.world, c.body));
        this.obstacles = []; this.platforms = []; this.coins = [];
    }
}