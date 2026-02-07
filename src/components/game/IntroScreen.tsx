import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface IntroScreenProps {
    onStartGame: () => void;
    onShowHighScores: () => void;
}

const MENU_ITEMS = [
    { label: 'NEW GAME', action: 'START' },
    { label: 'OPTIONS', action: 'OPTIONS', disabled: true },
    { label: 'HIGH SCORE', action: 'HIGHSCORES' },
    { label: 'CREDITS', action: 'CREDITS', disabled: true },
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame, onShowHighScores }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.code === 'ArrowUp' || e.code === 'KeyW') {
            setSelectedIndex(prev => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
        } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
            setSelectedIndex(prev => (prev + 1) % MENU_ITEMS.length);
        } else if (e.code === 'Enter') {
            const item = MENU_ITEMS[selectedIndex];
            if (item.disabled) return;

            if (item.action === 'START') {
                onStartGame();
            } else if (item.action === 'HIGHSCORES') {
                onShowHighScores();
            }
        }
    }, [selectedIndex, onStartGame, onShowHighScores]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-end bg-black text-white overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/backgrounds/intro-bg.png"
                    alt="Intro Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>

            {/* Gradient Overlay for better text readability on the right */}
            <div className="absolute inset-0 z-10 bg-linear-to-r from-transparent via-black/20 to-black/80" />

            {/* Content Container */}
            <div className="relative z-20 flex flex-col items-end pr-16 pb-8 h-full justify-center">

                {/* Main Title */}
                <div className="flex flex-col items-end mb-12">
                    <h1 className="font-thuast text-8xl md:text-7xl text-red-700 drop-shadow-[5px_5px_0_rgba(0,0,0,0.8)] leading-none text-right">
                        SILESIA
                    </h1>
                    <h1 className="font-thuast text-8xl md:text-7xl text-white drop-shadow-[5px_5px_0_rgba(0,0,0,0.8)] leading-none text-right -mt-4">
                        RUNNER
                    </h1>
                </div>

                {/* Menu */}
                <div className="flex flex-col items-end gap-2">
                    {/* <h2 className="font-retro text-2xl text-blue-400 mb-2 tracking-widest drop-shadow-md">MENU:</h2> */}

                    <ul className="flex flex-col items-end gap-1">
                        {MENU_ITEMS.map((item, index) => {
                            const isSelected = index === selectedIndex;
                            return (
                                <li
                                    key={item.label}
                                    className={`
                                        font-retro text-4xl md:text-5xl transition-all duration-200 flex items-center gap-3
                                        ${item.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                        ${isSelected ? 'text-red-700 scale-105' : 'text-gray-300'}
                                    `}
                                >
                                    {isSelected && <span className="text-red-700 animate-pulse text-3xl">▶</span>}
                                    <span className={`drop-shadow-[3px_3px_0_#000] font-retro ${item.disabled ? '' : 'hover:text-red-500'}`}>
                                        {item.label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* Version / Info Footer */}
                <div className="absolute bottom-4 right-4 text-white/30 font-mono text-xs text-right">
                    v1.0.0 • PRESS ENTER TO SELECT
                </div>
            </div>
        </div>
    );
};
