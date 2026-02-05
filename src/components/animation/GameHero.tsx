"use client";

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';

const GAME_CONFIG = {
    width: 1080,
    height: 450,
    debugMode: false,
    moveSpeed: 6,
    maxMoveSpeed: 12,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.22,
    jumpPower: -12,
    groundY: 450 / 2,
    obstacleSpeed: 5,
    spawnMinTime: 60,
    spawnMaxTime: 150,
    knockbackX: 3,
    knockbackY: -8,
    platformHeight: 100, // Grubość ziemi
    minGap: 240,         // Minimalna dziura
    maxGap: 320,         // Maksymalna dziura (bezpieczna granica to ~400)
    minPlatformWidth: 400,
    maxPlatformWidth: 1000,
    safeEdgeBuffer: 300,
    characterVisualOffset: -15,
    coyoteTime: 6,       // Przez ile klatek po spadnięciu można jeszcze skoczyć (naprawia łączenia klocków)
    jumpBuffer: 8,
    obstacleLowOffset: -45,
    obstacleHighOffset: -50,       // Ile klatek gra pamięta wciśnięcie spacji przed dotknięciem ziemi
    // 🪙 COIN CONFIGURATION (Pełna regulacja)
    coinSize: 30,
    coinHitbox: 20,
    coinSpawnChance: 0.6,    // 60% szans, że monety się pojawią (0.0 - 1.0)
    maxCoinGroupSize: 5,
    coinSpacing: 50,         // Odstęp poziomy między monetami
    coinArcCurve: 20,        // Jak mocno wygięty jest łuk (0 = płaska linia, 20 = ładna górka)

    // Ustawienia wysokości (Y) dla konkretnych sytuacji
    // Wartości oznaczają "ile pikseli nad punktem odniesienia"

    coinGapHeight: 150,      // Nad przepaścią (względem poziomu podłogi)
    coinLowObsHeight: 150,   // Nad czerwoną przeszkodą (względem środka przeszkody)
    coinHighJumpHeight: 140, // Nad niebieską przeszkodą (względem środka przeszkody)
    coinSlideHeight: -10      // Do wślizgu (względem poziomu podłogi - nisko!)
};


export default function GameHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const engineRef = useRef<Matter.Engine | null>(null);

    useEffect(() => {
        // --- ZMIENNE STANU ---
        // let vy = 0;
        let vx = 0;

        let isTouchingGround = false;
        let coyoteTimer = 0;
        let jumpBufferTimer = 0;

        let score = 0;
        let scoreText: PIXI.Text | null = null;

        let currentMoveSpeed = GAME_CONFIG.moveSpeed;

        let isGameOver = false;
        let worldSpeed = 0;

        let spawnTimer = 0;
        let currentSpawnDelay = 0;

        const obstacles: { sprite: PIXI.Graphics, body: Matter.Body }[] = [];
        const platforms: { sprite: PIXI.Graphics, body: Matter.Body }[] = [];
        const coins: { sprite: PIXI.Graphics, body: Matter.Body, collected: boolean }[] = [];

        let lastPlatformEndX = 0;

        const keys: Record<string, boolean> = {};
        let debugGraphics: PIXI.Graphics | null = null;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (isGameOver) return;
            keys[e.code] = true;

            const isJumpKey = e.code === "ArrowUp" || e.code === "KeyW";
            if (isJumpKey) {
                jumpBufferTimer = GAME_CONFIG.jumpBuffer;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const initGame = async () => {
            const app = new PIXI.Application();
            await app.init({
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height,
                backgroundAlpha: 0,
            });
            appRef.current = app;
            if (containerRef.current) containerRef.current.appendChild(app.canvas);

            const style = new PIXI.TextStyle({
                fontFamily: 'Arial',
                fontSize: 36,
                fontWeight: 'bold',
                fill: '#FFD700',
                stroke: { color: '#000000', width: 4 },
                dropShadow: {
                    color: '#000000',
                    blur: 4,
                    angle: Math.PI / 6,
                    distance: 6,
                },
            });

            scoreText = new PIXI.Text({ text: 'COINS: 0', style });
            scoreText.x = 20;
            scoreText.y = 20;
            app.stage.addChild(scoreText);

            debugGraphics = new PIXI.Graphics();
            app.stage.addChild(debugGraphics);

            const engine = Matter.Engine.create();
            engineRef.current = engine;
            engine.gravity.y = 0;

            // --- GRACZ ---
            const playerHitboxWidth = 30;
            const playerHitboxHeight = 80;

            const playerBody = Matter.Bodies.rectangle(
                200,
                0,
                playerHitboxWidth, playerHitboxHeight,
                {
                    isSensor: false,
                    label: 'player',
                    friction: 0,
                    frictionAir: 0,
                    inertia: Infinity
                }
            );
            Matter.World.add(engine.world, playerBody);

            // --- HELPER: CREATE SINGLE COIN ---
            const createCoin = (x: number, y: number) => {
                const graphics = new PIXI.Graphics();
                graphics.circle(0, 0, GAME_CONFIG.coinSize / 2);
                graphics.fill(0xFFD700);
                graphics.stroke({ width: 2, color: 0xFFAA00 });
                graphics.x = x;
                graphics.y = y;

                app.stage.addChildAt(graphics, app.stage.children.length - 2);

                const body = Matter.Bodies.circle(x, y, GAME_CONFIG.coinHitbox / 2, {
                    isSensor: true,
                    isStatic: true,
                    label: 'coin'
                });

                Matter.World.add(engine.world, body);
                coins.push({ sprite: graphics, body: body, collected: false });
            };

            // --- HELPER: SPAWN COIN GROUP (SMART RNG) ---
            // type: 'jump' (domyślnie łuk) lub 'slide' (zawsze linia)
            const spawnCoinGroup = (centerX: number, refY: number, heightOffset: number, type: 'jump' | 'slide') => {

                // 1. CZY W OGÓLE SPAWNUJEMY? (Rzut monetą)
                if (Math.random() > GAME_CONFIG.coinSpawnChance) {
                    return; // Brak monet tym razem
                }

                // 2. ILE MONET? (Losujemy 1 do 5)
                const count = Math.floor(Math.random() * GAME_CONFIG.maxCoinGroupSize) + 1;

                const spacing = GAME_CONFIG.coinSpacing;
                const curve = GAME_CONFIG.coinArcCurve;

                // Obliczamy środek geometryczny grupy, żeby była wycentrowana
                // (count - 1) / 2 działa też dla liczb parzystych (np. dla 4 środek to index 1.5)
                const centerIndex = (count - 1) / 2;

                for (let k = 0; k < count; k++) {
                    // Pozycja X
                    const xOffset = (k - centerIndex) * spacing;

                    // Pozycja Y (Logika kształtu)
                    let yPos = refY - heightOffset;

                    // DECYZJA O KSZTAŁCIE:
                    // Jeśli to 'slide' -> ZAWSZE linia (bo sufit przeszkody)
                    // Jeśli monet jest mało (1 lub 2) -> ZAWSZE linia (łuk z 2 kropek wygląda słabo)
                    // W przeciwnym razie -> ŁUK
                    const useArc = (type === 'jump' && count >= 3);

                    if (useArc) {
                        // Obliczamy parabolę
                        const distFromCenter = Math.abs(k - centerIndex);
                        const drop = distFromCenter * curve;
                        yPos += drop;
                    }

                    createCoin(centerX + xOffset, yPos);
                }
            };

            // --- PLATFORMY ---
            const createPlatform = (x: number, width: number) => {
                const height = GAME_CONFIG.platformHeight;
                const y = GAME_CONFIG.height - 50;

                const graphics = new PIXI.Graphics();
                graphics.rect(0, 0, width, height);
                graphics.fill(0x555555);
                graphics.x = x;
                graphics.y = y;
                app.stage.addChildAt(graphics, 0);

                const body = Matter.Bodies.rectangle(
                    x + width / 2,
                    y + height / 2,
                    width, height,
                    { isStatic: true, label: 'ground', friction: 0 }
                );
                Matter.World.add(engine.world, body);
                platforms.push({ sprite: graphics, body: body });

                return x + width;
            };

            lastPlatformEndX = createPlatform(-50, GAME_CONFIG.width + 400);

            // --- SPAWNER PRZESZKÓD ---
            const spawnObstacle = () => {
                const isHighObstacle = Math.random() > 0.5;
                const type = isHighObstacle ? 'obstacle_high' : 'obstacle_low';
                const obsSize = 40;

                const groundTopY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                const offset = isHighObstacle ? GAME_CONFIG.obstacleHighOffset : GAME_CONFIG.obstacleLowOffset;
                const targetY = groundTopY + offset;

                const color = isHighObstacle ? 0x0000ff : 0xff0000;

                const graphics = new PIXI.Graphics();
                graphics.rect(0, 0, 50, 50);
                graphics.fill(color);
                const startX = GAME_CONFIG.width + 100;
                graphics.x = startX;
                graphics.y = targetY;
                graphics.pivot.set(25, 25);

                app.stage.addChild(graphics);

                const body = Matter.Bodies.rectangle(
                    startX,
                    targetY,
                    obsSize, obsSize,
                    { isSensor: true, label: type }
                );
                Matter.World.add(engine.world, body);
                obstacles.push({ sprite: graphics, body: body });

                // 🪙 SPAWN MONET PRZY PRZESZKODACH (RNG)
                if (isHighObstacle) {
                    if (Math.random() > 0.5) {
                        // Opcja A: Wślizg -> Typ 'slide' (płaskie)
                        spawnCoinGroup(startX, groundTopY, GAME_CONFIG.coinSlideHeight, 'slide');
                    } else {
                        // Opcja B: Wysoki Skok -> Typ 'jump' (łuk)
                        spawnCoinGroup(startX, targetY, GAME_CONFIG.coinHighJumpHeight, 'jump');
                    }
                } else {
                    // Czerwona (Niska) -> Typ 'jump' (łuk)
                    spawnCoinGroup(startX, targetY, GAME_CONFIG.coinLowObsHeight, 'jump');
                }
            };

            currentSpawnDelay = Math.random() * (GAME_CONFIG.spawnMaxTime - GAME_CONFIG.spawnMinTime) + GAME_CONFIG.spawnMinTime;

            // --- ASSETY ---
            const parseFrames = (jsonData: any[], baseTexture: PIXI.TextureSource) => {
                return jsonData.map(frame => {
                    const region = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height);
                    return new PIXI.Texture({ source: baseTexture, frame: region });
                });
            };

            const [idleSheet, idleTex, runSheet, runTex, jumpSheet, jumpTex, slideSheet, slideTex, deadSheet, deadTex] = await Promise.all([
                PIXI.Assets.load('/assets/character/idle.json'),
                PIXI.Assets.load('/assets/character/idle.png'),
                PIXI.Assets.load('/assets/character/run.json'),
                PIXI.Assets.load('/assets/character/run.png'),
                PIXI.Assets.load('/assets/character/jump.json'),
                PIXI.Assets.load('/assets/character/jump.png'),
                PIXI.Assets.load('/assets/character/slide.json'),
                PIXI.Assets.load('/assets/character/slide.png'),
                PIXI.Assets.load('/assets/character/dead.json'),
                PIXI.Assets.load('/assets/character/dead.png'),
            ]);

            const animations = {
                idle: parseFrames(idleSheet, idleTex),
                run: parseFrames(runSheet, runTex),
                jump: parseFrames(jumpSheet, jumpTex),
                slide: parseFrames(slideSheet, slideTex),
                dead: parseFrames(deadSheet, deadTex),
            };

            const character = new PIXI.AnimatedSprite(animations.idle);
            character.scale.set(GAME_CONFIG.characterScale);
            character.animationSpeed = GAME_CONFIG.animationSpeed;
            character.anchor.set(0.5);
            character.play();
            app.stage.addChild(character);

            if (scoreText) app.stage.setChildIndex(scoreText, app.stage.children.length - 1);
            if (debugGraphics) app.stage.setChildIndex(debugGraphics, app.stage.children.length - 1);

            // --- KOLIZJE ---
            Matter.Events.on(engine, 'collisionStart', (event) => {
                event.pairs.forEach((pair) => {
                    const { bodyA, bodyB } = pair;

                    if ((bodyA.label === 'player' && bodyB.label === 'ground') ||
                        (bodyB.label === 'player' && bodyA.label === 'ground')) {
                        isTouchingGround = true;
                    }

                    // 🪙 ZBIERANIE
                    const coinBody = bodyA.label === 'coin' ? bodyA : (bodyB.label === 'coin' ? bodyB : null);
                    if (coinBody) {
                        const coinIndex = coins.findIndex(c => c.body === coinBody);
                        if (coinIndex !== -1 && !coins[coinIndex].collected) {
                            coins[coinIndex].collected = true;
                            score += 1;
                            if (scoreText) scoreText.text = `COINS: ${score}`;

                            // 🚀 SPEED UP
                            if (score % 10 === 0) {
                                if (currentMoveSpeed < GAME_CONFIG.maxMoveSpeed) {
                                    currentMoveSpeed += 0.5;
                                    console.log("🚀 SPEED UP! New Speed:", currentMoveSpeed);
                                    if (scoreText) scoreText.style.fill = '#FF0000';
                                    setTimeout(() => { if (scoreText) scoreText.style.fill = '#FFD700'; }, 500);
                                }
                            }

                            Matter.World.remove(engine.world, coinBody);
                            app.stage.removeChild(coins[coinIndex].sprite);
                            coins.splice(coinIndex, 1);
                        }
                    }
                });
            });

            Matter.Events.on(engine, 'collisionActive', (event) => {
                event.pairs.forEach((pair) => {
                    const { bodyA, bodyB } = pair;
                    if ((bodyA.label === 'player' && bodyB.label === 'ground') ||
                        (bodyB.label === 'player' && bodyA.label === 'ground')) {
                        isTouchingGround = true;
                    }
                });
            });

            Matter.Events.on(engine, 'collisionEnd', (event) => {
                event.pairs.forEach((pair) => {
                    const { bodyA, bodyB } = pair;
                    if ((bodyA.label === 'player' && bodyB.label === 'ground') ||
                        (bodyB.label === 'player' && bodyA.label === 'ground')) {
                        isTouchingGround = false;
                    }
                });
            });

            // --- PĘTLA GRY ---
            app.ticker.add((ticker) => {
                const delta = ticker.deltaTime;
                Matter.Engine.update(engine, delta * 16.66);

                // DEBUG
                if (GAME_CONFIG.debugMode && debugGraphics) {
                    debugGraphics.clear();
                    debugGraphics.rect(0, 0, GAME_CONFIG.width, GAME_CONFIG.height);
                    debugGraphics.stroke({ width: 2, color: 0x000000, alpha: 0.1 });

                    const bodies = Matter.Composite.allBodies(engine.world);
                    bodies.forEach(body => {
                        debugGraphics!.moveTo(body.vertices[0].x, body.vertices[0].y);
                        for (let j = 1; j < body.vertices.length; j += 1) {
                            debugGraphics!.lineTo(body.vertices[j].x, body.vertices[j].y);
                        }
                        debugGraphics!.lineTo(body.vertices[0].x, body.vertices[0].y);

                        let color = 0x000000;
                        if (body.label === 'player') color = 0xff0000;
                        else if (body.label.includes('obstacle')) color = 0xffa500;
                        else if (body.label === 'ground') color = 0x0000ff;
                        else if (body.label === 'coin') color = 0xFFD700;

                        debugGraphics!.stroke({ width: 2, color: color });
                    });
                }

                if (!isGameOver) {

                    if (isTouchingGround) {
                        coyoteTimer = GAME_CONFIG.coyoteTime;
                    } else {
                        if (coyoteTimer > 0) coyoteTimer -= delta;
                    }
                    if (jumpBufferTimer > 0) jumpBufferTimer -= delta;

                    if (jumpBufferTimer > 0 && coyoteTimer > 0) {
                        Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: GAME_CONFIG.jumpPower });
                        coyoteTimer = 0;
                        jumpBufferTimer = 0;
                        isTouchingGround = false;
                        character.textures = animations.jump;
                        character.loop = false;
                        character.play();
                    }

                    worldSpeed = 0;
                    const isRightPressed = keys["ArrowRight"] || keys["KeyD"];
                    if (isRightPressed) worldSpeed = currentMoveSpeed;

                    if (worldSpeed > 0) {
                        // 1. Platformy
                        for (let i = platforms.length - 1; i >= 0; i--) {
                            const plat = platforms[i];
                            Matter.Body.translate(plat.body, { x: -worldSpeed * delta, y: 0 });
                            plat.sprite.x = plat.body.position.x - (plat.sprite.width / 2);

                            if (plat.sprite.x + plat.sprite.width < -100) {
                                app.stage.removeChild(plat.sprite);
                                Matter.World.remove(engine.world, plat.body);
                                platforms.splice(i, 1);
                            }
                        }

                        // Generowanie terenu
                        lastPlatformEndX -= worldSpeed * delta;
                        if (lastPlatformEndX < GAME_CONFIG.width + 100) {
                            const makeGap = Math.random() > 0.3;
                            let gapSize = 0;
                            if (makeGap) {
                                gapSize = Math.random() * (GAME_CONFIG.maxGap - GAME_CONFIG.minGap) + GAME_CONFIG.minGap;

                                // 🪙 SPAWN MONET NAD PRZEPAŚCIĄ (RNG)
                                const gapCenterX = lastPlatformEndX + (gapSize / 2);
                                const groundY = GAME_CONFIG.height - GAME_CONFIG.platformHeight;
                                // Gap = typ 'jump' (łuk)
                                spawnCoinGroup(gapCenterX, groundY, GAME_CONFIG.coinGapHeight, 'jump');
                            }

                            const newPlatformX = lastPlatformEndX + gapSize;
                            const newPlatformWidth = Math.random() * (GAME_CONFIG.maxPlatformWidth - GAME_CONFIG.minPlatformWidth) + GAME_CONFIG.minPlatformWidth;
                            lastPlatformEndX = createPlatform(newPlatformX, newPlatformWidth);
                        }

                        // 2. Przeszkody
                        spawnTimer += delta;
                        if (spawnTimer >= currentSpawnDelay) {
                            const spawnX = GAME_CONFIG.width + 50;
                            let isSafeToSpawn = false;
                            for (const plat of platforms) {
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
                                spawnObstacle();
                                spawnTimer = 0;
                                currentSpawnDelay = Math.random() * (GAME_CONFIG.spawnMaxTime - GAME_CONFIG.spawnMinTime) + GAME_CONFIG.spawnMinTime;
                            } else {
                                spawnTimer = currentSpawnDelay - 10;
                            }
                        }

                        // 3. Przesuwanie przeszkód
                        for (let i = obstacles.length - 1; i >= 0; i--) {
                            const obs = obstacles[i];
                            Matter.Body.translate(obs.body, { x: -worldSpeed * delta, y: 0 });
                            obs.sprite.x = obs.body.position.x;
                            obs.sprite.y = obs.body.position.y;

                            if (obs.sprite.x < -50) {
                                app.stage.removeChild(obs.sprite);
                                Matter.World.remove(engine.world, obs.body);
                                obstacles.splice(i, 1);
                            }
                        }

                        // 4. Przesuwanie monet
                        for (let i = coins.length - 1; i >= 0; i--) {
                            const coin = coins[i];
                            Matter.Body.translate(coin.body, { x: -worldSpeed * delta, y: 0 });
                            coin.sprite.x = coin.body.position.x;
                            coin.sprite.y = coin.body.position.y;

                            if (coin.sprite.x < -50) {
                                app.stage.removeChild(coin.sprite);
                                Matter.World.remove(engine.world, coin.body);
                                coins.splice(i, 1);
                            }
                        }
                    }

                    // --- KOLIZJE Z PRZESZKODAMI ---
                    for (const obs of obstacles) {
                        if (Matter.Collision.collides(playerBody, obs.body)) {
                            const isHigh = obs.body.label === 'obstacle_high';
                            const isSliding = keys["ArrowDown"] || keys["KeyS"];

                            if (isHigh && isSliding) {
                                // Unik
                            } else {
                                console.log("💥 KOLIZJA!");
                                isGameOver = true;
                                character.textures = animations.dead;
                                character.loop = false;
                                character.play();
                                vx = -GAME_CONFIG.knockbackX;
                                Matter.Body.setVelocity(playerBody, { x: 0, y: 0 });
                                Matter.Body.applyForce(playerBody, playerBody.position, { x: -0.05, y: -0.05 });
                            }
                        }
                    }
                }

                // FIZYKA POSTACI
                let currentVy = playerBody.velocity.y;
                currentVy += GAME_CONFIG.gravity;
                if (currentVy > 20) currentVy = 20;

                const effectivelyGrounded = coyoteTimer > 0;

                if (isGameOver && effectivelyGrounded) {
                    vx *= 0.9;
                    Matter.Body.setVelocity(playerBody, { x: vx, y: currentVy });
                } else if (!isGameOver) {
                    Matter.Body.setVelocity(playerBody, { x: vx, y: currentVy });
                } else {
                    Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: currentVy });
                }

                character.x = playerBody.position.x;
                character.y = playerBody.position.y + GAME_CONFIG.characterVisualOffset;

                if (character.y > GAME_CONFIG.height + 200 && !isGameOver) {
                    isGameOver = true;
                }

                // ANIMACJE
                if (!isGameOver) {
                    if (effectivelyGrounded) {
                        const slidePressed = keys["ArrowDown"] || keys["KeyS"];
                        const isMoving = worldSpeed > 0;

                        if (slidePressed) {
                            if (character.textures !== animations.slide) {
                                character.textures = animations.slide;
                                character.loop = true;
                                character.play();
                            }
                        } else if (isMoving) {
                            if (character.textures !== animations.run) {
                                character.animationSpeed = GAME_CONFIG.animationSpeed * (currentMoveSpeed / GAME_CONFIG.moveSpeed);
                                character.textures = animations.run;
                                character.loop = true;
                                character.play();
                            }
                        } else {
                            if (character.textures !== animations.idle) {
                                character.animationSpeed = GAME_CONFIG.animationSpeed;
                                character.textures = animations.idle;
                                character.loop = true;
                                character.play();
                            }
                        }
                    } else {
                        if (playerBody.velocity.y > 2 && character.textures !== animations.jump) {
                            character.textures = animations.jump;
                            character.loop = false;
                            character.play();
                        }
                    }
                }
            });
        };

        initGame();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (appRef.current) appRef.current.destroy(true, { children: true, texture: true });
            if (engineRef.current) Matter.Engine.clear(engineRef.current);
        };
    }, []);

    return (
        <div ref={containerRef} className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden bg-white" />
    );
}