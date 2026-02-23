import React from 'react';
import Noise from '../animation/Noise';


interface OSContainerProps {
    children: React.ReactNode;
    footerText?: string;
    showFooter?: boolean;
}

export function OSContainer({ children, footerText = "[1-4] SELECT   [ESC] BACK", showFooter = true }: OSContainerProps) {
    return (

        <div className="w-[1080px] h-[450px] bg-[#887ecb] p-[12px] md:p-[16px] mx-auto shadow-2xl relative overflow-hidden">


            <div className="absolute inset-0 z-10 pointer-events-none opacity-50 mix-blend-overlay">
                <Noise patternAlpha={50} patternSize={400} />
            </div>


            <div className="w-full h-full bg-[#352879] text-[#887ecb] p-4 md:p-5 flex flex-col relative overflow-hidden border-2 border-[#887ecb]/20 z-20">


                <div className="flex-1 overflow-hidden font-c64 text-base md:text-lg tracking-wide leading-normal">
                    {children}
                </div>

                {showFooter && (
                    <div className="w-full mt-2 pt-3 border-t-2 border-[#887ecb]/30 font-c64 text-base md:text-lg flex justify-between items-center opacity-80 animate-in fade-in duration-300">
                        <span className="font-c64 tracking-normal leading-none">{footerText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
