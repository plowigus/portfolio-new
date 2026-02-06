import { useCallback } from 'react';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
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
            if (state.isDying) return; // Prevent input/movement during death sequence

            state.worldSpeed = 0;
            const isRightPressed = keys.current["ArrowRight"] || keys.current["KeyD"];
            const isSprinting = keys.current["Sprint"] && isRightPressed;

            if (isRightPressed) {
                state.worldSpeed = isSprinting ? GAME_CONFIG.sprintSpeed : state.currentMoveSpeed;
            }

            // Ghost Trail Logic (Sprint)
            if (isSprinting && state.worldSpeed > 0) {
                state.trailTimer++;
                if (state.trailTimer > GAME_CONFIG.trailInterval) {
                    state.trailTimer = 0;
                    const ghost = new PIXI.Sprite(character.texture);
                    ghost.x = character.x;
                    ghost.y = character.y;
                    ghost.scale.copyFrom(character.scale);
                    ghost.anchor.copyFrom(character.anchor);
                    ghost.rotation = character.rotation;
                    ghost.alpha = GAME_CONFIG.trailStartAlpha;
                    ghost.tint = GAME_CONFIG.trailTint;
                    ghost.zIndex = 3;

                    renderer.app.stage.addChild(ghost);
                    trailsRef.current.push(ghost);
                }
            }

            // Cleanup Trails
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

    }, [physics, gameState, keys, jumpBufferTimer, character, assetManager, trailsRef, renderer, triggerGameOver, setScore]);

    return { update };
};
