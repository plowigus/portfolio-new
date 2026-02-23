'use client';

import React, { useState, useEffect } from 'react';
import { GAME_CONFIG } from '@/config/gameConfig';

interface MomoQuizModalProps {
    onAnswer: (isCorrect: boolean) => void;
}

export const MomoQuizModal: React.FC<MomoQuizModalProps> = ({ onAnswer }) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const cfg = GAME_CONFIG.MOMO_EVENT;

    const handleSelect = (index: number) => {
        if (showFeedback) return;
        setSelectedIndex(index);
        setShowFeedback(true);

        const isCorrect = index === cfg.correctAnswerIndex;

        setTimeout(() => {
            onAnswer(isCorrect);
        }, 1200);
    };


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = parseInt(e.key);
            if (key >= 1 && key <= cfg.answers.length && !showFeedback) {
                handleSelect(key - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showFeedback]);

    const getButtonStyle = (index: number) => {
        if (!showFeedback) {
            return 'bg-gray-900/80 border-2 border-amber-400/50 hover:border-amber-400 hover:bg-amber-900/40 text-white';
        }
        if (index === cfg.correctAnswerIndex) {
            return 'bg-green-800/80 border-2 border-green-400 text-green-200';
        }
        if (index === selectedIndex && index !== cfg.correctAnswerIndex) {
            return 'bg-red-800/80 border-2 border-red-400 text-red-200';
        }
        return 'bg-gray-900/60 border-2 border-gray-600/30 text-gray-500 opacity-50';
    };

    return (
        <div className="absolute inset-0 z-50 pointer-events-auto flex items-center justify-center">

            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />


            <div
                className="relative z-10 w-full max-w-lg mx-4 p-1"
                style={{
                    background: 'linear-gradient(135deg, #d4a017 0%, #b8860b 50%, #d4a017 100%)',
                }}
            >
                <div
                    className="bg-gray-950/95 p-6"
                    style={{
                        boxShadow: 'inset 0 0 30px rgba(212, 160, 23, 0.1)',
                    }}
                >
                    {/* Title */}
                    <h2
                        className="text-center text-amber-400 text-xl font-bold tracking-wider uppercase mb-1 drop-shadow-[2px_2px_0_#000]"
                        style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '16px', lineHeight: '1.6' }}
                    >
                        MOMO BOSSÓWA W SERCE NA DŁONI
                    </h2>


                    <p
                        className="text-center text-amber-100/90 text-sm mb-6 leading-relaxed uppercase"
                        style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '13px', lineHeight: '1.8' }}
                    >
                        {cfg.question}
                    </p>


                    <div className="grid grid-cols-1 gap-2">
                        {cfg.answers.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelect(index)}
                                disabled={showFeedback}
                                className={`
                                    w-full py-3 px-4 text-left cursor-pointer uppercase
                                    transition-all duration-200
                                    ${getButtonStyle(index)}
                                `}
                                style={{
                                    fontFamily: '"Press Start 2P", monospace',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                }}
                            >
                                <span className="text-amber-400/70 mr-3">{index + 1}.</span>
                                {answer}
                            </button>
                        ))}
                    </div>


                    {showFeedback && (
                        <div className="mt-4 text-center">
                            {selectedIndex === cfg.correctAnswerIndex ? (
                                <p
                                    className="text-green-400 animate-pulse uppercase"
                                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '13px' }}
                                >
                                    ✅ DOBRZE! +{cfg.reward} KLUSEK!
                                </p>
                            ) : (
                                <p
                                    className="text-red-400 uppercase"
                                    style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '13px' }}
                                >
                                    ❌ Źle! Odpowiedź: {cfg.answers[cfg.correctAnswerIndex]}
                                </p>
                            )}
                        </div>
                    )}


                    {!showFeedback && (
                        <p
                            className="text-center text-amber-500/50 mt-4 uppercase"
                            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '11px' }}
                        >
                            NAGRODA: +{cfg.reward} KLUSEK
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
