import { useState, useEffect, useCallback } from "react";

const words = ["Develop", "Design", "Create", "Build", "Craft", "Shape"];
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function VerticalChangingText() {
  const [_, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState(words[0]);


  const animateToWord = useCallback((targetWord: string) => {

    const targetLength = targetWord.length;
    let iteration = 0;
    const maxIterations = targetLength * 3;

    const interval = setInterval(() => {
      setDisplayText(
        targetWord
          .split("")
          .map((char, index) => {
            // Characters that have "settled"
            if (index < iteration / 3) {
              return char;
            }
            // Random character for unsettled positions
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iteration++;

      if (iteration > maxIterations) {
        clearInterval(interval);
        setDisplayText(targetWord);

      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setCurrentWordIndex((prev) => {
        const nextIndex = (prev + 1) % words.length;
        animateToWord(words[nextIndex]);
        return nextIndex;
      });
    }, 2500);

    return () => clearInterval(wordInterval);
  }, [animateToWord]);

  return (
    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block pointer-events-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div
          className="font-mono text-base text-black uppercase tracking-wider opacity-40"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          {displayText} things with us and make it real
        </div>
      </div>
    </div>
  );
}
