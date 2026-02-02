import { useRef, MouseEvent } from "react";
import { gsap } from "gsap";

export function RightDecorativeLine() {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (!pathRef.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const isFromLeft = e.clientX < centerX;

    // Determine bend direction based on mouse position (opposite to mouse)
    const bendX = isFromLeft ? 65 : -15; // Bend away from mouse
    const overshootX = isFromLeft ? 0 : 50; // Overshoot in original direction

    // Kill any running animations
    gsap.killTweensOf(pathRef.current);

    // Animate the curve bending like a bow string
    gsap.to(pathRef.current, {
      attr: { d: `M 25 0 Q ${bendX} 128 25 256` },
      duration: 0.25,
      ease: "power2.out",
      onComplete: () => {
        // Spring back with overshoot in opposite direction
        gsap.to(pathRef.current, {
          attr: { d: `M 25 0 Q ${overshootX} 128 25 256` },
          duration: 0.12,
          ease: "power1.out",
          onComplete: () => {
            gsap.to(pathRef.current, {
              attr: { d: "M 25 0 Q 25 128 25 256" },
              duration: 0.5,
              ease: "elastic.out(1, 0.3)",
            });
          },
        });
      },
    });
  };

  return (
    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-end">
        <div
          ref={containerRef}
          className="flex flex-col items-center cursor-pointer px-4"
          onMouseEnter={handleMouseMove}
        >
          {/* Top Circle */}
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full relative z-10" />

          {/* Curved Line (SVG) */}
          <svg
            width="50"
            height="256"
            viewBox="0 0 50 256"
            className="overflow-visible"
            style={{ marginTop: -5, marginBottom: -5 }}
          >
            <path
              ref={pathRef}
              d="M 25 0 Q 25 128 25 256"
              stroke="rgba(23, 23, 23, 0.3)"
              strokeWidth="1"
              fill="none"
            />
          </svg>

          {/* Bottom Circle */}
          <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full relative z-10" />
        </div>
      </div>
    </div>
  );
}
