import React from 'react';
import { Play, Square, Trash2 } from 'lucide-react';

interface TransportControlsProps {
    isPlaying: boolean;
    tempo: number;
    onPlayToggle: () => void;
    onTempoChange: (bpm: number) => void;
    onClear: () => void;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
    isPlaying,
    tempo,
    onPlayToggle,
    onTempoChange,
    onClear
}) => {
    return (
        <div className="flex items-end justify-between w-full h-full">

            {/* Playback Controls */}
            <div className="flex gap-4">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Start / Stop</span>
                    <button
                        onClick={onPlayToggle}
                        className="w-24 h-16 bg-[#D84B20] rounded-[2px] shadow-[0_4px_0_#8E3316] active:shadow-none active:translate-y-[4px] border-t border-l border-[#F07C59] border-r border-b border-[#8E3316] transition-all flex items-center justify-center text-white/90"
                    >
                        {/* Realistic button styling */}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Clear</span>
                    <button
                        onClick={onClear}
                        className="w-12 h-10 bg-[#333] rounded-[2px] shadow-[0_3px_0_#111] active:shadow-none active:translate-y-[3px] border-t border-l border-[#555] border-r border-b border-[#000] transition-all flex items-center justify-center text-zinc-400 hover:text-white"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* LCD Display Area */}
            <div className="flex flex-col items-end">
                <div className="bg-[#2a3028] border-8 border-t-zinc-400 border-l-zinc-400 border-b-zinc-200 border-r-zinc-200 rounded-sm p-4 w-64 h-24 shadow-inner relative flex flex-col justify-between font-mono">
                    <div className="flex justify-between text-[#8cb090] text-xs uppercase opacity-70">
                        <span>Tempo</span>
                        <span>Measure</span>
                        <span>Pattern</span>
                    </div>
                    <div className="flex justify-between items-end text-[#222]">
                        {/* Digital segments simulation */}
                        <div className="text-4xl font-bold tracking-widest font-[monospace] drop-shadow-sm text-black/80">{tempo}</div>
                    </div>
                </div>

                {/* Tempo Knob */}
                <div className="mt-4 flex flex-col items-center gap-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-600">Tempo Dial</label>
                    <input
                        type="range"
                        min="40"
                        max="300"
                        value={tempo}
                        onChange={(e) => onTempoChange(parseInt(e.target.value))}
                        className="w-40 h-2 bg-zinc-400 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-600 [&::-webkit-slider-thumb]:shadow-lg cursor-grab active:cursor-grabbing"
                    />
                </div>
            </div>

        </div>
    );
};
