import React, { memo } from 'react';
import { Channel } from './types';
import { cn } from './utils';
import { Knob } from './Knob';

interface MixerChannelProps {
    channel: Channel;
    onVolumeChange: (id: number, volume: number) => void;
    onPanChange: (id: number, pan: number) => void;
    onTuneChange: (id: number, tune: number) => void;
    onMuteToggle: (id: number) => void;
    onSoloToggle: (id: number) => void;
}

export const MixerChannel: React.FC<MixerChannelProps> = memo(({
    channel,
    onVolumeChange,
    onPanChange,
    onTuneChange,
    onMuteToggle,
    onSoloToggle
}) => {
    return (
        <div className="flex flex-col items-center h-full min-w-[72px] border-r border-[#bbb] px-1 select-none last:border-r-0">
            {/* Top Label */}
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-tight text-center w-full py-2 border-b border-[#bbb] mb-2 truncate px-1">
                {channel.name}
            </div>

            {/* Knobs Section */}
            <div className="flex flex-col gap-3 mb-4 w-full px-1 items-center">
                {/* Tune Knob */}
                <Knob
                    label="Tune"
                    min={-12}
                    max={12}
                    value={channel.tune}
                    onChange={(val) => onTuneChange(channel.id, val)}
                />

                {/* Pan Control (Reference shows Slider or Knob? User said "takie pokrętło jak na mixerach" for TONE, but image shows sliders for Pan. I will stick to small slider for Pan just to vary, or Knob if preferred. The image shows SLIDERS for Pan.) */}
                {/* Actually, user uploaded image shows Pan as a small horizontal slider. I will keep it as horizontal slider. */}
                <div className="flex flex-col items-center gap-1 w-full p-1">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase">Pan</span>
                    <input
                        type="range"
                        min="-1"
                        max="1"
                        step="0.1"
                        value={channel.pan}
                        onChange={(e) => onPanChange(channel.id, parseFloat(e.target.value))}
                        className="w-10 h-1 bg-zinc-400 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#333] [&::-webkit-slider-thumb]:rounded-[1px] cursor-pointer"
                    />
                </div>
            </div>

            {/* Mute/Solo Buttons */}
            <div className="flex flex-col gap-1 w-full px-2 mb-4">
                <button
                    onClick={() => onMuteToggle(channel.id)}
                    className={cn(
                        "w-full text-[9px] h-5 flex items-center justify-center font-bold border border-zinc-500 rounded-[1px] shadow-sm transition-all",
                        channel.mute ? "bg-red-600 text-white border-red-800" : "bg-[#e8e8e8] text-zinc-500 hover:bg-zinc-200"
                    )}
                >
                    M
                </button>
                <button
                    onClick={() => onSoloToggle(channel.id)}
                    className={cn(
                        "w-full text-[9px] h-5 flex items-center justify-center font-bold border border-zinc-500 rounded-[1px] shadow-sm transition-all",
                        channel.solo ? "bg-yellow-500 text-black border-yellow-700" : "bg-[#e8e8e8] text-zinc-500 hover:bg-zinc-200"
                    )}
                >
                    S
                </button>
            </div>

            {/* Fader Area */}
            <div className="flex-1 w-full flex justify-center py-2 relative">
                <div className="relative w-8 bg-[#dadada] border border-zinc-400 rounded-sm shadow-inner flex justify-center h-40">
                    {/* Track Line */}
                    <div className="absolute top-2 bottom-2 w-[2px] bg-black/70 rounded-full z-0"></div>

                    {/* Horizontal Ticks */}
                    <div className="absolute top-2 bottom-2 w-full flex flex-col justify-between px-1 pointer-events-none z-0">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="w-2 h-px bg-zinc-400 self-center"></div>
                        ))}
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={channel.volume}
                        onChange={(e) => onVolumeChange(channel.id, parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        style={{ appearance: 'slider-vertical' } as any}
                    />

                    {/* Fader Cap */}
                    <div
                        className="absolute w-6 h-8 bg-[#222] border-l border-t border-white/20 border-r border-b border-black shadow-[0_4px_4px_rgba(0,0,0,0.3)] rounded-[1px] z-10 pointer-events-none flex items-center justify-center"
                        style={{ bottom: `${channel.volume * 75 + 5}%` }}
                    >
                        <div className="w-full h-[2px] bg-red-600 shadow-[0_0_2px_rgba(255,0,0,0.5)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
});

MixerChannel.displayName = "MixerChannel";
