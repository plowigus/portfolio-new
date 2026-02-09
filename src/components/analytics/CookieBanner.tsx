"use client";

import { useState, useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";

interface CookieBannerProps {
    gaId: string;
}

export const CookieBanner = ({ gaId }: CookieBannerProps) => {
    const [consent, setConsent] = useState<boolean | null>(null);
    const [isVisible, setIsVisible] = useState(false); // Domyślnie UKRYTY, żeby nie mignął

    useEffect(() => {
        // Sprawdzamy localStorage dopiero po załadowaniu klienta
        const savedConsent = localStorage.getItem("cookie_consent");

        if (savedConsent !== null) {
            // Jeśli użytkownik już kiedyś wybrał -> ustawiamy zgodę, ale NIE pokazujemy banera
            setConsent(savedConsent === "true");
            setIsVisible(false);
        } else {
            // Jeśli nie ma zapisu w localStorage -> pokazujemy baner
            setIsVisible(true);
        }
    }, []);

    const handleChoice = (choice: boolean) => {
        setConsent(choice);
        setIsVisible(false); // Natychmiast ukryj
        localStorage.setItem("cookie_consent", String(choice));
    };

    return (
        <>
            {/* 1. Logika Google Analytics - ładuje się tylko, gdy jest zgoda */}
            {consent === true && <GoogleAnalytics gaId={gaId} />}

            {/* 2. Logika Banera - renderuje się tylko, gdy isVisible === true */}
            {isVisible ? (
                <div className="fixed bottom-6 left-6 z-50 w-full max-w-[350px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col gap-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                                Polityka Prywatności
                            </h3>
                            <p className="text-xs leading-relaxed text-neutral-600">
                                Ta strona używa plików cookie do anonimowej analizy ruchu. Czy
                                wyrażasz zgodę?
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={() => handleChoice(true)}
                                className="group relative flex-1 overflow-hidden border-2 border-black px-4 py-2 text-center text-xs font-bold uppercase text-black transition-all hover:bg-black hover:text-white"
                            >
                                Akceptuję
                            </button>

                            <button
                                onClick={() => handleChoice(false)}
                                className="flex-1 text-center text-xs font-medium text-neutral-500 transition-colors hover:text-black hover:underline"
                            >
                                Odrzuć
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
            {/* ^ Tutaj jest klucz: jeśli !isVisible, zwracamy null (brak HTML) */}
        </>
    );
};