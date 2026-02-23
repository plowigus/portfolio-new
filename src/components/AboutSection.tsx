"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SKILLS = [
  "REACT 19",
  "NEXT.JS",
  "TYPESCRIPT",
  "JAVASCRIPT",
  "TAILWIND CSS",
  "AI TOOLS",
];

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([""]);
  const [showCursor, setShowCursor] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!sectionRef.current) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 75%",
      onEnter: () => {
        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          setHasStarted(true);
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let timeoutId: NodeJS.Timeout;
    let isMounted = true;

    const typeText = async (text: string, delay: number = 20) => {
      for (let i = 0; i < text.length; i++) {
        if (!isMounted) return;
        await new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            if (!isMounted) return;
            setLines((prev) => {
              const newLines = [...prev];
              if (newLines.length === 0) newLines.push("");
              newLines[newLines.length - 1] += text[i];
              return newLines;
            });
            resolve(true);
          }, delay);
        });
      }
    };

    const runSequence = async () => {
      if (!isMounted) return;

      await typeText("I WRITE CODE IN NEXT.JS, TYPESCRIPT, AND JS.");

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "", ""]);

      await typeText("I USE AI IN MY DAILY WORKFLOW TO DRASTICALLY SPEED UP DEVELOPMENT AND DELIVERY.");

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 500); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "", ""]);

      await typeText("AND THAT'S IT FOR NOW. WE'LL SEE WHAT COMES NEXT. I DON'T WANT TO OVERLOAD YOU WITH INFORMATION.");

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "", "READY.", ""]);

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
      if (!isMounted) return;
      await typeText("LOAD \"TECH_STACK\",8,1");

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "SEARCHING FOR TECH_STACK"]);

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 800); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "LOADING", ""]);

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 400); });
      if (!isMounted) return;

      const padLen = typeof window !== "undefined" && window.innerWidth < 400 ? 18 : typeof window !== "undefined" && window.innerWidth < 600 ? 22 : 28;
      const align = (text: string) => text.padEnd(padLen, " ") + "OK";

      for (const skill of SKILLS) {
        await new Promise((resolve) => { timeoutId = setTimeout(resolve, 300); });
        if (!isMounted) return;
        setLines((prev) => [...prev, align(skill)]);
      }

      await new Promise((resolve) => { timeoutId = setTimeout(resolve, 600); });
      if (!isMounted) return;
      setLines((prev) => [...prev, "", "READY.", ""]);
    };

    runSequence();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [hasStarted]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <section id="about" className="relative w-full text-[#887ecb] font-c64 min-h-screen py-8 md:py-12 bg-white flex flex-col items-center justify-center">
      <div className="w-full max-w-[1080px] px-4">

        <div className="border-[6px] border-[#887ecb] border-r-black border-b-black p-6 md:p-[20px] bg-[#352879] shadow-none md:shadow-[12px_12px_0_0_#000000] overflow-hidden min-h-[600px] md:min-h-[700px] w-full">

          <div className="flex items-center gap-4 mb-8 md:mb-12 pb-6 border-b-4 border-[#887ecb]">
            <div className="w-4 md:w-6 h-4 md:h-6 bg-[#887ecb] animate-pulse" />
            <h2 className="text-xl md:text-3xl font-bold uppercase tracking-widest">
              ABOUT_ME.TXT
            </h2>
          </div>

          <div className="text-sm md:text-xl leading-loose md:leading-[2.5] uppercase wrap-break-word w-full h-full overflow-y-auto">
            {lines.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap font-c64 mb-3" style={{ minHeight: "1em" }}>
                {line}
                {index === lines.length - 1 && showCursor && (
                  <span className="inline-block w-3 sm:w-4 h-[1em] bg-[#887ecb] align-text-bottom ml-1"></span>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
