"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface CRTScreenProps {
  /** OPCJA A: przekaż ref swojego canvasa — CRT snow się wyłączy, twój canvas staje się ekranem */
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  /** OPCJA B: wrzuć swój komponent jako children — wyrenderuje się wewnątrz ekranu CRT */
  children?: React.ReactNode;
}

export default function CRTScreen({ canvasRef: externalCanvasRef, children }: CRTScreenProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const activeCanvasRef = externalCanvasRef ?? internalCanvasRef;
  const useSnow = !externalCanvasRef && !children;
  const frameRef = useRef<number>(0);
  const [isOn, setIsOn] = useState(false);

  // CRT snow noise (only when no external content)
  const snow = useCallback((ctx: CanvasRenderingContext2D) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const d = ctx.createImageData(w, h);
    const b = new Uint32Array(d.data.buffer);
    for (let i = 0; i < b.length; i++) {
      b[i] = ((255 * Math.random()) | 0) << 24;
    }
    ctx.putImageData(d, 0, 0);
  }, []);

  const animate = useCallback(() => {
    if (!useSnow) return;
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    snow(ctx);
    frameRef.current = requestAnimationFrame(animate);
  }, [snow, useSnow, activeCanvasRef]);

  // Init canvas size
  useEffect(() => {
    if (!useSnow) return;
    const canvas = activeCanvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [activeCanvasRef, useSnow]);

  // Turn on after 1s
  useEffect(() => {
    const t = setTimeout(() => {
      setIsOn(true);
      if (useSnow) animate();
    }, 1000);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(frameRef.current);
    };
  }, [animate, useSnow]);

  return (
    <>
      <style>{`
        /* --- CRT BEZEL WRAPPER --- */
        .crt-bezel {
          position: relative;
          width: 100vw;
          height: 100vh;
        }

        /* Black rounded mask — top & sides vignette */
        .crt-bezel::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          border-radius: 50% / 8%;
          box-shadow:
            inset 0 0 0 4vw #000,
            inset 0 0 60px 15px rgba(0,0,0,0.9);
        }

        /* Inner screen area — rounded phosphor glow */
        .crt-bezel::after {
          content: "";
          position: absolute;
          inset: 2vh 3vw;
          z-index: 9;
          pointer-events: none;
          border-radius: 3% / 5%;
          box-shadow:
            0 0 60px 10px rgba(0, 255, 100, 0.07),
            inset 0 0 80px 40px rgba(0,0,0,0.6);
        }

        /* --- SCREEN --- */
        .crt-screen {
          position: absolute;
          inset: 2vh 3vw;
          border-radius: 3% / 5%;
          overflow: hidden;
          background: #121010;
        }

        /* --- PICTURE (canvas / children) --- */
        .crt-picture {
          height: 100%;
          width: 100%;
          overflow: hidden;
          transform: scale(0, 0);
          background: linear-gradient(to bottom, #85908c 0%, #323431 100%);
        }

        /* ON animation */
        .is-on .crt-picture {
          animation: crt-on 3000ms linear 0ms normal forwards 1 running;
        }

        @keyframes crt-on {
          0% {
            transform: scale(1, 0.8) translate3d(0, 0, 0);
            filter: brightness(4);
            opacity: 1;
          }
          3.5% {
            transform: scale(1, 0.8) translate3d(0, 100%, 0);
          }
          3.6% {
            transform: scale(1, 0.8) translate3d(0, -100%, 0);
            opacity: 1;
          }
          9% {
            transform: scale(1.3, 0.6) translate3d(0, 100%, 0);
            filter: brightness(4);
            opacity: 0;
          }
          11% {
            transform: scale(1, 1) translate3d(0, 0, 0);
            filter: contrast(0) brightness(0);
            opacity: 0;
          }
          100% {
            transform: scale(1, 1) translate3d(0, 0, 0);
            filter: contrast(1) brightness(1.2) saturate(1.3);
            opacity: 1;
          }
        }

        /* --- OVERLAY / SCANLINES --- */
        .crt-overlay {
          height: 100%;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;
          z-index: 1;
          pointer-events: none;
        }
        .crt-overlay::before {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          content: " ";
          background: 
            linear-gradient(
              rgba(18,16,16,0) 50%,
              rgba(0,0,0,0.25) 50%
            ),
            linear-gradient(
              90deg,
              rgba(255,0,0,0.06),
              rgba(0,255,0,0.02),
              rgba(0,0,255,0.06)
            );
          z-index: 2;
          background-size: 100% 2px, 3px 100%;
          pointer-events: none;
        }
      `}</style>

      <main className={`w-full h-full bg-black overflow-hidden flex items-center justify-center ${isOn ? "is-on" : "is-off"}`}>
        <div className="crt-bezel">
          <div className="crt-screen">
            {/* Content: either children or snow canvas */}
            {children ? (
              <div className="crt-picture" style={{ position: "absolute", inset: 0 }}>
                {children}
              </div>
            ) : (
              <canvas ref={activeCanvasRef} className="crt-picture" />
            )}

            {/* Scanlines overlay (always on top, pointer-events: none) */}
            <div className="crt-overlay" />
          </div>
        </div>
      </main>
    </>
  );
}
