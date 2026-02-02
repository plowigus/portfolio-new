import React, { Suspense, useEffect, useState } from "react";
import { ChevronDown, Github, Linkedin, Instagram } from "lucide-react";
import { VerticalChangingText } from "./VerticalChangingText";
import { RightDecorativeLine } from "./RightDecorativeLine";
import { Canvas } from "@react-three/fiber";
import { InteractiveSphere } from "./animation/InteractiveSphere";
import { useControls } from "leva";

// Lazy load heavy WebGL components for better initial page load
const RippleGrid = React.lazy(() => import("./animation/Ripplegrid"));

export function HeroSection() {
  const [currentTime, setCurrentTime] = useState("");

  const postProcessing = useControls("Post-Processing", {
    blurAmount: { value: 1.0, min: 0, max: 10, step: 0.5, label: "Blur" },
    brightness: { value: 100, min: 0, max: 200, step: 5, label: "Jasność (%)" },
    contrast: { value: 0, min: 0, max: 200, step: 5, label: "Kontrast (%)" },
    saturate: { value: 100, min: 0, max: 200, step: 5, label: "Saturacja (%)" },
  });

  const filterStyle = {
    filter: `blur(${postProcessing.blurAmount}px) brightness(${postProcessing.brightness}%) contrast(${postProcessing.contrast}%) saturate(${postProcessing.saturate}%)`,
  };

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
      <Suspense fallback={null}>
        <RippleGrid
          enableRainbow={false}
          gridColor="#00000"
          rippleIntensity={0.07}
          gridSize={20}
          gridThickness={70}
          mouseInteraction={true}
          mouseInteractionRadius={1.5}
          opacity={0.4}
          gridRotation={55}
        />
      </Suspense>
      <Suspense fallback={null}>
        <div style={filterStyle} className="w-full h-full">
          <Canvas
            camera={{ position: [0, 0, 3], fov: 65 }}
            className="h-dvh w-full"
            style={{ height: "50dvh" }}
          >
            <ambientLight intensity={0.3} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1.5}
              castShadow
            />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} />
            <pointLight position={[0, 0, 5]} intensity={0.5} color="#4f46e5" />

            <InteractiveSphere />

            {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
          </Canvas>
        </div>
      </Suspense>

      {/* Vertical Changing Text */}
      <VerticalChangingText />

      {/* Right Decorative Line */}
      <RightDecorativeLine />

      {/* 3D Floating Shape i panel ustawień usunięte */}

      {/* Noise Effect Overlay */}
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
                className="text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-700 hover:text-neutral-900 transition-colors"
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

      <div className="absolute bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <p className="text-xs tracking-widest uppercase text-neutral-500">
          Scroll Down
        </p>
        <ChevronDown className="w-4 h-4 text-neutral-500 animate-bounce" />
      </div>
    </section>
  );
}
