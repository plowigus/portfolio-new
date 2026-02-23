import React, { useState } from 'react';
import { OSContainer } from './OSContainer';
import { MenuView } from './views/MenuView';
import { AboutView } from './views/AboutView';
import dynamic from 'next/dynamic';
import C64Loader from '../game/C64Loader';

const GameHero = dynamic(() => import('../game/GameHero'), { ssr: false });

export type OsState = "menu" | "about" | "works" | "contact" | "game_loader" | "game";

export default function C64OS() {
    const [view, setView] = useState<OsState>("menu"); // Starts instantly at menu
    const [isGameReady, setIsGameReady] = useState(false);
    const [isMenuBooted, setIsMenuBooted] = useState(false);

    // Global Escape handler for returning to menu
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && view !== "menu" && view !== "game_loader" && view !== "game") {
                setView("menu");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [view]);

    // Reset footer status whenever view changes so new view animations can play out first
    React.useEffect(() => {
        setIsMenuBooted(false);
    }, [view]);

    // Handle routing
    switch (view) {
        case "menu":
            return (
                <OSContainer showFooter={isMenuBooted} footerText="[1-4] SELECT OPTION  |  [ESC] SYSTEM RESET">
                    <MenuView
                        onSelect={(v) => setView(v as OsState)}
                        onBootComplete={() => setIsMenuBooted(true)}
                    />
                </OSContainer>
            );

        case "game_loader":
            return (
                <div className="relative w-[1080px] h-[450px] mx-auto">
                    <div className="opacity-0 pointer-events-none absolute inset-0">
                        <GameHero onGameReady={() => setIsGameReady(true)} />
                    </div>
                    <C64Loader
                        isGameReady={isGameReady}
                        onComplete={() => setView("game")}
                    />
                </div>
            );

        case "game":
            return (
                <div className="w-[1080px] h-[450px] mx-auto relative">
                    <GameHero onGameReady={() => setIsGameReady(true)} />
                </div>
            );

        case "about":
            return (
                <OSContainer showFooter={isMenuBooted} footerText="[ESC] RETURN TO MENU  |  [ARROWS/SPACE] SCROLL">
                    <AboutView onBootComplete={() => setIsMenuBooted(true)} />
                </OSContainer>
            );

        case "works":
        case "contact":
            return (
                <OSContainer footerText="[ESC] RETURN TO MENU">
                    <div className="font-c64">DIRECTORY LISTING:</div>
                    <div className="font-c64 mt-4">TODO: Modular Views...</div>
                </OSContainer>
            );

        default:
            return null;
    }
}
