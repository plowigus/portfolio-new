"use client";

import { useRef } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GameUI } from './GameUI';

export default function GameHero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { score, isGameOver, restartGame } = useGameEngine(containerRef);

    return (
        <div className="relative w-full max-w-[1080px] mx-auto group">
            <div
                ref={containerRef}
                className="relative w-[1080px] h-[450px] mx-auto z-10 overflow-hidden bg-white shadow-2xl rounded-xl border-4 border-slate-900"
            >
                <GameUI
                    score={score}
                    isGameOver={isGameOver}
                    onRestart={restartGame}
                />
            </div>

            {/* Instruction Overlay (Optional, consistent with portfolio style) */}
            <div className="absolute -bottom-10 left-0 w-full text-center text-slate-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Jump: Space/W/UpArrow | Slide: S/DownArrow | Restart: R
            </div>
        </div>
    );
}
