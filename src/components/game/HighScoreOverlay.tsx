'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { submitScore, getTopScores } from '@/app/actions/highscore';
import { Loader2 } from 'lucide-react';

type Phase = 'INTRO' | 'INPUT' | 'LEADERBOARD';

interface HighScoreOverlayProps {
    score: number;
    onComplete: () => void;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');

export const HighScoreOverlay: React.FC<HighScoreOverlayProps> = ({ score, onComplete }) => {
    const [phase, setPhase] = useState<Phase>('INTRO');
    const [initials, setInitials] = useState<string[]>(['A', 'A', 'A']);
    const [activeIndex, setActiveIndex] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Phase 1: Intro Timer
    useEffect(() => {
        if (phase === 'INTRO') {
            const timer = setTimeout(() => {
                setPhase('INPUT');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [phase]);

    // Handle Keyboard Input
    const handleInput = useCallback(async (e: KeyboardEvent) => {
        if (phase !== 'INPUT' || isSubmitting) return;

        if (e.code === 'ArrowRight' || e.key === 'd') {
            setActiveIndex(prev => (prev + 1) % 3);
        } else if (e.code === 'ArrowLeft' || e.key === 'a') {
            setActiveIndex(prev => (prev - 1 + 3) % 3);
        } else if (e.code === 'ArrowUp' || e.key === 'w') {
            setInitials(prev => {
                const newInitials = [...prev];
                const currentIndex = CHARS.indexOf(newInitials[activeIndex]);
                const nextIndex = (currentIndex + 1) % CHARS.length;
                newInitials[activeIndex] = CHARS[nextIndex];
                return newInitials;
            });
        } else if (e.code === 'ArrowDown' || e.key === 's') {
            setInitials(prev => {
                const newInitials = [...prev];
                const currentIndex = CHARS.indexOf(newInitials[activeIndex]);
                const nextIndex = (currentIndex - 1 + CHARS.length) % CHARS.length;
                newInitials[activeIndex] = CHARS[nextIndex];
                return newInitials;
            });
        } else if (e.code === 'Enter') {
            setIsSubmitting(true);
            setSubmitError(null);

            const initialsStr = initials.join('');
            const result = await submitScore(initialsStr, score);

            if (result.success) {
                // Fetch fresh leaderboard
                const freshScores = await getTopScores(10);
                setLeaderboard(freshScores);
                setPhase('LEADERBOARD');
            } else {
                setSubmitError(typeof result.message === 'string' ? result.message : 'Submission failed');
                setIsSubmitting(false);
            }
        }
    }, [phase, activeIndex, initials, isSubmitting, score, activeIndex]);

    const handleLeaderboardInput = useCallback((e: KeyboardEvent) => {
        if (phase !== 'LEADERBOARD') return;
        if (e.code === 'Enter') {
            onComplete();
        }
    }, [phase, onComplete]);


    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (phase === 'INPUT') handleInput(e);
            if (phase === 'LEADERBOARD') handleLeaderboardInput(e);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, handleInput, handleLeaderboardInput]);


    return (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center font-retro text-white select-none">

            {/* Phase 1: Intro */}
            {phase === 'INTRO' && (
                <div className="flex flex-col items-center animate-in zoom-in duration-700">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[4px_4px_0_#000] animate-pulse scale-110">
                        HIGH SCORE!
                    </h1>
                    <p className="text-3xl mt-12 text-yellow-400 animate-bounce tracking-widest drop-shadow-[2px_2px_0_#000]">
                        ENTER INITIALS
                    </p>
                </div>
            )}

            {/* Phase 2: Input */}
            {phase === 'INPUT' && (
                <div className="flex flex-col items-center gap-16 animate-in fade-in slide-in-from-bottom-10 duration-500 w-full max-w-lg">
                    <div className="text-center">
                        <h2 className="text-4xl text-yellow-400 drop-shadow-[2px_2px_0_#000] mb-2">NEW RECORD</h2>
                        <p className="text-6xl font-bold text-white drop-shadow-[4px_4px_0_#000]">{score}</p>
                    </div>

                    <div className="flex gap-8">
                        {initials.map((char, idx) => (
                            <div key={idx} className="relative flex flex-col items-center">
                                <span className={`text-8xl font-black drop-shadow-[4px_4px_0_#000]
                                    ${activeIndex === idx ? 'text-white animate-pulse scale-110' : 'text-gray-600'}
                                    transition-all duration-100
                                `}>
                                    {char}
                                </span>
                                {activeIndex === idx && (
                                    <div className="absolute -bottom-6 w-full h-2 bg-yellow-400 animate-blink shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                )}
                            </div>
                        ))}
                    </div>

                    {isSubmitting ? (
                        <div className="flex items-center gap-2 text-2xl text-yellow-500 animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            SUBMITTING...
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            {submitError && <p className="text-red-500 text-xl mb-4 animate-shake">{submitError}</p>}
                            <p className="text-xl text-gray-400">
                                ARROWS to Select • ENTER to Submit
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Phase 3: Leaderboard */}
            {phase === 'LEADERBOARD' && (
                <div className="flex flex-col items-center w-full max-w-2xl animate-in zoom-in duration-300 px-4">
                    <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-blue-300 via-blue-500 to-blue-700 mb-8 drop-shadow-[3px_3px_0_#000]">
                        LEADERBOARD
                    </h2>

                    <div className="w-full flex flex-col gap-2 p-1 bg-blue-950/30 border-4 border-blue-900 rounded-xl relative overflow-hidden">
                        {/* Scanline overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-size-[100%_4px,3px_100%] opacity-20" />

                        <div className="bg-black/40 p-4 rounded-lg">
                            {leaderboard.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">NO SCORES YET</p>
                            ) : (
                                leaderboard.map((entry, idx) => {
                                    // Highlight logic: crude matching for now
                                    // ideally backend returns the ID of the inserted row
                                    const isMe = entry.score === score && entry.initials === initials.join('');

                                    return (
                                        <div key={entry.id || idx}
                                            className={`flex justify-between items-center text-2xl md:text-3xl p-2 rounded 
                                                ${isMe ? 'bg-yellow-500/20 text-yellow-300 animate-pulse font-bold' : 'text-gray-300 border-b border-white/5 last:border-0'}
                                            `}
                                        >
                                            <div className="flex gap-4">
                                                <span className={`${idx < 3 ? 'text-yellow-500' : 'text-gray-500'} w-8 text-right`}>#{idx + 1}</span>
                                                <span className="tracking-widest">{entry.initials}</span>
                                            </div>
                                            <span className="font-mono text-white/90 drop-shadow-sm">
                                                {String(entry.score).padStart(6, '0')}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center animate-bounce cursor-pointer group" onClick={onComplete}>
                        <p className="text-2xl text-white group-hover:text-yellow-400 transition-colors">PRESS ENTER TO CONTINUE</p>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .animate-blink {
                    animation: blink 0.5s step-end infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 3;
                }
            `}</style>
        </div>
    );
};
