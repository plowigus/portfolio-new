import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';
import { useInput } from './useInput';

// Modular Hooks
import { useGameSystems } from './engine/useGameSystems';
import { useCollisionHandler } from './engine/useCollisionHandler';
import { usePlayerController } from './engine/usePlayerController';
import { useDeathSequence } from './engine/useDeathSequence';

export const useGameEngine = (containerRef: React.RefObject<HTMLDivElement | null>) => {
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [activeQuote, setActiveQuote] = useState<string | null>(null);
    const [restartKey, setRestartKey] = useState(0);

    const { keys, jumpBufferTimer } = useInput();
    const trailsRef = useRef<PIXI.Sprite[]>([]);

    const gameState = useRef({
        // ... (unchanged)
        vx: 0,
        coyoteTimer: 0,
        currentMoveSpeed: GAME_CONFIG.moveSpeed,
        worldSpeed: 0,
        score: 0,
        isGameOverLogic: false,
        trailTimer: 0,
        isDying: false,
        deathTimer: 0
    });

    // 1. Initialize Systems
    const {
        physicsRef,
        rendererRef,
        spawnerRef,
        assetManagerRef,
        characterRef,
        backgroundRef,
        isReady
    } = useGameSystems(containerRef, restartKey);

    // Reset Game State on Restart
    useEffect(() => {
        setIsGameOver(false);
        setActiveQuote(null);
        setScore(0);
        gameState.current = {
            vx: 0,
            coyoteTimer: 0,
            currentMoveSpeed: GAME_CONFIG.moveSpeed,
            worldSpeed: 0,
            score: 0,
            isGameOverLogic: false,
            trailTimer: 0,
            isDying: false,
            deathTimer: 0
        };
        trailsRef.current = [];
    }, [restartKey]);

    // 2. Logic Hooks
    const { triggerGameOver } = useCollisionHandler({
        physics: physicsRef.current,
        renderer: rendererRef.current,
        spawner: spawnerRef.current,
        character: characterRef.current,
        gameState,
        trailsRef,
        assetManager: assetManagerRef.current,
        setScore,
        setActiveQuote,
        keys
    });

    const { update: updatePlayer } = usePlayerController({
        physics: physicsRef.current,
        gameState,
        keys,
        jumpBufferTimer,
        character: characterRef.current,
        assetManager: assetManagerRef.current,
        trailsRef,
        renderer: rendererRef.current,
        triggerGameOver,
        setScore
    });

    const { update: updateDeath } = useDeathSequence({
        gameState,
        trailsRef,
        renderer: rendererRef.current,
        character: characterRef.current,
        setIsGameOver,
        physics: physicsRef.current
    });

    // 3. Main Game Loop
    useEffect(() => {
        if (!isReady || !rendererRef.current || !physicsRef.current || !spawnerRef.current) return;

        const app = rendererRef.current.app;
        if (!app.ticker) return;
        const physics = physicsRef.current;
        const spawner = spawnerRef.current;

        const loop = (ticker: PIXI.Ticker) => {
            const delta = ticker.deltaTime;

            // Physics Update
            physics.update(delta);

            // Debug Render
            if (rendererRef.current) {
                rendererRef.current.renderDebug(Matter.Composite.allBodies(physics.engine.world));
            }

            // Logic Updates
            updatePlayer(delta);
            updateDeath(delta);

            // Spawner & Parallax Update
            const state = gameState.current;
            if (!state.isGameOverLogic) {
                spawner.update(delta, state.worldSpeed);

                // Parallax
                if (backgroundRef.current) {
                    backgroundRef.current.tilePosition.x -= state.worldSpeed * delta * GAME_CONFIG.bgParallaxSpeed;
                }
            }
        };

        app.ticker.add(loop);

        return () => {
            // FIX: Bezpieczne usuwanie
            if (app.ticker) {
                app.ticker.remove(loop);
            }
        };
    }, [isReady, updatePlayer, updateDeath]);

    const restartGame = () => {
        setRestartKey(prev => prev + 1);
    };

    return {
        score,
        isGameOver,
        activeQuote,
        assetManagerRef,
        restartGame
    };
};
