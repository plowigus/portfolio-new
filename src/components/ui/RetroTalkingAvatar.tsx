"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Sparkle from "react-sparkle";

interface RetroTalkingAvatarProps {
    message?: string; // Default/First message
    className?: string;
    size?: number;
}

export function RetroTalkingAvatar({
    message = " HOW U DOIN ? ;)", // Default level 1 message
    className,
    size = 40
}: RetroTalkingAvatarProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [isTalking, setIsTalking] = useState(false);
    const [mouthState, setMouthState] = useState<"idle" | "talk">("idle");
    const [hoverCount, setHoverCount] = useState(0);

    // Refs for intervals/timers to clear them properly
    const typewriterRef = useRef<NodeJS.Timeout | null>(null);
    const talkingRef = useRef<NodeJS.Timeout | null>(null);

    // Clear all timers and reset state
    const resetState = () => {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
        if (talkingRef.current) clearInterval(talkingRef.current);
        typewriterRef.current = null;
        talkingRef.current = null;

        setDisplayedText("");
        setIsTalking(false);
        setMouthState("idle");
    };

    const handleMouseEnter = () => {
        setIsHovered(true);

        // Increment global hover count (Session only, resets on refresh)
        setHoverCount(prev => prev + 1);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        if (isHovered) {

            const allQuotes = [
                message,
                " WHAT'S NOT TO LIKE ?",
                " THE LINE IS A DOT TO YOU !",
                " PAPER! SNOW! A GHOST!",
                " IS THAT WHAT A DINOSAUR WOULD DO ?"
            ];


            const index = (hoverCount - 1) % allQuotes.length;
            const targetMessage = allQuotes[index];

            let charIndex = 0;
            setIsTalking(true);

            typewriterRef.current = setInterval(() => {
                if (charIndex < targetMessage.length) {
                    setDisplayedText((prev) => prev + targetMessage.charAt(charIndex));
                    charIndex++;
                } else {

                    if (typewriterRef.current) clearInterval(typewriterRef.current);
                    setIsTalking(false);
                    setMouthState("idle");
                }
            }, 50);


            talkingRef.current = setInterval(() => {
                setMouthState((prev) => (prev === "idle" ? "talk" : "idle"));
            }, 150);

        } else {
            resetState();
        }

        return () => resetState();
    }, [isHovered, message, hoverCount]);

    // Sync talking state: if we stop talking (finished typing), clear the mouth interval
    useEffect(() => {
        if (!isTalking && talkingRef.current) {
            clearInterval(talkingRef.current);
            talkingRef.current = null;
            setMouthState("idle");
        }
    }, [isTalking]);

    return (
        <div
            className={cn("relative inline-block cursor-pointer group", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Speech Bubble */}
            {isHovered && (
                <div
                    className="absolute left-full top-1/2 -translate-y-1/2  px-4 py-2 bg-white text-black font-mono text-sm whitespace-nowrap z-50 pointer-events-none"
                    style={{
                        border: "4px solid black",
                        boxShadow: "4px 4px 0 0 #000",
                        imageRendering: "pixelated"
                    }}
                >
                    {/* Pixelated Triangle/Tail for bubble */}
                    <div
                        className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-black border-b-8 border-b-transparent"
                        style={{ marginRight: "4px" }}
                    />
                    <div
                        className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-white border-b-4 border-b-transparent"
                    />
                    {/* React Sparkles */}
                    {/* <div className="absolute inset-0 pointer-events-none">
                        <Sparkle
                            color="#a10885"
                            count={10}
                            minSize={5}
                            maxSize={10}
                            overflowPx={15}
                            flicker={true}
                            flickerSpeed={'slowest'} // String enum as required by lib
                            fadeOutSpeed={50}
                        />
                    </div> */}
                    {displayedText}
                    {/* Cursor blink effect */}
                    <span className="animate-pulse">_</span>
                </div>
            )}

            {/* Avatar Image */}
            <div
                className="relative overflow-hidden"
                style={{ width: size, height: size }}
            >
                <Image
                    src={mouthState === "talk" ? "/images/logo-talk.png" : "/images/logo.png"}
                    alt="Avatar"
                    width={size}
                    height={size}
                    className="object-contain"
                    style={{ imageRendering: "pixelated" }} // Enforce pixel art look
                    unoptimized // Prevent Next.js from blurring/optimizing pixel art too much
                />
            </div>
        </div>
    );
}
