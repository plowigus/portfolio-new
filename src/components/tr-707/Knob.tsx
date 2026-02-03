import React, { useState, useEffect, useRef } from 'react';
import { cn } from './utils';

interface KnobProps {
    min: number;
    max: number;
    value: number;
    onChange: (value: number) => void;
    label?: string;
    className?: string;
}

export const Knob: React.FC<KnobProps> = ({ min, max, value, onChange, label, className }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startY = useRef<number>(0);
    const startValue = useRef<number>(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        startY.current = e.clientY;
        startValue.current = value;
        document.body.style.cursor = 'ns-resize';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const deltaY = startY.current - e.clientY;
        // Sensitivity: 100px = full range?
        const range = max - min;
        const deltaValue = (deltaY / 100) * range;
        const newValue = Math.min(max, Math.max(min, startValue.current + deltaValue));
        onChange(newValue);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // Calculate rotation: map value to -135deg to +135deg
    const percentage = (value - min) / (max - min);
    const rotation = -135 + (percentage * 270);

    return (
        <div className={cn("flex flex-col items-center gap-1 select-none", className)}>
            {label && <span className="text-[8px] font-bold text-zinc-500 uppercase">{label}</span>}
            <div
                onMouseDown={handleMouseDown}
                className="w-10 h-10 rounded-full bg-[#444] border-2 border-[#222] shadow-sm relative cursor-ns-resize flex items-center justify-center group"
            >
                {/* Knob Body Shading */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#555] to-[#333]"></div>

                {/* Indicator / Cap */}
                <div
                    className="w-full h-full rounded-full absolute"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* The pointer line */}
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[2px] h-[30%] bg-pink-500 rounded-sm shadow-[0_0_2px_rgba(236,72,153,0.8)]"></div>
                </div>

                {/* Inner decorative circle (like the purple center in reference? implies indicator is light) */}
                <div className="w-4 h-4 rounded-full bg-[#1a1a1a] shadow-inner relative z-10 opacity-50"></div>

            </div>
            {/* Optional Value Display on Hover/Drag */}
            {/* <div className="text-[8px] font-mono text-zinc-400">{Math.round(value)}</div> */}
        </div>
    );
};
