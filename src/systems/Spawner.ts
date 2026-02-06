import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';

export interface GameObject {
    sprite: PIXI.Container;
    body: Matter.Body;
}

export interface CoinObject extends GameObject {
    collected: boolean;
}

export class SpawnerSystem {
    private engine: Matter.Engine;
    private app: PIXI.Application;
    private floorTexture: PIXI.Texture;
    private animations: Record<string, PIXI.Texture[]>;

    public obstacles: GameObject[] = [];
    public platforms: GameObject[] = [];
    public coins: CoinObject[] = [];

    // Timers
    public spawnTimer: number = 0;
    public currentSpawnDelay: number = 0;
    public lastPlatformEndX: number = 0;

    constructor(engine: Matter.Engine, app: PIXI.Application, floorTexture: PIXI.Texture, animations: Record<string, PIXI.Texture[]>) {
        this.engine = engine;
        this.app = app;
        this.floorTexture = floorTexture;
        this.animations = animations;
        this.currentSpawnDelay = this.randomRange(GAME_CONFIG.spawnMinTime, GAME_CONFIG.spawnMaxTime);
    }

    private randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    // --- PLATFORMS ---
    public createPlatform(x: number, width: number): number {
        const height = GAME_CONFIG.platformHeight;
        const y = GAME_CONFIG.height - 50;

        // Use TilingSprite for textured floor
        const sprite = new PIXI.TilingSprite({
            texture: this.floorTexture,
            width: width,
            height: height
        });

        // Scale texture to make the pattern smaller (approx 128x128 feel)
        sprite.tileScale.set(3);

        sprite.x = x;
        sprite.y = y;

        // Ensure platforms are behind character (index 0)
        sprite.zIndex = 2;
        this.app.stage.addChild(sprite);

        const body = Matter.Bodies.rectangle(
            x + width / 2,
            y + height / 2,
            width, height,
            { isStatic: true, label: 'ground', friction: 0 }
        );
        Matter.World.add(this.engine.world, body);
        this.platforms.push({ sprite: sprite, body: body });

        return x + width;
    }

    public initPlatforms() {
        this.lastPlatformEndX = this.createPlatform(-50, GAME_CONFIG.width + 400);
    }

    // --- COINS ---
    private createCoin(x: number, y: number) {
        const graphics = new PIXI.Graphics();
        graphics.circle(0, 0, GAME_CONFIG.coinSize / 2);
        graphics.fill(0xFFD700);
        graphics.stroke({ width: 2, color: 0xFFAA00 });
        graphics.x = x;
        graphics.y = y;

        // Add coin before debug/score (2nd to last usually implies under UI)
        // Ideally we use Layers or z-index, but childhood logic: child.length - 2
        // Safe check: length might be small
        graphics.zIndex = 3;
        this.app.stage.addChild(graphics);

        const body = Matter.Bodies.circle(x, y, GAME_CONFIG.coinHitbox / 2, {
            isSensor: true,
            isStatic: true,
            label: 'coin'
        });

        Matter.World.add(this.engine.world, body);
        this.coins.push({ sprite: graphics, body: body, collected: false });
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

            const useArc = (type === 'jump' && count >= 3);
            if (useArc) {
                const distFromCenter = Math.abs(k - centerIndex);
                const drop = distFromCenter * curve;
                yPos += drop;
            }

            this.createCoin(centerX + xOffset, yPos);
        }
    }

    // --- OBSTACLES ---
    private spawnObstacle() {
        const isHighObstacle = Math.random() > 0.5;
        const type = isHighObstacle ? 'obstacle_high' : 'obstacle_low';

        let sprite: PIXI.Container;
        let bodyRadius = 20; // Default half-width for body

        const startX = GAME_CONFIG.width + 100;
        // const groundTopYReference = GAME_CONFIG.height - GAME_CONFIG.platformHeight; // 350
        // const groundTopYReference = GAME_CONFIG.height - 100; // Hardcoded platform height ref or from config if reliable
        // Actually earlier code used GAME_CONFIG.platformHeight (100).
        // Let's stick to using Config.

        const offset = isHighObstacle ? GAME_CONFIG.obstacleHighOffset : GAME_CONFIG.obstacleLowOffset;
        const targetY = (GAME_CONFIG.height - GAME_CONFIG.platformHeight) + offset;

        if (!isHighObstacle) {
            // BARREL (Low)
            const barrel = new PIXI.AnimatedSprite(this.animations.barrel);
            barrel.animationSpeed = 0.15;
            barrel.play();
            barrel.scale.set(GAME_CONFIG.barrelScale);
            barrel.anchor.set(0.5);
            barrel.x = GAME_CONFIG.barrelOffsetX;
            barrel.y = GAME_CONFIG.barrelOffsetY;
            barrel.zIndex = 3;

            sprite = barrel;
            bodyRadius = 20; // 40px width roughly

        } else {
            // FLYING OBSTACLE (High) - Keep as blue retro block for now
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, 50, 50);
            graphics.fill(0x0000ff);
            graphics.x = startX;
            graphics.y = targetY;
            graphics.pivot.set(25, 25);
            graphics.zIndex = 3;

            sprite = graphics;
            bodyRadius = 25;
        }

        this.app.stage.addChild(sprite);

        const body = Matter.Bodies.rectangle(
            startX,
            targetY,
            bodyRadius * 2, bodyRadius * 2,
            { isSensor: true, label: type }
        );
        Matter.World.add(this.engine.world, body);
        this.obstacles.push({ sprite: sprite, body: body });

        // spawn coins with obstacle
        if (isHighObstacle) {
            if (Math.random() > 0.5) {
                this.spawnCoinGroup(startX, (GAME_CONFIG.height - GAME_CONFIG.platformHeight), GAME_CONFIG.coinSlideHeight, 'slide');
            } else {
                this.spawnCoinGroup(startX, targetY, GAME_CONFIG.coinHighJumpHeight, 'jump');
            }
        } else {
            this.spawnCoinGroup(startX, targetY, GAME_CONFIG.coinLowObsHeight, 'jump');
        }
    }

    // --- UPDATE LOOP ---
    public update(delta: number, worldSpeed: number) {
        if (worldSpeed <= 0) return;

        // 1. Update Platforms
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
        this.lastPlatformEndX -= worldSpeed * delta;
        if (this.lastPlatformEndX < GAME_CONFIG.width + 100) {
            const makeGap = Math.random() > 0.3;
            let gapSize = 0;
            if (makeGap) {
                gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);

                // Spawn coins in gap
                const gapCenterX = this.lastPlatformEndX + (gapSize / 2);
                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                this.spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
            }

            const newPlatformX = this.lastPlatformEndX + gapSize;
            const newPlatformWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
            this.lastPlatformEndX = this.createPlatform(newPlatformX, newPlatformWidth);
        }

        // 2. Spawn Obstacles
        this.spawnTimer += delta;
        if (this.spawnTimer >= this.currentSpawnDelay) {
            const spawnX = GAME_CONFIG.width + 50;
            let isSafeToSpawn = false;

            // Check if there is platform under spawnX
            // Logic: iterate platforms, check boundaries with Safe Buffer
            for (const plat of this.platforms) {
                const platStart = plat.body.position.x - (plat.sprite.width / 2);
                const platEnd = plat.body.position.x + (plat.sprite.width / 2);
                const safeStart = platStart + GAME_CONFIG.safeEdgeBuffer;
                const safeEnd = platEnd - GAME_CONFIG.safeEdgeBuffer;

                if (spawnX > safeStart && spawnX < safeEnd) {
                    isSafeToSpawn = true;
                    break;
                }
            }

            if (isSafeToSpawn) {
                this.spawnObstacle();
                this.spawnTimer = 0;
                this.currentSpawnDelay = this.randomRange(GAME_CONFIG.spawnMinTime, GAME_CONFIG.spawnMaxTime);
            } else {
                this.spawnTimer = this.currentSpawnDelay - 10; // retry soon
            }
        }

        // 3. Move Obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            Matter.Body.translate(obs.body, { x: -worldSpeed * delta, y: 0 });
            obs.sprite.x = obs.body.position.x;
            obs.sprite.y = obs.body.position.y;

            if (obs.sprite.x < -50) {
                this.app.stage.removeChild(obs.sprite);
                Matter.World.remove(this.engine.world, obs.body);
                this.obstacles.splice(i, 1);
            }
        }

        // 4. Move Coins
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const coin = this.coins[i];
            Matter.Body.translate(coin.body, { x: -worldSpeed * delta, y: 0 });
            coin.sprite.x = coin.body.position.x;
            coin.sprite.y = coin.body.position.y;

            if (coin.sprite.x < -50) {
                this.app.stage.removeChild(coin.sprite);
                Matter.World.remove(this.engine.world, coin.body);
                this.coins.splice(i, 1);
            }
        }
    }

    public removeCoin(coinBody: Matter.Body) {
        const index = this.coins.findIndex(c => c.body === coinBody);
        if (index !== -1) {
            const coin = this.coins[index];
            this.app.stage.removeChild(coin.sprite);
            Matter.World.remove(this.engine.world, coin.body);
            this.coins.splice(index, 1);
        }
    }

    public cleanup() {
        // Clear all arrays
        this.obstacles.forEach(o => Matter.World.remove(this.engine.world, o.body));
        this.platforms.forEach(p => Matter.World.remove(this.engine.world, p.body));
        this.coins.forEach(c => Matter.World.remove(this.engine.world, c.body));

        this.obstacles = [];
        this.platforms = [];
        this.coins = [];
    }
}
