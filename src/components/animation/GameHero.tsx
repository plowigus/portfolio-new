"use client";

import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GAME_CONFIG = {
    width: 1080,
    height: 450,
    characterScale: 0.3,
    animationSpeed: 0.25,
    gravity: 0.30,
    jumpPower: -9,
    groundY: 450 / 2 // Środek canvasu jako podłoga
};

const keys: Record<string, boolean> = {};

export default function GameHero() {

    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keys[e.code] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keys[e.code] = false; };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        const initPixi = async () => {
            const app = new PIXI.Application();
            await app.init({
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height,
                backgroundAlpha: 0,
            });

            appRef.current = app;
            if (containerRef.current) {
                containerRef.current.appendChild(app.canvas);
            }

            const parseFrames = (jsonData: any[], baseTexture: PIXI.TextureSource) => {
                return jsonData.map(frame => {
                    const region = new PIXI.Rectangle(frame.x, frame.y, frame.width, frame.height);
                    return new PIXI.Texture({ source: baseTexture, frame: region });
                });
            };

            // Ładowanie WSZYSTKICH zasobów (Idle, Run, Jump, Slide) 📦
            const [idleSheet, idleTex, runSheet, runTex, jumpSheet, jumpTex, slideSheet, slideTex] = await Promise.all([
                PIXI.Assets.load('/assets/character/idle.json'),
                PIXI.Assets.load('/assets/character/idle.png'),
                PIXI.Assets.load('/assets/character/run.json'),
                PIXI.Assets.load('/assets/character/run.png'),
                PIXI.Assets.load('/assets/character/jump.json'),
                PIXI.Assets.load('/assets/character/jump.png'),
                PIXI.Assets.load('/assets/character/slide.json'),
                PIXI.Assets.load('/assets/character/slide.png'),
            ]);

            const animations = {
                idle: parseFrames(idleSheet, idleTex),
                run: parseFrames(runSheet, runTex),
                jump: parseFrames(jumpSheet, jumpTex),
                slide: parseFrames(slideSheet, slideTex),
            };

            const character = new PIXI.AnimatedSprite(animations.idle);
            character.scale.set(GAME_CONFIG.characterScale);
            character.animationSpeed = GAME_CONFIG.animationSpeed;
            character.anchor.set(0.5);
            character.x = GAME_CONFIG.width / 2; // Pozycja X stała (środek)

            // Startowa pozycja Y
            character.y = GAME_CONFIG.groundY;

            character.play();
            app.stage.addChild(character);

            // Zmienne fizyki 📐
            let vy = 0;         // Prędkość pionowa
            let isGrounded = true;

            // --- GŁÓWNA PĘTLA GRY ---
            app.ticker.add(() => {
                // 1. Obsługa GRAWITACJI
                if (!isGrounded) {
                    vy += GAME_CONFIG.gravity; // Zwiększamy prędkość spadania
                }
                character.y += vy;

                // 2. Kolizja z PODŁOGĄ
                if (character.y >= GAME_CONFIG.groundY) {
                    character.y = GAME_CONFIG.groundY;
                    vy = 0;
                    isGrounded = true;
                } else {
                    isGrounded = false;
                }

                // 3. Obsługa KLAWIISZY i ANIMACJI
                // Sprawdzamy co wciska gracz
                const jumpPressed = keys["Space"] || keys["ArrowUp"] || keys["KeyW"];
                const slidePressed = keys["ArrowDown"] || keys["KeyS"];
                const rightPressed = keys["ArrowRight"] || keys["KeyD"];

                // Logika priorytetów animacji:

                if (isGrounded) {
                    // Jesteśmy na ziemi
                    if (jumpPressed) {
                        // SKOK: Nadajemy prędkość w górę 🚀
                        vy = GAME_CONFIG.jumpPower;
                        isGrounded = false;
                        character.textures = animations.jump;
                        character.loop = false; // Skok zazwyczaj nie zapętla się w kółko
                        character.play();
                    }
                    else if (slidePressed) {
                        // ŚLIZG: Tylko jeśli na ziemi 📉
                        if (character.textures !== animations.slide) {
                            character.textures = animations.slide;
                            character.loop = true;
                            character.play();
                        }
                    }
                    else if (rightPressed) {
                        // BIEG 🏃‍♂️
                        if (character.textures !== animations.run) {
                            character.textures = animations.run;
                            character.loop = true;
                            character.play();
                        }
                    }
                    else {
                        // IDLE (Stoi w miejscu) 🧍
                        if (character.textures !== animations.idle) {
                            character.textures = animations.idle;
                            character.loop = true;
                            character.play();
                        }
                    }
                } else {
                    // Jesteśmy w powietrzu (JUMP/FALL) 🦅
                    // Tutaj ignorujemy slidePressed!
                    if (character.textures !== animations.jump) {
                        character.textures = animations.jump;
                        character.loop = false;
                        character.play();
                    }
                }
            });
        };

        initPixi();

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (appRef.current) {
                appRef.current.destroy(true, { children: true, texture: true });
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden"
        />
    );
}