"use client";

import { useEffect, useRef, useState } from "react";
import rough from "roughjs";

interface RoughHighlightProps {
    color: string;
    show: boolean;
    roughness?: number;
    bowing?: number;
    fillStyle?: "zigzag" | "hachure" | "cross-hatch" | "dashed";
    fillWeight?: number;
    hachureGap?: number;
    hachureAngle?: number;
    animationDuration?: number; // Czas rysowania CAŁOŚCI (nie jednej kreski)
}

export function RoughHighlight({
    color,
    show,
    roughness = 2,
    bowing = 1,
    fillStyle = "zigzag",
    fillWeight = 2,
    hachureGap = 4,
    animationDuration = 6000,
}: RoughHighlightProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    // Obsługa zmiany rozmiaru
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
                setHeight(entry.contentRect.height);
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Główna logika rysowania
    useEffect(() => {
        if (!svgRef.current || width === 0 || height === 0) return;

        const svg = svgRef.current;

        if (!show) {
            svg.innerHTML = '';
            return;
        }

        svg.innerHTML = '';

        const rc = rough.svg(svg);
        const padding = 2;

        // 2. Generowanie kształtu
        const node = rc.rectangle(padding, padding, width - (padding * 2), height - (padding * 2), {
            fill: color,
            fillStyle: fillStyle,
            stroke: "none", // Wyłączamy główny obrys prostokąta, chcemy tylko środek
            roughness: roughness,
            bowing: bowing,
            fillWeight: fillWeight,
            hachureGap: hachureGap,
        });

        // 3. Przygotowanie ścieżek do animacji
        const paths = node.querySelectorAll("path");

        // Obliczamy czas na jedną ścieżkę, żeby całość zmieściła się w animationDuration
        // Jeśli mamy 10 kresek, a czas to 500ms, każda ma 50ms na narysowanie + opóźnienie
        const totalPaths = paths.length;
        const durationPerPath = animationDuration * 15
        const staggerDelay = animationDuration / totalPaths;

        paths.forEach((path) => {
            const length = path.getTotalLength();

            // HACK: Wymuszamy stylowanie, żeby linia była widoczna jako obrys
            path.style.fill = "none";
            path.style.stroke = color;
            path.style.strokeWidth = `${fillWeight}px`;

            // Ustawiamy stan początkowy: linia cofnięta (niewidoczna)
            path.style.strokeDasharray = `${length}`;
            path.style.strokeDashoffset = `${length}`;

            // Reset tranzycji na start (żeby nie animowało się cofanie)
            path.style.transition = "none";
        });

        svg.appendChild(node);

        // 4. Wyzwalacz animacji (Double RAF dla pewności)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                paths.forEach((path, i) => {
                    // Obliczamy opóźnienie dla efektu "fali" (kolejne linie startują później)
                    const delay = i * staggerDelay;

                    path.style.transition = `stroke-dashoffset ${durationPerPath}ms ease-out ${delay}ms`;
                    path.style.strokeDashoffset = "0";
                });
            });
        });

    }, [width, height, show, color, fillStyle, roughness, bowing, fillWeight, hachureGap, animationDuration]);

    return (
        <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0">
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                className="overflow-visible"
            />
        </div>
    );
}