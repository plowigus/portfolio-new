'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { submitScore, getTopScores } from '@/app/actions/highscore';
import { Loader2 } from 'lucide-react';

type Phase = 'INTRO' | 'INPUT' | 'LEADERBOARD';

interface HighScoreOverlayProps {
    score: number;
    onComplete: () => void;
    viewOnly?: boolean; // New prop for Main Menu usage
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
const DOTS_FILL = "...........................................................................................................................";

export const HighScoreOverlay: React.FC<HighScoreOverlayProps> = ({ score, onComplete, viewOnly = false }) => {
    // Start at LEADERBOARD if viewOnly is true, otherwise INTRO
    const [phase, setPhase] = useState<Phase>(viewOnly ? 'LEADERBOARD' : 'INTRO');
    const [initials, setInitials] = useState<string[]>(['A', 'A', 'A']);
    const [activeIndex, setActiveIndex] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [newScoreId, setNewScoreId] = useState<number | null>(null);

    // Initial Fetch for ViewOnly mode
    useEffect(() => {
        if (viewOnly) {
            const fetchScores = async () => {
                const freshScores = await getTopScores(10);
                setLeaderboard(freshScores);
            };
            fetchScores();
        }
    }, [viewOnly]);

    // --- LOGIKA ---

    // Phase 1: Intro Timer
    useEffect(() => {
        if (phase === 'INTRO' && !viewOnly) {
            const timer = setTimeout(() => {
                setPhase('INPUT');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [phase, viewOnly]);

    // Handle Keyboard Input
    const handleInput = useCallback(async (e: KeyboardEvent) => {
        if (phase !== 'INPUT' || isSubmitting || viewOnly) return;

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

            if (result.success && result.newId) {
                setNewScoreId(result.newId);
                const freshScores = await getTopScores(10);
                setLeaderboard(freshScores);
                setPhase('LEADERBOARD');
                setIsSubmitting(false);
            } else {
                setSubmitError(typeof result.message === 'string' ? result.message : 'Submission failed');
                setIsSubmitting(false);
            }
        }
    }, [phase, activeIndex, initials, isSubmitting, score, viewOnly]);

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


    // --- RENDER ---

    return (
        <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center font-retro select-none overflow-hidden">

            {/* Retro Scanlines Background */}
            <div className="absolute inset-0 pointer-events-none z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%]" />
            <div className="absolute inset-0 pointer-events-none z-20 bg-black/10 animate-pulse" />


            {/* Phase 1: Intro */}
            {phase === 'INTRO' && (
                <div className="relative z-30 flex flex-col items-center animate-in zoom-in duration-700">
                    <h1 className="font-retro text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[4px_4px_0_#000] animate-pulse scale-110 tracking-wider">
                        HIGH SCORE
                    </h1>
                    <p className="font-retro text-3xl mt-12 text-blue-400 animate-bounce tracking-widest drop-shadow-[2px_2px_0_#000]">
                        ENTER INITIALS
                    </p>
                </div>
            )}

            {/* Phase 2: Input */}
            {phase === 'INPUT' && (
                <div className="relative z-30 flex flex-col items-center gap-12 w-full max-w-lg">
                    <div className="text-center">
                        <h2 className="font-retro text-4xl text-blue-400 drop-shadow-[2px_2px_0_#000] mb-4 tracking-widest">YOUR SCORE</h2>
                        <p className="font-retro text-7xl font-bold text-white drop-shadow-[4px_4px_0_#000] tracking-widest">{score}</p>
                    </div>

                    <div className="flex gap-8">
                        {initials.map((char, idx) => (
                            <div key={idx} className="relative flex flex-col items-center">
                                <span className={`font-retro text-9xl font-black drop-shadow-[4px_4px_0_#000]
                                    ${activeIndex === idx ? 'text-yellow-400 animate-pulse scale-110' : 'text-gray-700'}
                                    transition-all duration-100
                                `}>
                                    {char}
                                </span>
                                {activeIndex === idx && (
                                    <div className="absolute -bottom-4 w-full h-2 bg-red-500 animate-blink shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                                )}
                            </div>
                        ))}
                    </div>

                    {isSubmitting ? (
                        <div className="font-retro flex items-center gap-2 text-2xl text-yellow-500 animate-pulse mt-8">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            SAVING...
                        </div>
                    ) : (
                        <div className="text-center space-y-2 mt-4">
                            {submitError && <p className="font-retro text-red-500 text-xl mb-4 animate-shake">{submitError}</p>}
                            <p className="font-retro text-lg text-gray-500 tracking-widest">
                                ▲▼ SELECT &nbsp;&nbsp; ENTER SUBMIT
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Phase 3: Leaderboard */}
            {phase === 'LEADERBOARD' && (
                <div className="relative z-30 w-full h-full flex flex-col px-4 md:px-12 py-4 max-w-[800px]">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h2 className="font-retro text-3xl mt-2 font-black text-blue-500 tracking-[0.2em] drop-shadow-[3px_3px_0_#000] inline-block">
                            HIGH SCORES
                        </h2>
                    </div>

                    {/* Table Container */}
                    <div className="flex flex-col gap-0 w-full font-retro">
                        {/* Header Row */}
                        <div className="flex text-yellow-600 mb-2 text-lg md:text-xl font-retro border-b-2 border-yellow-800/50 pb-1">
                            <span className="w-16 font-retro text-left">RNK</span>
                            <span className="font-retro">NAME</span>
                            <span className="ml-auto font-retro">SCORE</span>
                        </div>

                        {leaderboard.length === 0 ? (
                            <p className="font-retro text-center text-gray-500 py-8">NO SCORES YET</p>
                        ) : (
                            leaderboard.map((entry, idx) => {
                                // HIGHLIGHT LOGIC: Use exact ID match
                                const isMe = newScoreId ? entry.id === newScoreId : false;
                                const rank = idx + 1;

                                // Rank Colors
                                let rankColor = "text-white";
                                if (rank === 1) rankColor = "text-yellow-400 "; // Gold
                                else if (rank === 2) rankColor = "text-gray-300";   // Silver
                                else if (rank === 3) rankColor = "text-orange-400"; // Bronze

                                const rowColor = isMe ? "text-blue-300 animate-pulse" : rankColor;

                                return (
                                    <div key={entry.id || idx} className={`flex items-end w-full ${rowColor} text-lg md:text-xl leading-snug`}>
                                        {/* RANK + INITIALS */}
                                        <div className="flex items-center whitespace-nowrap z-10 bg-black pr-2">
                                            <span className="w-16 text-left  font-retro">{rank}.</span>
                                            <span className="tracking-[0.2em] font-retro">{entry.initials}</span>
                                        </div>

                                        {/* REAL FONT DOTS FILLER */}
                                        {/* Flex-1 takes remaining space, overflow-hidden cuts the string */}
                                        <div className="flex-1 overflow-hidden whitespace-nowrap opacity-30 text-white relative top-[-3px]">
                                            {DOTS_FILL}
                                        </div>

                                        {/* SCORE */}
                                        <div className="whitespace-nowrap font-retro z-10 bg-black pl-2">
                                            {String(entry.score).padStart(6, '0')}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer - Updated for ViewOnly vs Game Over */}
                    <div className="mt-auto pt-2 text-center animate-bounce">
                        <p className="font-retro text-lg text-green-500 tracking-widest">
                            {viewOnly ? "PRESS ENTER TO RETURN" : "PRESS ENTER TO RESTART"}
                        </p>
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