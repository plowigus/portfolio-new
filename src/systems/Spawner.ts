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
    private forceSpawnX: number | null = null;

    // We need EnemyManager to trigger spawns
    private enemyManager: EnemyManager | null = null;

    constructor(engine: Matter.Engine, app: PIXI.Application, textures: Record<string, PIXI.Texture>, animations: Record<string, PIXI.Texture[]>) {
        this.engine = engine;
        this.app = app;
        this.textures = textures;
        this.animations = animations;
        this.lastPlatformEndX = GAME_CONFIG.width; // Start a bit ahead
    }

    public setEnemyManager(em: EnemyManager) {
        this.enemyManager = em;
    }

    public initPlatforms() {
        this.createPlatform(0, GAME_CONFIG.width * 2, 'ground', true);
    }

    private randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    // --- PLATFORMS & TACTICAL SPAWNING ---
    public createPlatform(x: number, width: number, label: string = 'ground', safe: boolean = false): number {
        const height = GAME_CONFIG.platformHeight;
        const y = GAME_CONFIG.height - 50;

        // 1. Create Platform
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

        const platformStart = x;
        const platformEnd = x + width;

        // If safe, do NOT spawn obstacles or enemies
        if (safe) {
            return x + width;
        }

        // 2. Generate Obstacles (Smart Sequential Algorithm)
        const obstaclesOnThisPlatform: { type: 'low' | 'high', x: number, width: number }[] = [];

        const edgeBuffer = GAME_CONFIG.platformEdgeBuffer;
        const minGap = GAME_CONFIG.obstacleMinGap;

        let startX = platformStart + edgeBuffer;
        const endX = platformEnd - edgeBuffer;
        let currentX = startX;

        while (currentX < endX) {
            // Chance to spawn
            if (Math.random() < 0.4) {
                const isHigh = Math.random() > 0.5;
                const obsWidth = isHigh ? GAME_CONFIG.klopsztangaHitboxWidth : 40; // Approx

                // CRITICAL CHECK: Does it fit?
                if (currentX + obsWidth > endX) break;

                this.spawnObstacleAt(currentX, isHigh);
                obstaclesOnThisPlatform.push({
                    type: isHigh ? 'high' : 'low',
                    x: currentX,
                    width: obsWidth
                });

                // Advance cursor
                const variance = Math.random() * 100;
                currentX += obsWidth + minGap + variance;
            } else {
                // Skip forward a bit and try again
                currentX += 100;
            }
        }

        // 3. Decide on Enemy Spawn (Smart Logic)
        if (this.enemyManager) {
            const hasHigh = obstaclesOnThisPlatform.some(o => o.type === 'high');

            // BLUE (Chaser) - Only if empty or lots of space
            if (obstaclesOnThisPlatform.length === 0 && Math.random() < 0.5) {
                const midX = platformStart + (width / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                const spawnY = groundY - GAME_CONFIG.ENEMY_CONFIG.BLUE.height / 2;
                this.enemyManager.spawnEnemyAt('BLUE', midX, spawnY);

                // RED (Turret) - Needs safe spot, no High obstacles
            } else if (!hasHigh && Math.random() < 0.6) {
                // Find safe spot
                // Simple logic: If empty, middle. If not, try random and check distance.
                // Better: Find biggest gap.
                // For now, let's try random safety check 3 times.
                for (let k = 0; k < 3; k++) {
                    const testX = this.randomRange(platformStart + edgeBuffer, platformEnd - edgeBuffer);
                    const safeDist = GAME_CONFIG.enemySafeDistance;

                    // Check distance to all obstacles
                    const isSafe = !obstaclesOnThisPlatform.some(o => Math.abs(o.x - testX) < safeDist);

                    if (isSafe) {
                        const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                        const spawnY = groundY - GAME_CONFIG.ENEMY_CONFIG.RED.height / 2;
                        this.enemyManager.spawnEnemyAt('RED', testX, spawnY);
                        break; // Spawned once
                    }
                }

                // YELLOW (Bomber) - Fly over
            } else if (Math.random() < 0.3) {
                const spawnX = this.randomRange(platformStart, platformEnd);
                // Check high obstacles vertical clearance? Yellow flies high (280).
                // High obstacle is ~120 tall. Platform is at bottom.
                // Should be fine, but let's keep x-safety to avoid visual clutter.
                const isSafe = !obstaclesOnThisPlatform.some(o => Math.abs(o.x - spawnX) < 50);

                if (isSafe) {
                    const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                    const spawnY = groundY - GAME_CONFIG.ENEMY_CONFIG.YELLOW.flyHeight;
                    this.enemyManager.spawnEnemyAt('YELLOW', spawnX, spawnY);
                }
            }
        }

        return x + width;
    }

    public spawnObstacleAt(x: number, isHigh: boolean) {
        const type = isHigh ? 'obstacle_high' : 'obstacle_low';
        const groundLevelY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;

        let sprite: PIXI.Container;
        let bodyWidth = 40;
        let bodyHeight = 40;
        let bodyY = groundLevelY - bodyHeight;

        if (!isHigh) {
            // LOW
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
                barrel.animationSpeed = 0.15;
                barrel.play();
                barrel.scale.set(.68);
                barrel.anchor.set(0.4, 0.72);
                barrel.x = x;
                barrel.y = groundLevelY;
                barrel.zIndex = 3;
                sprite = barrel;
                bodyWidth = 30;
                bodyHeight = 40;
                bodyY = groundLevelY - (bodyHeight / 2);
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 40, 40);
                g.fill(0xff0000);
                g.x = x;
                g.y = groundLevelY - 20;
                sprite = g;
            }
            // Coin Jump
            this.spawnCoinGroup(x, bodyY, GAME_CONFIG.coinLowObsHeight, 'jump');

        } else {
            // HIGH
            if (this.textures.klopsztanga) {
                const cb = new PIXI.Sprite(this.textures.klopsztanga);
                cb.anchor.set(0.5, 1.0);
                cb.scale.set(GAME_CONFIG.klopsztangaScale);
                cb.x = x + GAME_CONFIG.klopsztangaVisualOffsetX;
                cb.y = groundLevelY + GAME_CONFIG.klopsztangaVisualOffsetY;
                cb.zIndex = 1.5;
                sprite = cb;
            } else {
                const g = new PIXI.Graphics();
                g.rect(0, 0, 50, 120);
                g.fill(0x0000ff);
                g.x = x;
                g.y = groundLevelY;
                sprite = g;
            }
            bodyWidth = GAME_CONFIG.klopsztangaHitboxWidth;
            bodyHeight = GAME_CONFIG.klopsztangaHitboxHeight;
            bodyY = groundLevelY + GAME_CONFIG.klopsztangaHitboxOffsetY;

            // Coin Slide
            this.spawnCoinGroup(x, groundLevelY, GAME_CONFIG.coinSlideHeight, 'slide');
        }

        this.app.stage.addChild(sprite);

        // Adjust hitbox X if needed
        let hitboxX = x;
        if (isHigh) hitboxX += GAME_CONFIG.klopsztangaHitboxOffsetX;
        else if (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) hitboxX += GAME_CONFIG.oponyHitboxOffsetX;

        const body = Matter.Bodies.rectangle(
            hitboxX,
            bodyY,
            bodyWidth, bodyHeight,
            { isSensor: true, label: type }
        );
        Matter.World.add(this.engine.world, body);

        let offset = { x: 0, y: 0 };
        if (isHigh && this.textures.klopsztanga) {
            offset = { x: sprite.x - body.position.x, y: sprite.y - body.position.y };
        } else if (!isHigh && sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) {
            offset = { x: sprite.x - body.position.x, y: sprite.y - body.position.y };
        }

        this.obstacles.push({ sprite, body, offset, type: isHigh ? 'high' : 'low' });
    }

    // --- COINS (Keep existing logic) ---
    private createCollectible(x: number, y: number) {
        let sprite: PIXI.Container;
        if (this.animations && this.animations.kluska) {
            const kluska = new PIXI.AnimatedSprite(this.animations.kluska);
            kluska.animationSpeed = GAME_CONFIG.kluskaAnimationSpeed;
            kluska.play();
            kluska.scale.set(GAME_CONFIG.kluskaScale);
            kluska.anchor.set(0.5);
            kluska.x = x;
            kluska.y = y;
            sprite = kluska;
        } else {
            const graphics = new PIXI.Graphics();
            graphics.circle(0, 0, GAME_CONFIG.coinSize / 2);
            graphics.fill(0xFFD700);
            sprite = graphics;
        }
        sprite.zIndex = 3;
        this.app.stage.addChild(sprite);

        const body = Matter.Bodies.circle(x, y, GAME_CONFIG.kluskaHitbox, {
            isSensor: true, isStatic: true, label: 'coin'
        });
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

    // --- UPDATE LOOP ---
    public update(delta: number, worldSpeed: number, enemyManager?: EnemyManager) {
        if (enemyManager && !this.enemyManager) this.enemyManager = enemyManager;

        if (worldSpeed <= 0) return;

        // 1. Move/Clean Platforms
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            const plat = this.platforms[i];
            Matter.Body.translate(plat.body, { x: -worldSpeed * delta, y: 0 });
            plat.sprite.x = plat.body.position.x - (plat.sprite.width / 2);

            if (plat.sprite.x + plat.sprite.width < -100) {
                this.app.stage.removeChild(plat.sprite);
                Matter.World.remove(this.engine.world, plat.body);
                this.platforms.splice(i, 1);
            }
        }

        // Generate Terrain
        let rightmostX = -1000;
        this.platforms.forEach(p => {
            const rightEdge = p.body.position.x + (p.sprite.width / 2);
            if (rightEdge > rightmostX) rightmostX = rightEdge;
        });

        // First run init check
        if (rightmostX === -1000) rightmostX = GAME_CONFIG.width;

        if (this.forceSpawnX !== null) {
            rightmostX = this.forceSpawnX;
            this.forceSpawnX = null;
        }

        this.lastPlatformEndX = rightmostX;

        // Spawn new Platform if needed
        if (rightmostX < GAME_CONFIG.width + 200) {
            const makeGap = Math.random() > 0.3;
            let gapSize = 0;

            if (makeGap) {
                gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);
                // Coins in gap
                const gapCenterX = rightmostX + (gapSize / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                this.spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
            }

            const newX = rightmostX + gapSize;
            const newWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
            this.createPlatform(newX, newWidth);
        }

        // 2. Move/Clean Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            Matter.Body.translate(obs.body, { x: -worldSpeed * delta, y: 0 });
            if (obs.offset) {
                obs.sprite.x = obs.body.position.x + obs.offset.x;
                obs.sprite.y = obs.body.position.y + obs.offset.y;
            } else {
                obs.sprite.x = obs.body.position.x;
                obs.sprite.y = obs.body.position.y;
            }
            if (obs.sprite.x < -100) {
                this.app.stage.removeChild(obs.sprite);
                Matter.World.remove(this.engine.world, obs.body);
                this.obstacles.splice(i, 1);
            }
        }

        // 3. Move/Clean Coins
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

    public removeCoin(coinBody: Matter.Body) {
        const index = this.coins.findIndex(c => c.body === coinBody);
        if (index !== -1) {
            const c = this.coins[index];
            this.app.stage.removeChild(c.sprite);
            Matter.World.remove(this.engine.world, c.body);
            this.coins.splice(index, 1);
        }
    }

    public resetSpawnPosition(x: number) {
        this.forceSpawnX = x;
    }

    public cleanup() {
        this.obstacles.forEach(o => Matter.World.remove(this.engine.world, o.body));
        this.platforms.forEach(p => Matter.World.remove(this.engine.world, p.body));
        this.coins.forEach(c => Matter.World.remove(this.engine.world, c.body));
        this.obstacles = [];
        this.platforms = [];
        this.coins = [];
    }
}
