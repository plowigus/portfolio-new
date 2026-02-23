import { useEffect, useState, useRef } from "react";

interface C64LoaderProps {
    onStartLoading?: () => void;
    isGameReady?: boolean;
    onComplete?: () => void;
}

export default function C64Loader({ onStartLoading, isGameReady = false, onComplete }: C64LoaderProps) {
    const [lines, setLines] = useState<string[]>([
        "**** COMMODORE 64 BASIC V2 ****",
        "64K RAM SYSTEM  38911 BASIC BYTES FREE",
        "READY.",
    ]);

    const [showCursor, setShowCursor] = useState(true);

    const isGameReadyRef = useRef(isGameReady);

    useEffect(() => {
        isGameReadyRef.current = isGameReady;
    }, [isGameReady]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const typeText = async (text: string, delay: number = 100) => {
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

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
            if (!isMounted) return;


            await typeText('LOAD "*",8,1');
            if (!isMounted) return;


            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "SEARCHING FOR SILESIA RUNNER"]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 1000); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "LOADING"]);

            if (onStartLoading) {
                onStartLoading();
            }


            const align = (text: string) => text.padEnd(28, " ") + "OK";

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("GUMIKLYJZY")]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("ROLADA")]);

            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
            if (!isMounted) return;
            setLines((prev) => [...prev, align("MODRA KAPUSTA")]);


            while (!isGameReadyRef.current) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (!isMounted) return;
            }


            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 1500); });
            if (!isMounted) return;
            setLines((prev) => [...prev, "READY."]);


            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
            if (!isMounted) return;
            await typeText("RUN");


            await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
            if (onComplete) onComplete();
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
        <div className="w-[1080px] h-[450px] bg-[#887ecb] p-[20px] font-c64 text-xl uppercase overflow-hidden">
            <div className="w-full h-full bg-[#352879] text-[#887ecb] p-4 font-c64 font-bold tracking-wider leading-relaxed">
                {lines.map((line, index) => (
                    <div key={index} className={`whitespace-pre-wrap font-c64 ${index === 0 ? "text-center mb-6" : ""}`}>
                        {line}
                        {index === lines.length - 1 && showCursor && (
                            <span className="inline-block w-4 h-[1.2em]  bg-[#887ecb] align-text-bottom ml-1"></span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
