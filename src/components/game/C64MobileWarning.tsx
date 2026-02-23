import { useEffect, useState } from "react";

export default function C64MobileWarning() {
    const [lines, setLines] = useState<string[]>([
        "**** COMMODORE 64 BASIC V2 ****",
        "64K RAM SYSTEM  38911 BASIC BYTES FREE",
        "READY.",
    ]);
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const typeText = async (text: string, delay: number = 50) => {
            for (let i = 0; i < text.length; i++) {
                if (!isMounted) return;
                await new Promise((resolve) => {
                    timeoutId = setTimeout(() => {
                        if (!isMounted) return;
                        setLines((prev) => {
                            const newLines = [...prev];
                            newLines[newLines.length - 1] += text[i];
                            return newLines;
                        });
                        resolve(true);
                    }, delay);
                });
            }
        };

        const runSequence = async () => {
            // Adjust padding based on screen width so it fits flawlessly on one line on narrow mobiles
            const padLen = typeof window !== "undefined" && window.innerWidth < 400 ? 18 : window.innerWidth < 600 ? 22 : 28;
            const align = (text: string) => text.padEnd(padLen, " ") + "FALSE";

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
            if (!isMounted) return;

            await typeText('LOAD "*",8,1');

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "SEARCHING FOR SILESIA RUNNER"]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 1000); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "LOADING"]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("GUMIKLYJZY")]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("ROLADA")]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("MODRA KAPUSTA")]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 1000); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "OUT OF MEMORY ERROR", "SILESIA RUNNER IS NOT AVAILABLE", "ON PHONES OR TABLETS.", ""]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "PLEASE SWITCH TO A DESKTOP.", "READY."]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, ""]); // Empty line for the blinker
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

    return (
        <div className="w-full max-w-[1080px] h-[450px] mx-auto bg-[#887ecb] p-[10px] font-c64 text-[12px] sm:text-base md:text-xl uppercase overflow-hidden">
            <div className="w-full h-full bg-[#352879] text-[#887ecb] p-4 font-c64 font-bold tracking-wider leading-normal overflow-y-auto">
                {lines.map((line, index) => (
                    <div key={index} className={`whitespace-pre-wrap font-c64 mb-1 ${index === 0 ? "text-center mb-8" : ""}`}>
                        {line}
                        {index === lines.length - 1 && showCursor && (
                            <span className="inline-block w-3 sm:w-4 h-[1em] bg-[#887ecb] align-text-bottom ml-1"></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
