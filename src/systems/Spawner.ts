import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';

export interface GameObject {
    sprite: PIXI.Container;
    body: Matter.Body;
    offset?: { x: number, y: number }; // Optional offset for visual decoupling
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

    // Timers
    public spawnTimer: number = 0;
    public currentSpawnDelay: number = 0;
    public lastPlatformEndX: number = 0;
    private forceSpawnX: number | null = null;

    constructor(engine: Matter.Engine, app: PIXI.Application, textures: Record<string, PIXI.Texture>, animations: Record<string, PIXI.Texture[]>) {
        this.engine = engine;
        this.app = app;
        this.textures = textures;
        this.animations = animations;
        this.currentSpawnDelay = this.randomRange(GAME_CONFIG.spawnMinTime, GAME_CONFIG.spawnMaxTime);
    }

    private randomRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    // --- PLATFORMS ---
    public createPlatform(x: number, width: number, label: string = 'ground'): number {
        const height = GAME_CONFIG.platformHeight;
        const y = GAME_CONFIG.height - 50;

        // Use TilingSprite for textured floor
        const sprite = new PIXI.TilingSprite({
            texture: this.textures.floor,
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
            { isStatic: true, label: label, friction: 0 }
        );
        Matter.World.add(this.engine.world, body);
        this.platforms.push({ sprite: sprite, body: body });

        return x + width;
    }

    public initPlatforms() {
        this.lastPlatformEndX = this.createPlatform(-50, GAME_CONFIG.width + 400);
    }

    public resetSpawnPosition(x: number) {
        // Usuwamy wszystkie stare platformy, które są daleko za ekranem
        this.platforms = this.platforms.filter(p => p.body.position.x > x - 2000);

        // Ustawiamy wymuszony punkt startu dla nowej platformy
        this.forceSpawnX = x;

        console.log(`🔄 Spawner reset to X: ${x}`);
    }

    // --- COINS ---
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
            // Fallback
            const graphics = new PIXI.Graphics();
            graphics.circle(0, 0, GAME_CONFIG.coinSize / 2);
            graphics.fill(0xFFD700);
            graphics.stroke({ width: 2, color: 0xFFAA00 });
            graphics.x = x;
            graphics.y = y;
            sprite = graphics;
        }

        sprite.zIndex = 3;
        this.app.stage.addChild(sprite);

        const body = Matter.Bodies.circle(x, y, GAME_CONFIG.kluskaHitbox, {
            isSensor: true,
            isStatic: true,
            label: 'coin' // Keeping label 'coin' to ensure collision logic works
        });

        Matter.World.add(this.engine.world, body);
        this.coins.push({ sprite: sprite, body: body, collected: false });
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

            this.createCollectible(centerX + xOffset, yPos);
        }
    }

    // --- OBSTACLES ---
    private spawnObstacle() {
        const isHighObstacle = Math.random() > 0.5;
        const type = isHighObstacle ? 'obstacle_high' : 'obstacle_low';

        // Wyliczamy poziom podłogi (góra szarego klocka/tekstury)
        const groundLevelY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;

        let sprite: PIXI.Container;
        let bodyWidth = 40;
        let bodyHeight = 40; // Wysokość hitboxa

        const startX = GAME_CONFIG.width + 100;

        // Domyślna pozycja Y dla hitboxa (środek)
        let bodyY = groundLevelY - (bodyHeight);

        if (!isHighObstacle) {
            // --- LOW OBSTACLE: BARREL or TIRES (Opony) ---
            const spawnOpony = Math.random() > 0.5;

            if (spawnOpony && this.textures.opony) {
                // --- TIRES (Opony) ---
                const opony = new PIXI.Sprite(this.textures.opony);
                opony.scale.set(GAME_CONFIG.oponyScale);
                opony.anchor.set(0.5, 1.0); // Bottom Center

                // Visual Position with offsets
                opony.x = startX + GAME_CONFIG.oponyVisualOffsetX;
                opony.y = groundLevelY + GAME_CONFIG.oponyVisualOffsetY;

                opony.zIndex = 3;
                sprite = opony;

                // Hitbox Logic - Opony
                bodyWidth = GAME_CONFIG.oponyHitboxWidth;
                bodyHeight = GAME_CONFIG.oponyHitboxHeight;

                // Hitbox Position (Matter bodies are centered)
                // Start at ground, move up by half height, apply offset
                bodyY = groundLevelY - (bodyHeight / 2) + GAME_CONFIG.oponyHitboxOffsetY;

                // Apply horizontal hitbox offset to startX later in body creation if needed?
                // Actually body creation uses startX. We need to adjust startX here if we want hitbox offset X.
                // But wait, body creation below uses `startX + GAME_CONFIG.klopsztangaHitboxOffsetX`.
                // We should make the body creation generic or handle the X offset there.
                // For now, let's just rely on body creation using startX and we might need to adjust it there.

                // Let's refactor the body creation slightly to handle variable X offsets if possible, 
                // or just pass a specific X to body creation.
                // The current code below uses `startX + GAME_CONFIG.klopsztangaHitboxOffsetX`. 
                // We need to change that to be generic.

            } else if (this.animations && this.animations.barrel) {
                // --- BARREL ---
                const barrel = new PIXI.AnimatedSprite(this.animations.barrel);
                barrel.animationSpeed = 0.15;
                barrel.play();

                // 🛠️ POPRAWKA 1: SKALA
                // Skoro obrazek ma 400px, to scale(3) robi 1200px! Musimy go zmniejszyć.
                // Celujemy w ok. 60-80px wysokości wizualnej.
                // 400px * 0.2 = 80px.
                barrel.scale.set(.68);

                // 🛠️ POPRAWKA 2: KOTWICA NA DOLE
                // (0.5, 1) oznacza: środek w poziomie, spód w pionie.
                barrel.anchor.set(0.4, 0.72);

                // 🛠️ POPRAWKA 3: POZYCJA
                // Skoro kotwica jest na spodzie, stawiamy go idealnie na poziomie podłogi
                barrel.x = startX;
                barrel.y = groundLevelY;

                barrel.zIndex = 3;
                sprite = barrel;

                // Hitbox zostaje standardowy (mały kwadrat u podstawy beczki)
                bodyWidth = 30;
                bodyHeight = 40;
                // Hitbox musi być w połowie swojej wysokości nad ziemią
                bodyY = groundLevelY - (bodyHeight / 2);

            } else {
                // Fallback jeśli nie ma animacji
                const g = new PIXI.Graphics();
                g.rect(0, 0, 40, 40);
                g.fill(0xff0000);
                g.x = startX;
                g.y = groundLevelY - 20; // Środek
                g.pivot.set(20, 20);
                sprite = g;
            }

        } else {
            // --- WYSOKA PRZESZKODA (KLOPSZTANGA) ---
            const klopsztangaTex = this.textures.klopsztanga;

            if (klopsztangaTex) {
                const carpetBeater = new PIXI.Sprite(klopsztangaTex);
                carpetBeater.anchor.set(0.5, 1.0); // Bottom Center
                carpetBeater.scale.set(GAME_CONFIG.klopsztangaScale);

                // Position with Visual Offsets
                carpetBeater.x = startX + GAME_CONFIG.klopsztangaVisualOffsetX;
                carpetBeater.y = groundLevelY + GAME_CONFIG.klopsztangaVisualOffsetY;

                carpetBeater.zIndex = 1.5;

                sprite = carpetBeater;
            } else {
                // Fallback
                const graphics = new PIXI.Graphics();
                graphics.rect(0, 0, 50, 120);
                graphics.fill(0x0000ff);
                graphics.x = startX;
                graphics.y = groundLevelY;
                graphics.pivot.set(25, 120);
                graphics.zIndex = 3;
                sprite = graphics;
            }

            // Hitbox Logic - Carpet part only
            bodyWidth = GAME_CONFIG.klopsztangaHitboxWidth;
            bodyHeight = GAME_CONFIG.klopsztangaHitboxHeight;

            // Offset calculation:
            bodyY = groundLevelY + GAME_CONFIG.klopsztangaHitboxOffsetY;
        }

        this.app.stage.addChild(sprite);

        // Calculate Hitbox X Position
        let hitboxX = startX;
        if (isHighObstacle) {
            hitboxX += GAME_CONFIG.klopsztangaHitboxOffsetX;
        } else {
            // For low obstacles (Barrel/Opony), we might have different offsets.
            // Currently Barrel uses 0 implicit offset (startX).
            // Opony uses GAME_CONFIG.oponyHitboxOffsetX.
            // We need to know which one we spawned. 
            // Ideally we'd store the type or offset earlier.
            // But simpler: if sprite texture is opony, use opony offset?
            // Or just check if we set up Opony params.
            // Let's assume if it's NOT high obstacle, check if it's opony.
            // But we don't have an easy flag here 'isOpony'.
            // Let's rely on standard 0 for barrel and add opony offset if needed?
            // Actually, `startX` was used for Barrel.
            // Let's just use a default 0 and add specific offset if we spawned Opony.
            // Hacky check: 
            if (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony) {
                hitboxX += GAME_CONFIG.oponyHitboxOffsetX;
            }
        }

        const body = Matter.Bodies.rectangle(
            hitboxX,
            bodyY,
            bodyWidth, bodyHeight,
            { isSensor: true, label: type }
        );

        Matter.World.add(this.engine.world, body);

        let offset = { x: 0, y: 0 };
        const isOpony = (sprite instanceof PIXI.Sprite && sprite.texture === this.textures.opony);

        if ((isHighObstacle && this.textures.klopsztanga) || isOpony) {
            offset = {
                x: sprite.x - body.position.x,
                y: sprite.y - body.position.y
            };
        }

        this.obstacles.push({ sprite: sprite, body: body, offset: offset });

        // Coiny (always slide for Klopsztanga)
        if (isHighObstacle) {
            this.spawnCoinGroup(startX, groundLevelY, GAME_CONFIG.coinSlideHeight, 'slide');
        } else {
            // Coin nad beczką
            this.spawnCoinGroup(startX, bodyY, GAME_CONFIG.coinLowObsHeight, 'jump');
        }
    }

    // --- UPDATE LOOP ---
    public update(delta: number, worldSpeed: number, gameState: any) {
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
        // Generate Terrain
        // Find rightmost platform edge
        let rightmostX = -1000;
        this.platforms.forEach(p => {
            const rightEdge = p.body.position.x + (p.sprite.width / 2);
            if (rightEdge > rightmostX) rightmostX = rightEdge;
        });

        // Use forced spawn position if set
        if (this.forceSpawnX !== null) {
            rightmostX = this.forceSpawnX;
            this.forceSpawnX = null;
        }

        // Sync lastPlatformEndX for compatibility (though we use rightmostX now)
        this.lastPlatformEndX = rightmostX;

        if (rightmostX < GAME_CONFIG.width + 100) {
            const makeGap = Math.random() > 0.3;
            let gapSize = 0;

            if (gameState.isArenaPending) {
                // --- SPAWN ARENA PLATFORM ---
                gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);
                const newPlatformX = rightmostX + gapSize;

                console.log("🏰 SPAWNING ARENA PLATFORM!");
                this.createPlatform(newPlatformX, GAME_CONFIG.arenaPlatformWidth, 'arena-ground');

                // Reset triggers
                gameState.isArenaPending = false;
                gameState.kluskiCollectedInCycle = 0;

            } else if (!gameState.isArenaActive) {
                // --- NORMAL PLATFORM ---
                if (makeGap) {
                    gapSize = this.randomRange(GAME_CONFIG.minGap, GAME_CONFIG.maxGap);

                    // Spawn coins in gap
                    const gapCenterX = rightmostX + (gapSize / 2);
                    const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                    this.spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
                }

                const newPlatformX = rightmostX + gapSize;
                const newPlatformWidth = this.randomRange(GAME_CONFIG.minPlatformWidth, GAME_CONFIG.maxPlatformWidth);
                this.createPlatform(newPlatformX, newPlatformWidth);
            }
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
                    if (plat.body.label !== 'arena-ground') {
                        isSafeToSpawn = true;
                    }
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

            if (obs.offset && (obs.offset.x !== 0 || obs.offset.y !== 0)) {
                obs.sprite.x = obs.body.position.x + obs.offset.x;
                obs.sprite.y = obs.body.position.y + obs.offset.y;
            } else {
                obs.sprite.x = obs.body.position.x;
                obs.sprite.y = obs.body.position.y;
            }

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
