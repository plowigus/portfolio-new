import React, { memo } from 'react';
import { cn } from './utils';

// We compare props closely. pattern is an array, so we need to be careful.
// Ideally usage in parent: parent passes `pattern[index]` which is a stable array ref unless changed.
// DrumMachine updates pattern by creating new array. So memo will only help if OTHER rows don't change.
// But `setPattern` in DrumMachine is: newPattern = [...prev]; newPattern[i] = [...prev[i]]; 
// So OTHER rows keep their array reference! Yes! Memo will work perfectly.

interface SequencerRowProps {
    label: string;
    channelId: number;
    pattern: boolean[];
    activeStep: number;
    onStepToggle: (channelId: number, stepIndex: number) => void;
}

export const SequencerRow: React.FC<SequencerRowProps> = memo(({
    label,
    channelId,
    pattern,
    activeStep,
    onStepToggle
}) => {
    return (
        <div className="flex items-center gap-2 w-full h-6 mb-[1px]">
            {/* Left Label */}
            <div className="w-20 text-[8px] font-bold text-zinc-700 bg-zinc-300 h-full flex items-center justify-end px-2 border border-zinc-400 rounded-[1px] shadow-sm truncate">
                {label}
            </div>

            {/* Steps Row */}
            <div className="flex-1 grid grid-cols-16 gap-[1px] h-full">
                {pattern.map((isActive, index) => {
                    const isCurrent = activeStep === index;
                    const isGroupB = Math.floor(index / 4) % 2 === 1;

                    return (
                        <button
                            key={index}
                            onClick={() => onStepToggle(channelId, index)}
                            className={cn(
                                "h-full w-full rounded-[1px] transition-none relative border-b border-r border-[#888]", // Removed transition for perf
                                isGroupB ? "bg-[#aaa]" : "bg-[#dadada]",
                                isActive && "bg-[#FF3333] border-red-900 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]",
                                isCurrent && !isActive && "bg-white",
                                isCurrent && isActive && "brightness-125 ring-1 ring-white/50 z-10"
                            )}
                        >
                            {/* Reduced DOM complexity: no internal divs unless necessary */}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

SequencerRow.displayName = "SequencerRow";
