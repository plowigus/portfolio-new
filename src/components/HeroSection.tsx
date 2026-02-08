import { useEffect, useState } from "react";
// import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Github from "lucide-react/dist/esm/icons/github";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import { VerticalChangingText } from "./VerticalChangingText";
import { RightDecorativeLine } from "./RightDecorativeLine";
import dynamic from "next/dynamic";
import C64Loader from "./game/C64Loader";

const GameHero = dynamic(() => import("./game/GameHero"), {
  ssr: false,
});

export function HeroSection() {
  const [currentTime, setCurrentTime] = useState("");
  const [shouldLoadGame, setShouldLoadGame] = useState(false);
  const [isGameReady, setIsGameReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="flex flex-col items-center justify-center px-6 md:px-12 pt-20 relative overflow-hidden bg-white"
      style={{ height: "100dvh", minHeight: "100dvh" }}
    >

      {/* Game Area with JIT Loading */}
      <div className="relative w-full max-w-[1080px] mx-auto min-h-[450px]">
        {/* Layer 1: Game (Lazily loaded) */}
        {shouldLoadGame && (
          <GameHero onGameReady={() => setIsGameReady(true)} />
        )}

        {/* Layer 2: C64 Loader (Overlay) */}
        {showLoader && (
          <div className="absolute inset-0 z-20">
            <C64Loader
              onStartLoading={() => setShouldLoadGame(true)}
              isGameReady={isGameReady}
              onComplete={() => setShowLoader(false)}
            />
          </div>
        )}

        {/* Placeholder for when game is loading but GameHero is not yet ready to render (avoids collapse) */}
        {!shouldLoadGame && !showLoader && (
          <div className="w-[1080px] h-[450px] bg-black" />
        )}
      </div>

      <VerticalChangingText />

      <RightDecorativeLine />


      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Social Media Icons - Bottom Left */}
      <div className="absolute left-0 right-0 bottom-6 md:bottom-12 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div className="flex flex-row gap-6">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>

            <div className="font-mono text-xs md:text-sm text-neutral-600 uppercase tracking-wider">
              Bytom, Poland • {currentTime}
            </div>
          </div>
        </div>
      </div>

      {/* <div className="absolute bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <p className="text-xs tracking-widest uppercase text-neutral-500">
          Scroll Down
        </p>
        <ChevronDown className="w-4 h-4 text-neutral-500 animate-bounce" />
      </div> */}
    </section>
  );
}
