import React, { useEffect, useState } from 'react';
import Coins from "lucide-react/dist/esm/icons/coins";
import Noise from '../animation/Noise';


interface GameUIProps {
    score: number;
    isGameOver: boolean;
    onRestart: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ score, isGameOver, onRestart }) => {
    const [selectedOption, setSelectedOption] = useState<'YES' | 'NO'>('YES');

    // Handle Menu Input
    useEffect(() => {
        if (!isGameOver) {
            setSelectedOption('YES');
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft' || e.key === 'a' || e.code === 'ArrowRight' || e.key === 'd') {
                setSelectedOption(prev => prev === 'YES' ? 'NO' : 'YES');
            } else if (e.code === 'Enter') {
                if (selectedOption === 'YES') {
                    onRestart();
                } else {
                    // No action or maybe exit logic
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver, selectedOption, onRestart]);

    // Hardcoded High Score for now as requested
    const highScore = 999;


    return (

        <div className="absolute inset-0 pointer-events-none tracking-widest selection:bg-none overflow-hidden text-white">

            <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" strokeWidth={2.5} />
                <span className="text-3xl font-bold drop-shadow-[2px_2px_0_#000]">
                    {String(score).padStart(3, '0')}
                </span>
            </div>

            <div className="absolute top-4 right-6 z-20 flex items-center gap-3">
                <span className="text-xl font-bold text-yellow-500 drop-shadow-[2px_2px_0_#000]">HI {highScore}</span>
            </div>

            {/* Game Over Screen */}
            {isGameOver && (
                <div className="absolute inset-0 z-50 pointer-events-auto bg-black/80 flex flex-col items-center justify-center">
                    {/* Noise Effect Background */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <Noise patternAlpha={50} patternSize={400} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center  animate-in fade-in active:scale-[0.99] duration-300">
                        {/* Title */}
                        <h1 className="text-7xl font-retro md:text-9xl font-black text-white tracking-normal uppercase drop-shadow-[4px_4px_0_#000]">
                            GAME OVER
                        </h1>

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-4xl md:text-4xl text-white font-retro uppercase tracking-widest drop-shadow-[2px_2px_0_#000]">TRY AGAIN ?</h2>

                            <div className="flex items-center gap-18 text-3xl md:text-4xl font-bold uppercase mt-4">
                                <div className={`cursor-pointer transition-opacity ${selectedOption === 'YES' ? 'opacity-100' : 'opacity-40'}`}>
                                    <span className="text-white text-4xl font-retro drop-shadow-[2px_2px_0_#000]">YES</span>
                                    {selectedOption === 'YES' && <div className="h-1 bg-white mt-1 w-full animate-blink"></div>}
                                </div>

                                <div className={`cursor-pointer transition-opacity ${selectedOption === 'NO' ? 'opacity-100' : 'opacity-40'}`}>
                                    <span className="text-white text-4xl font-retro ddrop-shadow-[2px_2px_0_#000]">NO</span>
                                    {selectedOption === 'NO' && <div className="h-1 bg-white mt-1 w-full animate-blink"></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 0.8s step-end infinite;
                }
            `}</style>
        </div>
    );
};
