"use client";

import { useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import Noise from "@/components/animation/Noise";
import { GameUI } from "./GameUI";

export default function GameHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const {
        score,
        isGameOver,
        restartGame,
        activeQuote,
        assetManagerRef
    } = useGameEngine(containerRef);

    return (
        <div className="relative w-full max-w-[1080px] mx-auto group">
            <div
                ref={containerRef}
                className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden bg-white "
            >
                <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                    <Noise patternAlpha={100} patternSize={350} />
                </div>
                <GameUI
                    score={score}
                    isGameOver={isGameOver}
                    onRestart={restartGame}
                    activeQuote={activeQuote}
                    assetManager={assetManagerRef.current}
                />
            </div>

        </div>
    );
}
