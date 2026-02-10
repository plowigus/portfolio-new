import { useCallback } from 'react';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
import { PLAYER_CONFIG } from '../../config/playerConfig';
import { PhysicsSystem } from '../../systems/Physics';
import { AssetManager } from '../../systems/AssetManager';

interface PlayerControllerProps {
    physics: PhysicsSystem | null;
    gameState: React.MutableRefObject<any>;
    keys: React.MutableRefObject<any>;
    jumpBufferTimer: React.MutableRefObject<number>;
    character: PIXI.AnimatedSprite | null;
    assetManager: AssetManager | null;
    trailsRef: React.MutableRefObject<PIXI.Sprite[]>;
    renderer: { app: PIXI.Application } | null;
    triggerGameOver: () => void;
    setScore: (score: number) => void;
}

export const usePlayerController = ({
    physics,
    gameState,
    keys,
    jumpBufferTimer,
    character,
    assetManager,
    trailsRef,
    renderer,
    triggerGameOver,
    setScore
}: PlayerControllerProps) => {

    const update = useCallback((delta: number) => {
        if (!physics || !physics.playerBody || !gameState.current || !character || !assetManager || !renderer) return;

        const state = gameState.current;
        const playerBody = physics.playerBody;
        const logicGameOver = state.isGameOverLogic;

        if (!logicGameOver) {
            // ------------------------------------------------------------------
            // 0. GROUND CHECK
            // ------------------------------------------------------------------
            const isGrounded = physics.isTouchingGround;

            if (isGrounded) {
                state.coyoteTimer = GAME_CONFIG.coyoteTime;
            } else {
                if (state.coyoteTimer > 0) state.coyoteTimer -= delta;
            }
            if (jumpBufferTimer.current > 0) jumpBufferTimer.current -= delta;

            // Jump Logic
            if (jumpBufferTimer.current > 0 && state.coyoteTimer > 0) {
                Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: GAME_CONFIG.jumpPower });
                state.coyoteTimer = 0;
                jumpBufferTimer.current = 0;
                physics.isTouchingGround = false;
                character.textures = assetManager.animations.jump;
                character.loop = false;
                character.play();
            }

            // ------------------------------------------------------------------
            // ATTACK INPUT
            // ------------------------------------------------------------------
            const isKickPressed = keys.current["Backslash"];
            const isPunchPressed = keys.current["Quote"];

            if (!state.attackState.isPlaying) {
                if (isKickPressed) {
                    state.attackState.isPlaying = true;
                    state.attackState.type = 'kick';
                    state.attackState.stage = 1;
                    keys.current["Backslash"] = false;
                } else if (isPunchPressed) {
                    state.attackState.isPlaying = true;
                    state.attackState.type = 'punch';
                    state.attackState.stage = 1;
                    keys.current["Quote"] = false;
                }
            } else {
                if (isKickPressed && state.attackState.type === 'kick' && state.attackState.stage < 2) {
                    state.attackState.queuedType = 'kick';
                    keys.current["Backslash"] = false;
                }
                if (isPunchPressed && state.attackState.type === 'punch' && state.attackState.stage < 3) {
                    state.attackState.queuedType = 'punch';
                    keys.current["Quote"] = false;
                }
            }

            // ------------------------------------------------------------------
            // MOVEMENT & CAMERA LOGIC (STRICT RUNNER)
            // ------------------------------------------------------------------
            let inputDir = 0;
            if (!state.isDying && !state.attackState.isPlaying) {
                const isRightPressed = keys.current["ArrowRight"] || keys.current["KeyD"];
                const isLeftPressed = keys.current["ArrowLeft"] || keys.current["KeyA"];
                if (isRightPressed) inputDir = 1;
                else if (isLeftPressed) inputDir = -1;
            }

            const isSprinting = keys.current["Sprint"];
            const targetSpeed = isSprinting ? GAME_CONFIG.sprintSpeed : state.currentMoveSpeed;

            if (inputDir === 0) {
                // IDLE
                state.vx = 0;
                state.worldSpeed = 0;
            } else if (inputDir === 1) {
                // RIGHT
                state.facing = 'right';

                if (playerBody.position.x >= GAME_CONFIG.scrollThresholdX) {
                    // Camera Lock - scroll world
                    state.worldSpeed = targetSpeed;
                    state.vx = 0;
                    Matter.Body.setPosition(playerBody, {
                        x: GAME_CONFIG.scrollThresholdX,
                        y: playerBody.position.y
                    });
                } else {
                    // Move Player
                    state.worldSpeed = 0;
                    state.vx = targetSpeed;
                }
            } else if (inputDir === -1) {
                // LEFT
                state.facing = 'left';
                state.worldSpeed = 0;

                if (playerBody.position.x <= GAME_CONFIG.leftBoundary) {
                    state.vx = 0;
                    Matter.Body.setPosition(playerBody, {
                        x: GAME_CONFIG.leftBoundary,
                        y: playerBody.position.y
                    });
                } else {
                    state.vx = -targetSpeed;
                }
            }

            // Ghost Trails Logic
            const effectiveSpeed = Math.abs(state.vx) + Math.abs(state.worldSpeed);
            if (isSprinting && effectiveSpeed > 0 && inputDir !== 0) {
                state.trailTimer++;
                if (state.trailTimer > GAME_CONFIG.trailInterval) {
                    state.trailTimer = 0;
                    const ghost = new PIXI.Sprite(character.texture);
                    ghost.anchor.copyFrom(character.anchor);
                    ghost.x = character.x;
                    ghost.y = character.y;
                    ghost.scale.copyFrom(character.scale);
                    ghost.rotation = character.rotation;
                    ghost.alpha = GAME_CONFIG.trailStartAlpha;
                    ghost.tint = GAME_CONFIG.trailTint;
                    ghost.zIndex = 3;
                    renderer.app.stage.addChild(ghost);
                    trailsRef.current.push(ghost);
                }
            }

            // Trail Cleanup
            for (let i = trailsRef.current.length - 1; i >= 0; i--) {
                const ghost = trailsRef.current[i];
                if (!ghost || ghost.destroyed) {
                    trailsRef.current.splice(i, 1);
                    continue;
                }
                ghost.alpha -= GAME_CONFIG.trailFadeSpeed;
                ghost.x -= state.worldSpeed * delta;
                if (ghost.alpha <= 0) {
                    renderer.app.stage.removeChild(ghost);
                    ghost.destroy();
                    trailsRef.current.splice(i, 1);
                }
            }
        }

        // ------------------------------------------------------------------
        // PHYSICS HANDLING
        // ------------------------------------------------------------------
        let currentVy = playerBody.velocity.y;
        currentVy += GAME_CONFIG.gravity * delta;
        if (currentVy > GAME_CONFIG.maxFallSpeed) currentVy = GAME_CONFIG.maxFallSpeed;

        const effectivelyGrounded = state.coyoteTimer > 0;

        // Apply Final Physics Velocity
        if (state.isGameOverLogic && effectivelyGrounded) {
            state.vx *= GAME_CONFIG.friction;
            Matter.Body.setVelocity(playerBody, { x: state.vx, y: currentVy });
        } else if (state.attackState.isPlaying) {
            // Stop horizontal movement during ground attack
            if (effectivelyGrounded) {
                state.vx = 0;
                Matter.Body.setVelocity(playerBody, { x: 0, y: currentVy });
            } else {
                Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: currentVy });
            }
        } else if (!state.isGameOverLogic) {
            Matter.Body.setVelocity(playerBody, { x: state.vx, y: currentVy });
        } else {
            Matter.Body.setVelocity(playerBody, { x: playerBody.velocity.x, y: currentVy });
        }

        // Fall Condition
        if (character.y > GAME_CONFIG.height + GAME_CONFIG.deathFallThreshold && !logicGameOver) {
            triggerGameOver();
            setScore(state.score);
        }

        // ------------------------------------------------------------------
        // ANIMATION STATE MACHINE
        // ------------------------------------------------------------------
        if (!logicGameOver) {
            const baseScale = GAME_CONFIG.characterScale;
            let currentConfigKey = 'IDLE';

            if (state.attackState.isPlaying) {
                currentConfigKey = state.attackState.type === 'kick' ? 'KICK' : 'PUNCH';
            } else if (state.isDying) {
                currentConfigKey = 'DEAD';
            } else if (effectivelyGrounded) {
                const slidePressed = keys.current["ArrowDown"] || keys.current["KeyS"];
                const isMoving = Math.abs(state.vx) > 0.1 || Math.abs(state.worldSpeed) > 0.1;

                if (slidePressed) {
                    currentConfigKey = 'SLIDE';
                } else if (isMoving) {
                    currentConfigKey = 'RUN';
                } else {
                    currentConfigKey = 'IDLE';
                }
            } else {
                currentConfigKey = 'JUMP';
            }

            // Apply Configuration
            const config = PLAYER_CONFIG[currentConfigKey];
            if (config) {
                const dirMultiplier = state.facing === 'left' ? -1 : 1;
                character.scale.set(Math.abs(config.scale.x * baseScale) * dirMultiplier, config.scale.y * baseScale);
                character.anchor.set(config.anchor.x, config.anchor.y);
                const flipOffset = state.facing === 'left' ? (config.flipCorrectionX || 0) : 0;
                character.x = playerBody.position.x + config.offset.x + flipOffset;
                character.y = playerBody.position.y + GAME_CONFIG.characterVisualOffset + config.offset.y;
                character.animationSpeed = config.animationSpeed;
            }

            // Texture Swapping
            if (state.attackState.isPlaying) {
                let animName = '';
                if (state.attackState.type === 'kick') {
                    animName = state.attackState.stage === 1 ? 'kickFirst' : 'kickSecond';
                } else if (state.attackState.type === 'punch') {
                    if (state.attackState.stage === 1) animName = 'punchFirst';
                    else if (state.attackState.stage === 2) animName = 'punchSecond';
                    else animName = 'punchThird';
                }
                const targetAnim = assetManager.animations[animName];
                if (targetAnim && character.textures !== targetAnim) {
                    character.textures = targetAnim;
                    character.loop = false;
                    character.play();
                    character.onComplete = () => {
                        if (state.attackState.queuedType !== 'none') {
                            state.attackState.type = state.attackState.queuedType;
                            state.attackState.stage += 1;
                            state.attackState.queuedType = 'none';
                        } else {
                            state.attackState.isPlaying = false;
                            state.attackState.type = 'none';
                            state.attackState.stage = 0;
                            character.onComplete = undefined;
                        }
                    };
                }
            } else if (effectivelyGrounded) {
                if (currentConfigKey === 'SLIDE') {
                    if (character.textures !== assetManager.animations.slide) {
                        character.textures = assetManager.animations.slide;
                        character.loop = true;
                        character.play();
                    }
                } else if (currentConfigKey === 'RUN') {
                    const movementSpeed = Math.max(Math.abs(state.vx), Math.abs(state.worldSpeed));
                    const speedRatio = GAME_CONFIG.moveSpeed > 0 ? (movementSpeed / GAME_CONFIG.moveSpeed) : 1;
                    character.animationSpeed = config.animationSpeed * speedRatio;

                    if (character.textures !== assetManager.animations.run) {
                        character.textures = assetManager.animations.run;
                        character.loop = true;
                        character.play();
                    }
                } else if (currentConfigKey === 'IDLE') {
                    if (character.textures !== assetManager.animations.idle) {
                        character.textures = assetManager.animations.idle;
                        character.loop = true;
                        character.play();
                    }
                }
            } else {
                if (character.textures !== assetManager.animations.jump) {
                    character.textures = assetManager.animations.jump;
                    character.loop = false;
                    character.play();
                }
            }
        }
    }, [physics, gameState, keys, jumpBufferTimer, character, assetManager, trailsRef, renderer, triggerGameOver, setScore]);

    return { update };
};