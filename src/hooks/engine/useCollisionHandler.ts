import { useEffect, useCallback } from 'react';
import Matter from 'matter-js';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';
import { PhysicsSystem } from '../../systems/Physics';
import { SpawnerSystem } from '../../systems/Spawner';
import { AssetManager } from '../../systems/AssetManager';

interface CollisionHandlerProps {
    physics: PhysicsSystem | null;
    renderer: { app: PIXI.Application } | null;
    spawner: SpawnerSystem | null;
    character: PIXI.AnimatedSprite | null;
    gameState: React.MutableRefObject<any>;
    trailsRef: React.MutableRefObject<PIXI.Sprite[]>;
    assetManager: AssetManager | null;
    setScore: (score: number) => void;
    setActiveQuote: (quote: string | null) => void;
    keys: React.MutableRefObject<any>;
}

export const useCollisionHandler = ({
    physics,
    renderer,
    spawner,
    character,
    gameState,
    trailsRef,
    assetManager,
    setScore,
    setActiveQuote,
    keys
}: CollisionHandlerProps) => {

    const triggerGameOver = useCallback((obstacleType: 'low' | 'high' = 'low') => {
        if (!gameState.current.isGameOverLogic || !physics || !renderer || !character || !assetManager) {
            // If already game over, don't run again (unless we want to allow multiple triggers? No, loop flag handles it)
        }

        if (gameState.current.isGameOverLogic) return;
        gameState.current.isGameOverLogic = true;

        // Clear existing trails (e.g. from sprinting)
        trailsRef.current.forEach(t => {
            if (!t.destroyed) {
                renderer!.app.stage.removeChild(t);
                t.destroy();
            }
        });
        trailsRef.current = [];

        gameState.current.isDying = true;
        physics!.engine.timing.timeScale = GAME_CONFIG.deathSlowMotionScale; // Slow Motion

        character!.textures = assetManager!.animations.dead;
        character!.loop = false;
        character!.play();

        // Select knockback values based on obstacle type
        const kx = obstacleType === 'high' ? GAME_CONFIG.knockbackHighX : GAME_CONFIG.knockbackX;
        const ky = obstacleType === 'high' ? GAME_CONFIG.knockbackHighY : GAME_CONFIG.knockbackY;

        gameState.current.vx = -kx;

        // Apply knockback physics
        if (physics!.playerBody) {
            const isInAir = !physics!.isTouchingGround;
            const detachX = isInAir ? 20 : 5;
            Matter.Body.setPosition(physics!.playerBody, {
                x: physics!.playerBody.position.x - detachX,
                y: physics!.playerBody.position.y
            });
            const vy = Math.min(physics!.playerBody.velocity.y, 0);
            Matter.Body.setVelocity(physics!.playerBody, { x: 0, y: vy });
            Matter.Body.setAngularVelocity(physics!.playerBody, 0);
            physics!.playerBody.frictionAir = isInAir ? 0.2 : 0.05;
            Matter.Body.setInertia(physics!.playerBody, Infinity);
            Matter.Body.setVelocity(physics!.playerBody, {
                x: -kx,
                y: -ky
            });
        }
        console.log(`💥 GAME OVER - Slow Motion Start (${obstacleType} obstacle)`);
    }, [physics, renderer, character, assetManager, gameState, trailsRef]);

    useEffect(() => {
        if (!physics) return;

        const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;

                // Coin Collection
                const coinBody = bodyA.label === 'coin' ? bodyA : (bodyB.label === 'coin' ? bodyB : null);
                if (coinBody && spawner) {
                    const currentScore = spawner.coins.find(c => c.body === coinBody);
                    if (currentScore && !currentScore.collected) {
                        spawner.removeCoin(coinBody);

                        const newScore = gameState.current.score + 1;
                        gameState.current.score = newScore;
                        setScore(newScore);


                        if (newScore > 0 && newScore % 25 === 0) {
                            const quotes = GAME_CONFIG.SILESIAN_QUOTES;
                            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
                            setActiveQuote(randomQuote);

                            setTimeout(() => {
                                setActiveQuote(null);
                            }, GAME_CONFIG.quoteDuration);
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
                            triggerGameOver(isHigh ? 'high' : 'low');
                        }
                    }
                }
            });
        };

        Matter.Events.on(physics.engine, 'collisionStart', onCollision);

        return () => {
            Matter.Events.off(physics.engine, 'collisionStart', onCollision);
        };
    }, [physics, spawner, triggerGameOver, keys, setScore, gameState]);

    return { triggerGameOver };
};
