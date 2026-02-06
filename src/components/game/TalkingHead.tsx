import { useEffect, useState, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../../config/gameConfig';

interface TalkingHeadProps {
    quote: string | null;
    textures: {
        faceClosed: PIXI.Texture;
        faceOpen: PIXI.Texture;
    } | null;
}

export const TalkingHead: React.FC<TalkingHeadProps> = ({ quote, textures }) => {
    const [frame, setFrame] = useState<'closed' | 'open'>('closed');
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Animation Logic
    useEffect(() => {
        if (quote && textures) {
            // Start animating
            intervalRef.current = setInterval(() => {
                setFrame(prev => prev === 'closed' ? 'open' : 'closed');
            }, GAME_CONFIG.faceAnimationSpeed);
        } else {
            // Stop animating and reset
            if (intervalRef.current) clearInterval(intervalRef.current);
            setFrame('closed');
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [quote, textures]);

    if (!quote || !textures) return null;
    const faceUrl = '/assets/ui/face.png';
    // const bgPos = frame === 'closed' ? '0px 0px' : '-50% 0px';


    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 pointer-events-none">
            {/* Avatar Frame */}
            <div className="relative w-16 h-16 bg-black border-2 border-white shadow-lg overflow-hidden">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `url(${faceUrl})`,
                        backgroundSize: '200% 100%',
                        backgroundPosition: frame === 'closed' ? '0% 0%' : '100% 0%',
                        imageRendering: 'pixelated'
                    }}
                />
            </div>

            {/* Quote Bubble */}
            <div className="bg-black border-2 border-white p-3 shadow-lg max-w-md">
                <p className="text-white font-mono text-sm md:text-base uppercase tracking-wider leading-relaxed">
                    {quote}
                </p>
            </div>
        </div>
    );
};
