import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';
import { PhysicsSystem } from '../systems/Physics';
import { RendererSystem } from '../systems/Renderer';
import { SpawnerSystem } from '../systems/Spawner';
import { AssetManager } from '../systems/AssetManager';
import { useInput } from './useInput';

export const useGameEngine = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [restartKey, setRestartKey] = useState(0);

    const { keys, jumpBufferTimer } = useInput();

    // Refs for systems to persist across renders
    const physicsRef = useRef<PhysicsSystem | null>(null);
    const rendererRef = useRef<RendererSystem | null>(null);
    const spawnerRef = useRef<SpawnerSystem | null>(null);
    const assetManagerRef = useRef<AssetManager | null>(null);

    // Game State Refs (Mutable) for Loop Logic
    const gameState = useRef({
        vx: 0,
        coyoteTimer: 0,
        currentMoveSpeed: GAME_CONFIG.moveSpeed,
        worldSpeed: 0,
        score: 0,
        isGameOverLogic: false // Internal flag for loop
    });

    useEffect(() => {
        if (!containerRef.current) return;

        // Reset state
        setIsGameOver(false);
        setScore(0);
        gameState.current = {
            vx: 0,
            coyoteTimer: 0,
            currentMoveSpeed: GAME_CONFIG.moveSpeed,
            worldSpeed: 0,
            score: 0,
            isGameOverLogic: false
        };

        const init = async () => {
            // 1. Init Systems
            const physics = new PhysicsSystem();
            const renderer = new RendererSystem();
            const assetManager = new AssetManager();

            await renderer.init(containerRef.current!);
            await assetManager.loadAssets();

            // Enable sorting for Z-Index management
            renderer.app.stage.sortableChildren = true;

            const spawner = new SpawnerSystem(
                physics.engine,
                renderer.app,
                assetManager.textures.floor,
                assetManager.animations
            );
            spawner.initPlatforms();

            physicsRef.current = physics;
            rendererRef.current = renderer;
            spawnerRef.current = spawner;
            assetManagerRef.current = assetManager;

            // 2. Setup Background (Parallax)
            const bgTexture = assetManager.textures.background;
            const background = new PIXI.TilingSprite({
                texture: bgTexture,
                width: GAME_CONFIG.width,
                height: GAME_CONFIG.height
            });

            // Scaled and Positioned from Config
            const bgScale = (GAME_CONFIG.height / bgTexture.height) * GAME_CONFIG.bgScaleMultiplier;
            background.tileScale.set(bgScale);
            background.tilePosition.y = GAME_CONFIG.bgOffsetY;
            background.zIndex = 1;

            renderer.app.stage.addChild(background);

            // 3. Setup Player
            physics.createPlayer();
            const character = new PIXI.AnimatedSprite(assetManager.animations.idle);
            character.scale.set(GAME_CONFIG.characterScale);
            character.animationSpeed = GAME_CONFIG.animationSpeed;
            character.anchor.set(0.5);
            character.zIndex = 4;
            character.play();
            renderer.app.stage.addChild(character);

            // Helper to trigger Game Over
            const triggerGameOver = () => {
                if (gameState.current.isGameOverLogic) return;
                gameState.current.isGameOverLogic = true;
                setIsGameOver(true); // Update UI

                character.textures = assetManager.animations.dead;
                character.loop = false;
                character.play();

                gameState.current.vx = -GAME_CONFIG.knockbackX;
                // Apply knockback physics
                if (physics.playerBody) {
                    Matter.Body.setVelocity(physics.playerBody, { x: 0, y: 0 });
                    Matter.Body.applyForce(physics.playerBody, physics.playerBody.position, { x: -0.05, y: -0.05 });
                }
                console.log("💥 GAME OVER");
            };

            // 4. Collision Logic
            Matter.Events.on(physics.engine, 'collisionStart', (event) => {
                event.pairs.forEach((pair) => {
                    const { bodyA, bodyB } = pair;

                    // Coin Collection
                    const coinBody = bodyA.label === 'coin' ? bodyA : (bodyB.label === 'coin' ? bodyB : null);
                    if (coinBody) {
                        const currentScore = spawner.coins.find(c => c.body === coinBody);
                        if (currentScore && !currentScore.collected) {
                            currentScore.collected = true;
                            spawner.removeCoin(coinBody);
                            gameState.current.score += 1;
                            setScore(gameState.current.score); // Sync to UI

                            // Speed Up Logic
                            if (gameState.current.score % 10 === 0) {
                                if (gameState.current.currentMoveSpeed < GAME_CONFIG.maxMoveSpeed) {
                                    gameState.current.currentMoveSpeed += 0.5;
                                    console.log("🚀 SPEED UP!", gameState.current.currentMoveSpeed);
                                }
                            }
                        }
                    }

                    // Obstacle Collision
                    const obsBody = bodyA.label.includes('obstacle') ? bodyA : (bodyB.label.includes('obstacle') ? bodyB : null);

                    if (obsBody && !obsBody.label.includes('coin')) {
                        const otherBody = bodyA === obsBody ? bodyB : bodyA;
                        if (otherBody.label === 'player') {
                            const isHigh = obsBody.label === 'obstacle_high';
                            const isSliding = keys.current["ArrowDown"] || keys.current["KeyS"];

                            // Dodge Logic
                            if (isHigh && isSliding) {
                                // Successful dodge
                            } else {
                                triggerGameOver();
                            }
                        }
                    }
                });
            });

            // 5. Game Loop
            renderer.app.ticker.add((ticker) => {
                if (!physics.playerBody) return;

                const delta = ticker.deltaTime;
                physics.update(delta);
                renderer.renderDebug(Matter.Composite.allBodies(physics.engine.world));

                const state = gameState.current;
                const playerBody = physics.playerBody;
                const logicGameOver = state.isGameOverLogic;

                if (!logicGameOver) {
                    // Scroll Background (Parallax)
                    background.tilePosition.x -= state.worldSpeed * delta * GAME_CONFIG.bgParallaxSpeed;

                    // Ground check
                    if (physics.isTouchingGround) {
                        state.coyoteTimer = GAME_CONFIG.coyoteTime;
                    } else {
                        if (state.coyoteTimer > 0) state.coyoteTimer -= delta;
                    }
                    if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta;

                    // Jump
                    if (jumpBufferTimer.current > 0 && state.coyoteTimer > 0) {
                        Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: GAME_CONFIG.jumpPower });
                        state.coyoteTimer = 0;
                        jumpBufferTimer.current = 0;
                        physics.isTouchingGround = false;
                        character.textures = assetManager.animations.jump;
                        character.loop = false;
                        character.play();
                    }

                    // Movement
                    state.worldSpeed = 0;
                    const isRightPressed = keys.current["ArrowRight"] || keys.current["KeyD"];
                    if (isRightPressed) state.worldSpeed = state.currentMoveSpeed;

                    // Update Spawner
                    spawner.update(delta, state.worldSpeed);
                }

                // Physics Handling (Gravity & Grounding)
                let currentVy = playerBody.velocity.y;
                currentVy += GAME_CONFIG.gravity;
                if (currentVy > 20) currentVy = 20;

                const effectivelyGrounded = state.coyoteTimer > 0;

                if (logicGameOver && effectivelyGrounded) {
                    state.vx *= 0.9; // Friction when dead on ground
                    Matter.Body.setVelocity(playerBody, { x: state.vx, y: currentVy });
                } else if (!logicGameOver) {
                    Matter.Body.setVelocity(playerBody, { x: state.vx, y: currentVy });
                } else {
                    Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: currentVy });
                }

                // Sync Sprite
                character.x = playerBody.position.x;
                character.y = playerBody.position.y + GAME_CONFIG.characterVisualOffset;

                // Fall Condition
                if (character.y > GAME_CONFIG.height + 200 && !logicGameOver) {
                    triggerGameOver();
                    setScore(state.score);
                }

                // Animation State Machine
                if (!logicGameOver) {
                    if (effectivelyGrounded) {
                        const slidePressed = keys.current["ArrowDown"] || keys.current["KeyS"];
                        const isMoving = state.worldSpeed > 0;

                        if (slidePressed) {
                            if (character.textures !== assetManager.animations.slide) {
                                character.textures = assetManager.animations.slide;
                                character.loop = true;
                                character.play();
                            }
                        } else if (isMoving) {
                            if (character.textures !== assetManager.animations.run) {
                                character.animationSpeed = GAME_CONFIG.animationSpeed * (state.currentMoveSpeed / GAME_CONFIG.moveSpeed);
                                character.textures = assetManager.animations.run;
                                character.loop = true;
                                character.play();
                            }
                        } else {
                            if (character.textures !== assetManager.animations.idle) {
                                character.animationSpeed = GAME_CONFIG.animationSpeed;
                                character.textures = assetManager.animations.idle;
                                character.loop = true;
                                character.play();
                            }
                        }
                    } else {
                        // Air Animation
                        if (playerBody.velocity.y > 2 && character.textures !== assetManager.animations.jump) {
                            character.textures = assetManager.animations.jump;
                            character.loop = false;
                            character.play();
                        }
                    }
                }
            });
        };

        const cleanup = () => {
            if (physicsRef.current) physicsRef.current.cleanup();
            if (rendererRef.current) rendererRef.current.cleanup();
            if (spawnerRef.current) spawnerRef.current.cleanup();
        };

        init();

        return cleanup;
    }, [restartKey]); // Restart when key changes

    const restartGame = () => {
        setRestartKey(prev => prev + 1);
    };

    return { score, isGameOver, restartGame };
};
