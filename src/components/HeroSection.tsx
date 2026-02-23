import Link from "next/link";
import { useEffect, useState } from "react";
import Github from "lucide-react/dist/esm/icons/github";
import Linkedin from "lucide-react/dist/esm/icons/linkedin";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import { VerticalChangingText } from "./VerticalChangingText";
import { RightDecorativeLine } from "./RightDecorativeLine";
import C64OS from "./os/C64OS";

export function HeroSection() {
  const [currentTime, setCurrentTime] = useState("");
  const [scale, setScale] = useState(1);
  const [isDesktop, setIsDesktop] = useState(false);

  // Time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("pl-PL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Desktop detection + responsive scale
  useEffect(() => {
    const update = () => {
      const desktop = window.innerWidth >= 1024; // lg breakpoint
      setIsDesktop(desktop);

      if (desktop) {
        const GAME_WIDTH = 1080;
        const GAME_HEIGHT = 450;
        const horizontalPadding = 96;
        const availableWidth = window.innerWidth - horizontalPadding;
        const availableHeight = window.innerHeight - 160;
        const scaleX = availableWidth / GAME_WIDTH;
        const scaleY = availableHeight / GAME_HEIGHT;
        setScale(Math.min(scaleX, scaleY, 1));
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section
      className="flex flex-col items-center justify-center px-6 md:px-12 pt-0 relative overflow-hidden bg-white h-dvh"
    >
      <h1 className="sr-only">
        Silesia Runner - Portfolio Full Stack Developer & Game Creator | Patryk
        Łowigus
      </h1>

      {/* C64 OS — Desktop only (lg+), NOT mounted on mobile at all */}
      {isDesktop && (
        <div
          className="relative z-20"
          style={{
            width: 1080 * scale,
            height: 450 * scale,
          }}
        >
          <div
            className="origin-top-left"
            style={{
              width: 1080,
              height: 450,
              transform: `scale(${scale})`,
            }}
          >
            <C64OS />
          </div>
        </div>
      )}

      {/* Mobile Hero — placeholder for future reactbits content */}
      {!isDesktop && (
        <div className="flex flex-col items-center justify-center text-center gap-6 px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight leading-tight">
            Patryk Łowigus
          </h2>
          <p className="text-lg md:text-xl text-neutral-500 max-w-md">
            Frontend Developer building modern web experiences.
          </p>
        </div>
      )}

      <VerticalChangingText />
      <RightDecorativeLine />

      {/* Background noise */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />

      {/* Social Media Icons - Bottom */}
      <div className="absolute left-0 right-0 bottom-6 md:bottom-12 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
            <div className="flex flex-row gap-6">
              <Link
                href="https://www.linkedin.com/in/patryk-lowigus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Visit Patryk Łowigus' LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.instagram.com/plowigus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Visit Patryk Łowigus' Instagram Profile"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/plowigus/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
                aria-label="Visit Patryk Łowigus' GitHub Profile"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>

            <div className="font-mono text-xs md:text-sm text-neutral-600 uppercase tracking-wider">
              Bytom, Poland • {currentTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}