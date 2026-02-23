import { useEffect, useState, useRef } from 'react';

interface AboutViewProps {
    onBootComplete?: () => void;
}

export function AboutView({ onBootComplete }: AboutViewProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [showOptions, setShowOptions] = useState(false); // Indicates animation end
    const [showCursor, setShowCursor] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const sequence = [
            { text: "SEARCHING FOR ABOUT_PATRYK.TXT ...", delay: 300 },
            { text: "LOAD \"ABOUT_PATRYK.TXT\"", delay: 400 },
            { text: "LOADING...", delay: 800 },
            { text: "READY.", delay: 500 },
            { text: "-------------", delay: 500 },
            { text: "HELLO. I'M PATRYK", delay: 50 },
            { text: "A FRONTEND DEVELOPER BUILDING MODERN WEB EXPERIENCES.", delay: 400 },
            { text: "I USE AI IN MY DAILY WORKFLOW TO SPEED UP DEVELOPMENT AND DELIVERY.", delay: 50 },
            { text: "AND THAT'S IT FOR NOW. I LET MY PROJECTS DO THE TALKING.", delay: 50 },
            { text: "NO NEED TO OVERLOAD YOUR SYSTEM MEMORY WITH MORE TEXT.", delay: 400 },
            { text: "-------------", delay: 50 },
            { text: "INITIATING TECH STACK SCAN...", delay: 50 },
            { text: "NEXT.JS                 OK", delay: 200 },
            { text: "REACT                   OK", delay: 200 },
            { text: "TYPESCRIPT              OK", delay: 400 },
            { text: "JAVASCRIPT              OK", delay: 200 },
            { text: "TAILWIND V4             OK", delay: 200 },
            { text: "BOOTSTRAP               OK", delay: 200 },
            { text: "FIGMA                   OK", delay: 200 },
            { text: "GSAP                    OK", delay: 200 },
            { text: "WORDPRESS               OK", delay: 200 },
        ];

        const runSequence = async () => {
            for (let i = 0; i < sequence.length; i++) {
                const step = sequence[i];
                await new Promise((resolve) => { timeoutId = setTimeout(resolve, step.delay); });
                if (!isMounted) return;

                setLines(prev => {
                    const newLines = [...prev];
                    newLines.push(step.text);
                    return newLines;
                });
            }

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 300); });
            if (!isMounted) return;
            setShowOptions(true);
            onBootComplete?.();
        };

        runSequence();

        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
            clearInterval(cursorInterval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Scroll Handler
    useEffect(() => {
        if (!showOptions) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (!scrollContainerRef.current) return;
            const scrollAmount = 60; // Approx 2 lines of text

            switch (e.key) {
                case "ArrowDown":
                    scrollContainerRef.current.scrollTop += scrollAmount;
                    e.preventDefault();
                    break;
                case "ArrowUp":
                    scrollContainerRef.current.scrollTop -= scrollAmount;
                    e.preventDefault();
                    break;
                case "PageDown":
                case " ": // Spacebar support
                    scrollContainerRef.current.scrollTop += scrollContainerRef.current.clientHeight;
                    e.preventDefault();
                    break;
                case "PageUp":
                    scrollContainerRef.current.scrollTop -= scrollContainerRef.current.clientHeight;
                    e.preventDefault();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showOptions]);

    return (
        <div
            ref={scrollContainerRef}
            className="flex flex-col h-full font-c64 mt-2 overflow-y-auto scroll-smooth relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
            {/* Animated Boot Text */}
            {lines.map((line, index) => (
                <div
                    key={index}
                    className={`whitespace-pre-wrap font-c64 mb-1`}
                >
                    {/* Render empty lines correctly with non-breaking space */}
                    {line === "" ? "\u00A0" : line}
                    {index === lines.length - 1 && !showOptions && (
                        <span className={`inline-block w-3 h-[1em] bg-[#887ecb] align-text-bottom ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                    )}
                </div>
            ))}

            {/* Render cursor when fully booted */}
            {showOptions && (
                <div className="font-c64 ">
                    <span className={`inline-block w-3 h-[1em] bg-[#887ecb] align-text-bottom ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                </div>
            )}
        </div>
    );
}
