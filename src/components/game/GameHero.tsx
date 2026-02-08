"use client";

import { useEffect, useRef, useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import Noise from "@/components/animation/Noise";
import { GameUI } from "./GameUI";
import { IntroScreen } from './IntroScreen';
import { HighScoreOverlay } from './HighScoreOverlay';

type GameState = 'INTRO' | 'PLAYING' | 'HIGHSCORE_VIEW';

interface GameHeroProps {
    onGameReady?: () => void;
}

export default function GameHero({ onGameReady }: GameHeroProps) {
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<GameState>('INTRO');

    // 🛑 NOWOŚĆ: Flaga sprawdzająca, czy to pierwsza gra w sesji
    const hasPlayedRef = useRef(false);

    const {
        score,
        isGameOver,
        restartGame,
        activeQuote,
        assetManagerRef,
        isLoaded
    } = useGameEngine(canvasContainerRef, gameState === 'PLAYING');

    useEffect(() => {
        if (isLoaded && onGameReady) {
            onGameReady();
        }
    }, [isLoaded, onGameReady]);

    const handleStartGame = () => {

        if (hasPlayedRef.current) {
            restartGame();
        }
        hasPlayedRef.current = true;
        setGameState('PLAYING');
    };

    const handleShowHighScores = () => {
        setGameState('HIGHSCORE_VIEW');
    };

    const handleBackToIntro = () => {
        setGameState('INTRO');
    };

    return (
        <div className="relative w-full max-w-[1080px] mx-auto group">
            <div className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden bg-white shadow-2xl ">

                {/* 1. WARSTWA GRY (CANVAS) */}
                <div
                    ref={canvasContainerRef}
                    className="absolute inset-0 z-0 bg-black"
                />

                {/* 2. WARSTWA EFEKTÓW I UI */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
                    <Noise patternAlpha={100} patternSize={350} />
                </div>

                {/* State: INTRO */}
                {gameState === 'INTRO' && (
                    <IntroScreen
                        onStartGame={handleStartGame}
                        onShowHighScores={handleShowHighScores}
                    />
                )}

                {/* State: PLAYING (HUD & Game Over) */}
                <div className={`${gameState === 'PLAYING' ? 'block' : 'hidden'} w-full h-full relative z-20`}>
                    <GameUI
                        score={score}
                        isGameOver={isGameOver}
                        onRestart={restartGame}
                        onExit={handleBackToIntro}
                        activeQuote={activeQuote}
                        assetManager={assetManagerRef.current}
                    />
                </div>

                {/* State: HIGHSCORE_VIEW */}
                {gameState === 'HIGHSCORE_VIEW' && (
                    <div className="absolute inset-0 z-50 bg-black/90">
                        <HighScoreOverlay
                            score={0}
                            onComplete={handleBackToIntro}
                            viewOnly={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}