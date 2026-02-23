import { useEffect, useState, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface TalkingHeadProps {
    quote: string | null;
    textures: {
        faceClosed: PIXI.Texture;
        faceOpen: PIXI.Texture;
    } | null;
}

export const TalkingHead: React.FC<TalkingHeadProps> = ({ quote, textures }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [mouthState, setMouthState] = useState<'closed' | 'open'>('closed');
    const [isVisible, setIsVisible] = useState(false);

    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const talkingRef = useRef<NodeJS.Timeout | null>(null);
    const lastQuoteRef = useRef<string | null>(null);

    const clearTimers = () => {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        if (talkingRef.current) clearInterval(talkingRef.current);
        typewriterRef.current = null;
        talkingRef.current = null;
    };

    useEffect(() => {
        if (!quote) {
            setIsVisible(false);
            setDisplayedText("");
            lastQuoteRef.current = null;
            clearTimers();
            return;
        }


        if (quote === lastQuoteRef.current) {
            return;
        }

        lastQuoteRef.current = quote;
        setIsVisible(true);
        setDisplayedText("");
        setMouthState("closed");
        clearTimers();

        let charIndex = 0;

        typewriterRef.current = setInterval(() => {
            if (charIndex < quote.length) {
                setDisplayedText(quote.slice(0, charIndex + 1));
                charIndex++;
            } else {
                clearTimers();
                setMouthState("closed");
            }
        }, 50);

        talkingRef.current = setInterval(() => {
            setMouthState((prev) => (prev === "closed" ? "open" : "closed"));
        }, 150);

        return () => clearTimers();

    }, [quote]);

    if (!isVisible || !textures) return null;

    const faceUrl = '/assets/ui/face.png';

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
            <div className="flex items-stretch h-20 md:h-24">

                <div className="shrink-0 w-20 md:w-24 bg-black border-4 border-r-0 border-white relative overflow-hidden">
                    <div
                        className="w-full h-full absolute inset-0"
                        style={{
                            backgroundImage: `url(${faceUrl})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '200% 200%',
                            backgroundPosition: mouthState === 'closed' ? '0% 0%' : '100% 0%',
                            imageRendering: 'pixelated'
                        }}
                    />
                </div>

                <div className="bg-black border-4 border-l-4 border-white w-[300px] md:w-[450px] flex items-center px-4 md:px-5 relative">
                    <p className="text-white font-mono font-medium text-base md:text-lg tracking-wide leading-snug uppercase drop-shadow-sm">
                        {displayedText}
                        <span className="animate-pulse ml-1 text-orange-500">_</span>
                    </p>
                </div>
            </div>
        </div>
    );
};