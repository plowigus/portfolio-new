import { useEffect, useState } from 'react';

interface MenuViewProps {
    onSelect: (view: string) => void;
    onBootComplete?: () => void;
}

export function MenuView({ onSelect, onBootComplete }: MenuViewProps) {
    const [lines, setLines] = useState<string[]>([]);
    const [showOptions, setShowOptions] = useState(false);
    const [showCursor, setShowCursor] = useState(true);

    // Boot Animation Sequence
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const runSequence = async () => {
            // 1. Initial delay
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
            if (!isMounted) return;
            setLines(["**** COMMODORE 64 BASIC V2 ****"]);

            // 2. RAM Info
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "64K RAM SYSTEM  38911 BASIC BYTES FREE"]);

            // 3. READY
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "READY."]);

            // 3.5. Instruction
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "SELECT OPTION FROM MENU:"]);

            // 4. Reveal Option 1
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "1. ABOUT ME"]);

            // 5. Reveal Option 2
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 300); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "2. WORKS & PROJECTS"]);

            // 6. Reveal Option 3
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 300); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "3. CONTACT INFO"]);

            // 7. Reveal Option 4
            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 300); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "4. LOAD \"SILESIA_RUNNER\""]);

            // 8. Done Booting
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
    }, []);


    useEffect(() => {
        if (!showOptions) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "1": onSelect("about"); break;
                case "2": onSelect("works"); break;
                case "3": onSelect("contact"); break;
                case "4": onSelect("game_loader"); break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [showOptions, onSelect]);

    return (
        <div className="flex flex-col h-full font-c64 mt-2">
            {/* Animated Boot Text & Options */}
            {lines.map((line, index) => {
                // If it's a menu option, render it as a button
                if (line.match(/^[1-4]\./)) {
                    return (
                        <div key={index} className="flex flex-col gap-3 mt-1 animate-in fade-in duration-300">
                            <button
                                onClick={() => {
                                    if (line.includes("ABOUT")) onSelect("about");
                                    else if (line.includes("WORKS")) onSelect("works");
                                    else if (line.includes("CONTACT")) onSelect("contact");
                                    else if (line.includes("LOAD")) onSelect("game_loader");
                                }}
                                className="text-left font-c64 hover:text-white transition-colors cursor-pointer focus:outline-none"
                            >
                                {line}
                            </button>
                            {/* Render Cursor at the end of the list */}
                            {index === lines.length - 1 && !showOptions && (
                                <div className="font-c64 ">
                                    <span className={`inline-block w-3 h-[1em] bg-[#887ecb] align-text-bottom ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                                </div>
                            )}
                        </div>
                    );
                }


                return (
                    <div
                        key={index}
                        className={`whitespace-pre-wrap font-c64 ${index === 0 ? "text-center mb-6" : line === "READY." ? "mb-6" : "mb-1"}`}
                    >
                        {line}
                        {index === lines.length - 1 && !showOptions && (
                            <span className={`inline-block w-3 h-[1em] bg-[#887ecb] align-text-bottom ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                        )}
                    </div>
                );
            })}

            {/* Render cursor when fully booted */}
            {showOptions && (
                <div className="font-c64 ">
                    <span className={`inline-block w-3 h-[1em] bg-[#887ecb] align-text-bottom ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
                </div>
            )}
        </div>
    );
}
