import React, { useEffect, useState } from 'react';
import Coins from "lucide-react/dist/esm/icons/coins";
import Noise from '../animation/Noise';
import { TalkingHead } from './TalkingHead';
import { HighScoreOverlay } from './HighScoreOverlay';
import { getTopScores } from '@/app/actions/highscore';

interface GameUIProps {
    score: number;
    isGameOver: boolean;
    onRestart: () => void;
    activeQuote: string | null;
    assetManager: any;
}

export const GameUI: React.FC<GameUIProps> = ({
    score,
    isGameOver,
    onRestart,
    activeQuote,
    assetManager
}) => {
    const [selectedOption, setSelectedOption] = useState<'YES' | 'NO'>('YES');
    const [showHighScoreFlow, setShowHighScoreFlow] = useState(false);
    const [isCheckingScore, setIsCheckingScore] = useState(false);
    const [highScore, setHighScore] = useState(0);

    // Extract UI textures if available
    const uiTextures = assetManager?.textures ? {
        faceClosed: assetManager.textures.faceClosed,
        faceOpen: assetManager.textures.faceOpen
    } : null;

    // Fetch Global High Score on Mount
    useEffect(() => {
        const fetchGlobalHigh = async () => {
            try {
                const top = await getTopScores(1);
                if (top && top.length > 0) {
                    setHighScore(top[0].score);
                }
            } catch (e) {
                console.error("Failed to fetch global high score", e);
            }
        };
        fetchGlobalHigh();
    }, []);

    // Handle Game Over -> High Score Check
    useEffect(() => {
        if (isGameOver) {
            const checkQualification = async () => {
                if (score <= 0) return; // Ignore 0 scores
                setIsCheckingScore(true);

                try {
                    const topScores = await getTopScores(10);
                    // Determine lowest score in top 10 (or 0 if list is not full)
                    const lowestScore = topScores.length < 10 ? 0 : topScores[topScores.length - 1].score;

                    // Logic: Qualify if leaderboard has space OR score beats the lowest
                    if (topScores.length < 10 || score > lowestScore) {
                        setShowHighScoreFlow(true);
                    }

                    // Also update the displayed high score if we just beat it
                    const currentTop = topScores.length > 0 ? topScores[0].score : 0;
                    if (score > currentTop) {
                        setHighScore(score);
                    }
                } catch (err) {
                    console.error("Failed to check high scores", err);
                } finally {
                    setIsCheckingScore(false);
                }
            };

            checkQualification();
        } else {
            // Reset state on game start
            setShowHighScoreFlow(false);
            setIsCheckingScore(false);
            setSelectedOption('YES');
        }
    }, [isGameOver, score]);

    // Handle Menu Input (Standard Game Over)
    useEffect(() => {
        // Only active if Game Over matches, NOT showing high score flow, and NOT currently checking
        if (!isGameOver || showHighScoreFlow || isCheckingScore) return;

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
    }, [isGameOver, selectedOption, onRestart, showHighScoreFlow, isCheckingScore]);


    return (
        <div className="absolute inset-0 pointer-events-none tracking-widest selection:bg-none overflow-hidden text-white">

            {/* Doom Style Talking Head */}
            <TalkingHead quote={activeQuote} textures={uiTextures} />

            <div className="absolute top-4 left-6 z-20 flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-400 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" strokeWidth={2.5} />
                <span className="text-3xl font-bold drop-shadow-[2px_2px_0_#000]">
                    {String(score).padStart(3, '0')}
                </span>
            </div>

            <div className="absolute top-4 right-6 z-20 flex items-center gap-3">
                <span className="text-xl font-bold text-yellow-500 drop-shadow-[2px_2px_0_#000]">HIGH SCORE:  {highScore}</span>
            </div>

            {/* High Score Overlay */}
            {showHighScoreFlow && (
                <div className="absolute inset-0 z-50 pointer-events-auto">
                    <HighScoreOverlay
                        score={score}
                        onComplete={() => setShowHighScoreFlow(false)}
                    />
                </div>
            )}

            {/* Standard Game Over Screen */}
            {isGameOver && !showHighScoreFlow && !isCheckingScore && (
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
                                    <span className="text-white text-4xl font-retro drop-shadow-[2px_2px_0_#000]">NO</span>
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
