import React, { useEffect, useState } from 'react';
import Noise from '../animation/Noise';
import { TalkingHead } from './TalkingHead';
import { HighScoreOverlay } from './HighScoreOverlay';
import { getTopScores } from '@/app/actions/highscore';

interface GameUIProps {
    score: number;
    lives: number;
    isGameOver: boolean;
    onRestart: () => void;
    onExit: () => void;
    activeQuote: string | null;
    assetManager: any;
    // Arena Props removed
}

export const GameUI: React.FC<GameUIProps> = ({
    score,
    lives,
    isGameOver,
    onRestart,
    onExit,
    activeQuote,
    assetManager
}) => {
    const [selectedOption, setSelectedOption] = useState<'YES' | 'NO'>('YES');
    const [showHighScoreFlow, setShowHighScoreFlow] = useState(false);
    const [isCheckingScore, setIsCheckingScore] = useState(false);
    const [highScore, setHighScore] = useState(0);

    const uiTextures = assetManager?.textures ? {
        faceClosed: assetManager.textures.faceClosed,
        faceOpen: assetManager.textures.faceOpen
    } : null;

    // Fetch Global High Score
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

    // Game Over Logic ...
    useEffect(() => {
        if (isGameOver) {
            const checkQualification = async () => {
                if (score <= 0) return;
                setIsCheckingScore(true);
                try {
                    const topScores = await getTopScores(10);
                    const lowestScore = topScores.length < 10 ? 0 : topScores[topScores.length - 1].score;

                    if (topScores.length < 10 || score > lowestScore) {
                        setShowHighScoreFlow(true);
                    }
                    if (topScores.length > 0 && score > topScores[0].score) {
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
            setShowHighScoreFlow(false);
            setIsCheckingScore(false);
            setSelectedOption('YES');
        }
    }, [isGameOver, score]);

    // Input Handling ...
    useEffect(() => {
        if (!isGameOver || showHighScoreFlow || isCheckingScore) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft' || e.key === 'a' || e.code === 'ArrowRight' || e.key === 'd') {
                setSelectedOption(prev => prev === 'YES' ? 'NO' : 'YES');
            } else if (e.code === 'Enter') {
                if (selectedOption === 'YES') {
                    onRestart();
                } else {
                    onExit();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver, selectedOption, onRestart, onExit, showHighScoreFlow, isCheckingScore]);

    return (
        <div className="absolute inset-0 pointer-events-none tracking-widest selection:bg-none overflow-hidden text-white">

            <TalkingHead quote={activeQuote} textures={uiTextures} />

            {/* Score & Lives */}
            <div className="absolute top-4 left-6 z-20 flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/items/kluska.gif"
                        alt="Kluska Coin"
                        className="w-10 h-10 drop-shadow-[2px_2px_0_rgba(0,0,0,1)] object-contain"
                        style={{ imageRendering: "pixelated" }}
                    />
                    <span className="text-3xl font-bold drop-shadow-[2px_2px_0_#000]">
                        {String(score).padStart(3, '0')}
                    </span>
                </div>

                <div className="flex gap-1 ml-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <img
                            key={i}
                            src="/assets/ui/heart.png"
                            alt={i < lives ? "Active Life" : "Lost Life"}
                            className={`w-8 h-8 drop-shadow-[2px_2px_0_#000] object-contain transition-all duration-300 ${i >= lives ? 'grayscale' : ''}`}
                            style={{
                                imageRendering: "pixelated",
                                opacity: i < lives ? 1 : 0.25
                            }}
                        />
                    ))}
                </div>


            </div>

            {/* High Score */}
            <div className="absolute top-4 right-6 z-20 flex items-center gap-3">
                <span className="text-xl font-bold text-yellow-500 drop-shadow-[2px_2px_0_#000]">HIGH SCORE: {highScore}</span>
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

            {/* Game Over Screen */}
            {isGameOver && !showHighScoreFlow && !isCheckingScore && (
                <div className="absolute inset-0 z-50 pointer-events-auto bg-black/80 flex flex-col items-center justify-center">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <Noise patternAlpha={50} patternSize={400} />
                    </div>

                    <div className="relative z-10 flex flex-col items-center animate-in fade-in active:scale-[0.99] duration-300">
                        <h1 className="text-7xl font-retro md:text-9xl font-black text-white tracking-normal uppercase drop-shadow-[4px_4px_0_#000]">
                            GAME OVER
                        </h1>

                        <div className="flex flex-col items-center gap-2">
                            <h2 className="text-4xl md:text-4xl text-white font-retro uppercase tracking-widest drop-shadow-[2px_2px_0_#000]">TRY AGAIN ?</h2>

                            <div className="flex items-center gap-18 text-3xl md:text-4xl font-bold uppercase mt-4">
                                <div
                                    className={`cursor-pointer transition-opacity ${selectedOption === 'YES' ? 'opacity-100' : 'opacity-40'}`}
                                    onClick={onRestart}
                                >
                                    <span className="text-white text-4xl font-retro drop-shadow-[2px_2px_0_#000]">YES</span>
                                    {selectedOption === 'YES' && <div className="h-1 bg-white mt-1 w-full animate-blink"></div>}
                                </div>

                                <div
                                    className={`cursor-pointer transition-opacity ${selectedOption === 'NO' ? 'opacity-100' : 'opacity-40'}`}
                                    onClick={onExit}
                                >
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