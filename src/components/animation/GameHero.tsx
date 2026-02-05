"use client";

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';

const GAME_CONFIG = {
    width: 1080,
    height: 450,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.25,
    jumpPower: -10,
    groundY: 450 / 2,
    // --- KONFIGURACJA PRZESZKÓD 📦 ---
    obstacleSpeed: 5,        // Jak szybko przeszkody lecą w lewo
    spawnMinTime: 60,        // Minimalny czas (w klatkach) między przeszkodami (60 = ok. 1 sekunda)
    spawnMaxTime: 150,        // Maksymalny czas (w klatkach)
    // ⚙️ NOWE USTAWIENIA ODRZUTU
    knockbackX: 3,  // Jak mocno odpycha w lewo
    knockbackY: -8   // Jak mocno podbija w górę (minus to góra)
};

export default function GameHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const engineRef = useRef<Matter.Engine | null>(null);

    useEffect(() => {
        // --- ZMIENNE STANU GRY ---
        let vy = 0;
        let vx = 0;
        let isGrounded = true;
        let jumpRequested = false;
        let isGameOver = false;

        let spawnTimer = 0;
        let currentSpawnDelay = 0;
        const obstacles: { sprite: PIXI.Graphics, body: Matter.Body }[] = [];

        const keys: Record<string, boolean> = {};

        // --- OBSŁUGA KLAWIATURY ---
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            if (isGameOver) return;

            keys[e.code] = true;
            const isJumpKey = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW";
            if (isJumpKey && isGrounded) {
                jumpRequested = true;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            keys[e.code] = false;
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const initGame = async () => {
            // 1. Setup PIXI
            const app = new PIXI.Application();
            await app.init({
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height,
                backgroundAlpha: 0,
            });
            appRef.current = app;
            if (containerRef.current) containerRef.current.appendChild(app.canvas);

            // 2. Setup Matter.js
            const engine = Matter.Engine.create();
            engineRef.current = engine;
            engine.gravity.y = 0;

            // Ciało gracza
            const playerBody = Matter.Bodies.rectangle(
                GAME_CONFIG.width / 2,
                GAME_CONFIG.groundY,
                50, 100,
                { isSensor: true, label: 'player' }
            );
            Matter.World.add(engine.world, playerBody);

            // --- SPAWNER PRZESZKÓD (LOW / HIGH) ---
            const spawnObstacle = () => {
                // Rzut monetą: 50% szans na wysoką przeszkodę (do wślizgu)
                const isHighObstacle = Math.random() > 0.5;

                const type = isHighObstacle ? 'obstacle_high' : 'obstacle_low';
                // Jeśli wysoka, wisi 70px nad ziemią. Jeśli niska, stoi na ziemi (25px to połowa jej wysokości)
                const yOffset = isHighObstacle ? 70 : 25;
                const color = isHighObstacle ? 0x0000ff : 0xff0000; // Niebieski = Slide, Czerwony = Jump

                // A. Grafika
                const graphics = new PIXI.Graphics();
                graphics.rect(0, 0, 50, 50);
                graphics.fill(color);

                const startX = GAME_CONFIG.width + 50;
                // Pozycja Y zależy od typu przeszkody
                const targetY = GAME_CONFIG.groundY - yOffset + 25;

                graphics.x = startX;
                graphics.y = targetY;
                graphics.pivot.set(25, 25);

                app.stage.addChild(graphics);

                // B. Fizyka
                const body = Matter.Bodies.rectangle(
                    startX,
                    targetY,
                    50, 50,
                    {
                        isSensor: true,
                        label: type // 🏷️ Ważne: etykietujemy przeszkodę!
                    }
                );
                Matter.World.add(engine.world, body);
                obstacles.push({ sprite: graphics, body: body });
            };

            currentSpawnDelay = Math.random() * (GAME_CONFIG.spawnMaxTime - GAME_CONFIG.spawnMinTime) + GAME_CONFIG.spawnMinTime;

            // --- ŁADOWANIE ZASOBÓW ---
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
            character.x = GAME_CONFIG.width / 2;
            character.y = GAME_CONFIG.groundY;
            character.play();
            app.stage.addChild(character);

            // --- PĘTLA GRY (TICKER) ---
            app.ticker.add((ticker) => {
                const delta = ticker.deltaTime;
                Matter.Engine.update(engine, delta * 16.66);

                // --- 1. LOGIKA "ŻYCIA" (Gdy gra trwa) ---
                if (!isGameOver) {

                    // Spawnowanie
                    spawnTimer += delta;
                    if (spawnTimer >= currentSpawnDelay) {
                        spawnObstacle();
                        spawnTimer = 0;
                        currentSpawnDelay = Math.random() * (GAME_CONFIG.spawnMaxTime - GAME_CONFIG.spawnMinTime) + GAME_CONFIG.spawnMinTime;
                    }

                    // Pętla po przeszkodach
                    for (let i = obstacles.length - 1; i >= 0; i--) {
                        const obs = obstacles[i];
                        Matter.Body.translate(obs.body, { x: -GAME_CONFIG.obstacleSpeed * delta, y: 0 });
                        obs.sprite.x = obs.body.position.x;
                        obs.sprite.y = obs.body.position.y;

                        // --- DETEKCJA KOLIZJI I LOGIKA UNIKÓW 🧠 ---
                        if (Matter.Collision.collides(playerBody, obs.body)) {

                            // Czy to wysoka przeszkoda?
                            const isHigh = obs.body.label === 'obstacle_high';
                            // Czy gracz trzyma wślizg?
                            const isSliding = keys["ArrowDown"] || keys["KeyS"];

                            if (isHigh && isSliding) {
                                // ✅ UNIK! Gracz robi slide pod wysoką przeszkodą.
                                // Można tu dodać np. dźwięk albo punkty.
                            } else {
                                // ❌ KOLIZJA (Game Over)
                                console.log("GAME OVER!");
                                isGameOver = true;

                                character.textures = animations.dead;
                                character.loop = false;
                                character.play();

                                // Odrzut
                                vx = -GAME_CONFIG.knockbackX;
                                vy = GAME_CONFIG.knockbackY;
                                isGrounded = false;
                            }
                        }

                        // Usuwanie poza ekranem
                        if (obs.sprite.x < -50) {
                            app.stage.removeChild(obs.sprite);
                            Matter.World.remove(engine.world, obs.body);
                            obstacles.splice(i, 1);
                        }
                    }

                    // Sterowanie skokiem (tylko gdy żyjemy)
                    if (jumpRequested) {
                        vy = GAME_CONFIG.jumpPower;
                        isGrounded = false;
                        character.textures = animations.jump;
                        character.loop = false;
                        character.play();
                        jumpRequested = false;
                    }
                }

                // --- 2. FIZYKA POSTACI (Działa zawsze, nawet po śmierci) ---
                if (!isGrounded) {
                    vy += GAME_CONFIG.gravity;
                }

                character.y += vy;
                character.x += vx; // Przesunięcie przy odrzucie

                // Podłoga
                if (character.y >= GAME_CONFIG.groundY) {
                    character.y = GAME_CONFIG.groundY;
                    vy = 0;
                    isGrounded = true;

                    if (isGameOver) {
                        vx = vx * 0.9; // Tarcie po śmierci
                    }
                } else {
                    isGrounded = false;
                }

                Matter.Body.setPosition(playerBody, {
                    x: character.x,
                    y: character.y
                });

                // --- 3. ANIMACJE (Tylko gdy żyjemy) ---
                if (!isGameOver) {
                    if (isGrounded && !jumpRequested) {
                        const slidePressed = keys["ArrowDown"] || keys["KeyS"];
                        const rightPressed = keys["ArrowRight"] || keys["KeyD"];

                        if (slidePressed) {
                            if (character.textures !== animations.slide) {
                                character.textures = animations.slide;
                                character.loop = true;
                                character.play();
                            }
                        } else if (rightPressed) {
                            if (character.textures !== animations.run) {
                                character.textures = animations.run;
                                character.loop = true;
                                character.play();
                            }
                        } else {
                            if (character.textures !== animations.idle) {
                                character.textures = animations.idle;
                                character.loop = true;
                                character.play();
                            }
                        }
                    } else if (!isGrounded) {
                        if (character.textures !== animations.jump) {
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
        <div ref={containerRef} className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden" />
    );
}