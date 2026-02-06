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

    // Refs do kontroli animacji
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const talkingRef = useRef<NodeJS.Timeout | null>(null);
    const lastQuoteRef = useRef<string | null>(null); // Zapamiętuje ostatni cytat, żeby go nie powtarzać

    // Funkcja czyszcząca
    const clearTimers = () => {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        if (talkingRef.current) clearInterval(talkingRef.current);
        typewriterRef.current = null;
        talkingRef.current = null;
    };

    useEffect(() => {
        // Jeśli nie ma cytatu, chowamy i czyścimy
        if (!quote) {
            setIsVisible(false);
            setDisplayedText("");
            lastQuoteRef.current = null;
            clearTimers();
            return;
        }

        // 🛑 FIX ZAPĘTLANIA:
        // Jeśli ten cytat jest taki sam jak poprzedni (który już animowaliśmy), ignorujemy efekt.
        if (quote === lastQuoteRef.current) {
            return;
        }

        // Nowy cytat - startujemy sekwencję
        lastQuoteRef.current = quote;
        setIsVisible(true);
        setDisplayedText("");
        setMouthState("closed");
        clearTimers();

        let charIndex = 0;

        // 1. Maszyna do pisania (Typewriter)
        typewriterRef.current = setInterval(() => {
            if (charIndex < quote.length) {
                // Używamy slice dla stabilności (zamiast prev + char)
                setDisplayedText(quote.slice(0, charIndex + 1));
                charIndex++;
            } else {
                // Koniec pisania - STOP
                clearTimers();
                setMouthState("closed"); // Zamykamy usta na koniec
            }
        }, 50); // Prędkość pisania

        // 2. Animacja ust (tylko w trakcie pisania)
        talkingRef.current = setInterval(() => {
            setMouthState((prev) => (prev === "closed" ? "open" : "closed"));
        }, 150);

        // Cleanup przy odmontowaniu
        return () => clearTimers();

    }, [quote]); // Zależność tylko od quote, textures pomijamy celowo, żeby nie migało przy ładowaniu

    // Jeśli ma być niewidoczny, nie renderujemy nic
    if (!isVisible || !textures) return null;

    const faceUrl = '/assets/ui/face.png';

    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none drop-shadow-[4px_4px_0_rgba(0,0,0,0.8)]">
            <div className="flex items-stretch h-20 md:h-24">

                {/* AVATAR */}
                <div className="shrink-0 w-20 md:w-24 bg-black border-4 border-r-0 border-white relative overflow-hidden">
                    <div
                        className="w-full h-full absolute inset-0"
                        style={{
                            backgroundImage: `url(${faceUrl})`,
                            backgroundRepeat: 'no-repeat',
                            // Zgodnie z życzeniem - pełny kwadrat
                            backgroundSize: '200% 200%',
                            // Przesunięcie klatki (Closed = lewa, Open = prawa)
                            backgroundPosition: mouthState === 'closed' ? '0% 0%' : '100% 0%',
                            imageRendering: 'pixelated'
                        }}
                    />
                </div>

                {/* TEXT BOX */}
                <div className="bg-black border-4 border-l-4 border-white w-[300px] md:w-[450px] flex items-center px-4 md:px-5 relative">
                    {/* Styl tekstu: Lżejszy i mniejszy zgodnie z prośbą */}
                    <p className="text-white font-mono font-medium text-base md:text-lg tracking-wide leading-snug uppercase drop-shadow-sm">
                        {displayedText}
                        <span className="animate-pulse ml-1 text-orange-500">_</span>
                    </p>
                </div>
            </div>
        </div>
    );
};