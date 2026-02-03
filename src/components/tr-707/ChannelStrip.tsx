import React from 'react';
import { Channel } from './types';
import { cn } from './utils';

interface ChannelStripProps {
    channel: Channel;
    pattern: boolean[];
    activeStep: number;
    onVolumeChange: (id: number, volume: number) => void;
    onStepToggle: (channelId: number, stepIndex: number) => void;
    onMuteToggle: (id: number) => void;
    onSoloToggle: (id: number) => void;
}

export const ChannelStrip: React.FC<ChannelStripProps> = ({
    channel,
    pattern,
    activeStep,
    onVolumeChange,
    onStepToggle,
    onMuteToggle,
    onSoloToggle
}) => {
    return (
        <div className="flex flex-col items-center gap-2 min-w-[72px] p-0 border-r-2 border-[#1a1a1a] last:border-r-0 select-none">
            {/* Instrument Label */}
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-tight text-center w-full pb-1 border-b border-zinc-400 mb-1">
                {channel.name}
            </div>

            {/* MUTE / SOLO */}
            <div className="flex flex-col gap-1 w-full px-2">
                <button
                    onClick={() => onMuteToggle(channel.id)}
                    className={cn(
                        "w-full text-[8px] h-4 flex items-center justify-center font-bold border border-zinc-600 rounded-[1px] shadow-sm",
                        channel.mute ? "bg-red-600 text-white" : "bg-[#DDD] text-zinc-500 hover:bg-zinc-200"
                    )}
                >
                    M
                </button>
                <button
                    onClick={() => onSoloToggle(channel.id)}
                    className={cn(
                        "w-full text-[8px] h-4 flex items-center justify-center font-bold border border-zinc-600 rounded-[1px] shadow-sm",
                        channel.solo ? "bg-yellow-500 text-black" : "bg-[#DDD] text-zinc-500 hover:bg-zinc-200"
                    )}
                >
                    S
                </button>
            </div>

            {/* Realistic Fader Track */}
            <div className="flex-1 w-full flex justify-center py-2">
                <div className="relative w-8 h-32 bg-[#e0e0e0] border border-zinc-500/50 rounded-sm shadow-inner flex justify-center">
                    {/* Track Line */}
                    <div className="absolute top-2 bottom-2 w-[2px] bg-black/80 rounded-full"></div>

                    {/* Ticks */}
                    <div className="absolute top-2 bottom-2 w-full flex flex-col justify-between px-1 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-[1px] bg-zinc-400 self-start"></div>
                        ))}
                    </div>
                    <div className="absolute top-2 bottom-2 w-full flex flex-col justify-between px-1 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-2 h-[1px] bg-zinc-400 self-end"></div>
                        ))}
                    </div>

                    {/* Invisible Input for Interaction */}
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={channel.volume}
                        onChange={(e) => onVolumeChange(channel.id, parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-20"
                        style={{ appearance: 'slider-vertical' } as any} // Webkit hack, though we rely on custom fader component usually.
                    // Standard range input is horizontal. We need to handle this carefully.
                    // Actually, for a pure CSS fader, we often use a vertical slider implementation or key listeners.
                    // But sticking to the transform rotation trick is easier for reliable cross-browser if we can't use `appearance: slider-vertical`.
                    />

                    {/* The Fader Cap Visual - Positioned by state */}
                    <div
                        className="absolute w-6 h-10 bg-[#222] border-l border-t border-white/20 border-r border-b border-black shadow-lg rounded-[1px] z-10 pointer-events-none flex items-center justify-center"
                        style={{ bottom: `${channel.volume * 80}%` }} // Approximate position
                    >
                        <div className="w-full h-[2px] bg-orange-600"></div>
                        <div className="absolute w-full h-[1px] bg-white/50 top-[40%]"></div>
                    </div>
                </div>
            </div>

            {/* Step Grid for this channel */}
            <div className="grid grid-cols-4 gap-[2px] mt-2 w-full px-[2px]">
                {pattern.map((isActive, index) => {
                    const isCurrent = activeStep === index;
                    // Grouping logic for visuals (colors change every 4 beats)
                    const isGroupB = Math.floor(index / 4) % 2 === 1; // 5-8, 13-16

                    return (
                        <button
                            key={index}
                            onClick={() => onStepToggle(channel.id, index)}
                            className={cn(
                                "w-full aspect-[4/3] rounded-[1px] border-b border-r border-zinc-600 transition-all duration-75 relative flex items-center justify-center shadow-sm",
                                isGroupB ? "bg-[#999]" : "bg-[#DDD]", // Alternating group colors
                                isActive && "bg-[#FF3333] shadow-[0_0_5px_rgba(255,0,0,0.6)] border-red-900",
                                isCurrent && !isActive && "bg-white",
                                isCurrent && isActive && "brightness-125"
                            )}
                        >
                            {/* Inner LED reflection */}
                            {isActive && <div className="w-[40%] h-[40%] bg-white/20 rounded-full blur-[1px]" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
