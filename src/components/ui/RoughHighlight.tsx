"use client";

import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

interface RoughHighlightProps {
    color: string;
    show: boolean;
    roughness?: number;
    bowing?: number;
    fillStyle?: "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots" | "sunburst" | "dashed" | "zigzag-line";
    fillWeight?: number;
    hachureGap?: number;
    hachureAngle?: number;
    animationDuration?: number;
}

export function RoughHighlight({
    color,
    show,
    roughness = 2,
    bowing = 1,
    fillStyle = "dots", // zigzag gives a nice "scribble" drawing effect
    fillWeight = 1,
    hachureGap = 4,
    animationDuration = 600,
}: RoughHighlightProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Update dimensions on mount/resize
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener("resize", updateDimensions);

        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    // Draw and Animate
    useEffect(() => {
        if (!svgRef.current || dimensions.width === 0) return;

        const svg = svgRef.current;

        // Clear previous if not showing or re-drawing
        if (!show) {
            while (svg.lastChild) {
                svg.removeChild(svg.lastChild);
            }
            return;
        }

        // Only draw if empty (or we could clear and redraw every time, but consistency helps)
        // Clearing is safer for updates
        while (svg.lastChild) {
            svg.removeChild(svg.lastChild);
        }

        const rc = rough.svg(svg);
        const node = rc.rectangle(2, 2, dimensions.width - 4, dimensions.height - 4, {
            fill: color,
            fillStyle: fillStyle,
            stroke: "none", // We only want the fill
            roughness: roughness,
            bowing: bowing,
            fillWeight: fillWeight,
            hachureGap: hachureGap,
        });

        // Prepare animation
        const paths = node.querySelectorAll("path");
        paths.forEach((path) => {
            const length = path.getTotalLength();
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;
            path.style.transition = `stroke-dashoffset ${animationDuration}ms ease-out`;
        });

        svg.appendChild(node);

        // Trigger animation next frame
        requestAnimationFrame(() => {
            // Force reflow?
            svg.getBoundingClientRect();
            paths.forEach((path) => {
                path.style.strokeDashoffset = "0";
            });
        });

    }, [dimensions, color, show, roughness, bowing, fillStyle, fillWeight, hachureGap, animationDuration]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                style={{ overflow: "visible" }}
            />
        </div>
    );
}
