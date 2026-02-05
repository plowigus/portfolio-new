import React from 'react';

interface GameUIProps {
    score: number;
    isGameOver: boolean;
    onRestart: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({ score, isGameOver, onRestart }) => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Score HUD */}
            <div className="absolute top-4 left-4 z-20">
                <h2 className="text-4xl font-bold text-yellow-500 drop-shadow-md stroke-black" style={{ textShadow: '2px 2px 0 #000' }}>
                    COINS: {score}
                </h2>
            </div>

            {/* Game Over Screen */}
            {isGameOver && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50 pointer-events-auto">
                    <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">GAME OVER</h1>
                    <p className="text-2xl text-yellow-400 mb-8">Score: {score}</p>
                    <button
                        onClick={onRestart}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Try Again
                    </button>
                    <p className="mt-4 text-white/50 text-sm">Press Space or Click to Restart</p>
                </div>
            )}
        </div>
    );
};
