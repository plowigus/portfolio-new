import { useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
import { PhysicsSystem } from '../../systems/Physics';

interface DeathSequenceProps {
    gameState: React.MutableRefObject<any>;
    trailsRef: React.MutableRefObject<PIXI.Sprite[]>;
    renderer: { app: PIXI.Application } | null;
    character: PIXI.AnimatedSprite | null;
    setIsGameOver: (over: boolean) => void;
    physics: PhysicsSystem | null;
}

export const useDeathSequence = ({
    gameState,
    trailsRef,
    renderer,
    character,
    setIsGameOver,
    physics
}: DeathSequenceProps) => {

    const update = useCallback((delta: number) => {
        if (!gameState.current || !renderer || !character || !physics) return;

        const state = gameState.current;

        if (state.isDying) {
            state.deathTimer += delta / GAME_CONFIG.deathSlowMotionScale; // scale logic update to match real time relative to slowed physics

            // Red Ghost Trail
            state.trailTimer += delta / GAME_CONFIG.deathSlowMotionScale;
            if (state.trailTimer > GAME_CONFIG.trailInterval * GAME_CONFIG.deathTrailIntervalMultiplier) {
                state.trailTimer = 0;

                // Clear previous ghost(s) to ensure only one exists (User Request)
                trailsRef.current.forEach(t => {
                    if (!t.destroyed) {
                        renderer.app.stage.removeChild(t);
                        t.destroy();
                    }
                });
                trailsRef.current = [];

                const ghost = new PIXI.Sprite(character.texture);
                ghost.x = character.x;
                ghost.y = character.y;
                ghost.scale.copyFrom(character.scale);
                ghost.anchor.copyFrom(character.anchor);
                ghost.rotation = character.rotation;
                ghost.alpha = GAME_CONFIG.deathGhostAlpha;
                ghost.tint = GAME_CONFIG.deathGhostTint; // Red for death
                ghost.zIndex = 3;

                renderer.app.stage.addChild(ghost);
                trailsRef.current.push(ghost);
            }

            if (state.deathTimer > GAME_CONFIG.deathDuration) {
                setIsGameOver(true);
                state.isDying = false;
                physics.engine.timing.timeScale = 0; // Freeze
            }
        }
    }, [gameState, trailsRef, renderer, character, setIsGameOver, physics]);

    return { update };
};
