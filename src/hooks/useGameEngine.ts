import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';
import { GAME_CONFIG } from '../config/gameConfig';
import { useInput } from './useInput';
import { useGameSystems } from './engine/useGameSystems';
import { useCollisionHandler } from './engine/useCollisionHandler';
import { usePlayerController } from './engine/usePlayerController';
import { useDeathSequence } from './engine/useDeathSequence';

export const useGameEngine = (
    containerRef: React.RefObject<HTMLDivElement | null>,
    isGameRunning: boolean
) => {
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [activeQuote, setActiveQuote] = useState<string | null>(null);
    const [restartKey, setRestartKey] = useState(0);
    const [lives, setLives] = useState<number>(GAME_CONFIG.maxLives);

    const { keys, jumpBufferTimer } = useInput();
    const trailsRef = useRef<PIXI.Sprite[]>([]);

    const gameState = useRef({
        speed: 0,
        vx: 0,
        coyoteTimer: 0,
        currentMoveSpeed: GAME_CONFIG.moveSpeed,
        worldSpeed: 0,
        score: 0,
        isGameOverLogic: false,
        trailTimer: 0,
        isDying: false,
        deathTimer: 0,
        attackState: { type: 'none', stage: 0, isPlaying: false, queuedType: 'none' },
        facing: 'right' as 'left' | 'right',
        lives: GAME_CONFIG.maxLives as number,
        playerHitThisFrame: false,
        hurtCooldown: 0,
    });

    const {
        physicsRef,
        rendererRef,
        spawnerRef,
        enemyManagerRef,
        assetManagerRef,
        characterRef,
        backgroundRef,
        isReady
    } = useGameSystems(containerRef, restartKey);

    // Reset Logic
    useEffect(() => {
        setIsGameOver(false);
        setActiveQuote(null);
        setScore(0);
        setLives(GAME_CONFIG.maxLives);

        gameState.current = {
            speed: 0,
            vx: 0,
            coyoteTimer: 0,
            currentMoveSpeed: GAME_CONFIG.moveSpeed,
            worldSpeed: 0,
            score: 0,
            isGameOverLogic: false,
            trailTimer: 0,
            isDying: false,
            deathTimer: 0,
            attackState: { type: 'none', stage: 0, isPlaying: false, queuedType: 'none' },
            facing: 'right' as 'left' | 'right',
            lives: GAME_CONFIG.maxLives as number,
            playerHitThisFrame: false,
            hurtCooldown: 0,
        };
        trailsRef.current = [];
    }, [restartKey]);

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

    useEffect(() => {
        if (!isReady || !rendererRef.current || !physicsRef.current || !spawnerRef.current || !enemyManagerRef.current) return;

        const app = rendererRef.current.app;
        if (!app.ticker) return;
        const physics = physicsRef.current;
        const spawner = spawnerRef.current;
        const enemyManager = enemyManagerRef.current;

        const loop = (ticker: PIXI.Ticker) => {
            if (!isGameRunning) return;

            rendererRef.current?.beginFrame();
            const delta = ticker.deltaTime;

            physics.update(delta);

            if (rendererRef.current) {
                rendererRef.current.renderDebug(Matter.Composite.allBodies(physics.engine.world));
            }

            updatePlayer(delta);
            updateDeath(delta);

            const state = gameState.current;
            state.playerHitThisFrame = false;
            if (state.hurtCooldown > 0) state.hurtCooldown -= delta;

            if (physics.playerBody) {
                // Enemy Logic (Pass worldSpeed)
                enemyManager.update(delta, physics.playerBody, state, state.worldSpeed);
            }

            // Handle Damage
            if (state.playerHitThisFrame && state.hurtCooldown <= 0) {
                state.hurtCooldown = 60;
                state.lives--;
                setLives(state.lives);
                if (state.lives <= 0) {
                    triggerGameOver('low');
                }
            }

            if (!state.isGameOverLogic) {
                // Spawner Logic (Pass EnemyManager so it can spawn tactical enemies)
                spawner.update(delta, state.worldSpeed, enemyManager);

                if (backgroundRef.current) {
                    backgroundRef.current.tilePosition.x -= state.worldSpeed * delta * GAME_CONFIG.bgParallaxSpeed;
                }
            }
            rendererRef.current?.endFrame();
        };

        app.ticker.add(loop);

        return () => {
            if (app.ticker) {
                app.ticker.remove(loop);
            }
        };
    }, [isReady, updatePlayer, updateDeath, isGameRunning]);

    const restartGame = () => {
        setRestartKey(prev => prev + 1);
    };

    return {
        score,
        lives,
        isGameOver,
        activeQuote,
        assetManagerRef,
        restartGame,
        isLoaded: isReady
    };
};