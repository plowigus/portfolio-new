"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function BlueprintVinyl() {
  const groupRef = useRef<THREE.Group>(null);

  // 1. GENEROWANIE TEXTURY "SCHEMATU" (Canvas 2D)
  const textures = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Tło: Przezroczyste (Czarne dla maski)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 1024);

    const center = 512;

    // Rysujemy techniczne pierścienie
    // Zamiast gęstych rowków -> rzadkie, precyzyjne linie pomiarowe
    for (let r = 140; r < 500; r += 5) {

      // Losujemy styl linii dla każdego okręgu
      const variant = Math.random();

      ctx.beginPath();
      ctx.strokeStyle = '#FFFFFF'; // Zawsze biały

      if (variant > 0.9) {
        // GŁÓWNE LINIE (Grube, ciągłe)
        ctx.lineWidth = 3;
        ctx.setLineDash([]); // Ciągła
        ctx.shadowBlur = 10; // Lekki glow
        ctx.shadowColor = 'white';
      } else if (variant > 0.6) {
        // LINIE POMOCNICZE (Cienkie, przerywane)
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 15]); // Kreska - przerwa
        ctx.shadowBlur = 0;
      } else if (variant > 0.3) {
        // KROPKOWANIE (Dotted)
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 8]); // Kropka - długa przerwa
        ctx.shadowBlur = 0;
      } else {
        // PUSTE MIEJSCA (Dla przejrzystości)
        continue;
      }

      ctx.arc(center, center, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Dodatkowy element: "Celownik" / Osie na środku
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(center - 50, center);
    ctx.lineTo(center + 50, center);
    ctx.moveTo(center, center - 50);
    ctx.lineTo(center, center + 50);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 16;

    return {
      map: texture,
      alpha: texture,    // Jasność decyduje o widoczności
      emissive: texture  // Jasność decyduje o świeceniu
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Powolny obrót techniczny
      groupRef.current.rotation.y += delta * 0.2;
      // Lekkie "skanowanie" góra dół
      groupRef.current.rotation.x = 0.5 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  if (!textures) return null;

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef} rotation={[0.5, 0, 0]}>

        {/* --- 1. GŁÓWNY DYSK (DATA RINGS) --- */}
        <mesh>
          <cylinderGeometry args={[2.8, 2.8, 0.02, 64]} />
          <meshBasicMaterial
            transparent={true}
            opacity={0.9}

            map={textures.map}
            alphaMap={textures.alpha}

            color="#ffffff"          // Czysta biel

            // Tryb ADDITIVE sprawia, że czerń znika, a biel świeci
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false} // Ważne dla przenikania warstw
          />
        </mesh>

        {/* --- 2. WIREFRAME CAGE (Siatka strukturalna) --- */}
        {/* To dodaje ten efekt "surowego modelu 3D" */}
        <mesh>
          {/* Mniejsza ilość segmentów (32) dla kanciastego wyglądu */}
          <cylinderGeometry args={[2.85, 2.85, 0.05, 32, 1]} />
          <meshBasicMaterial
            color="#555555" // Ciemnoszary
            wireframe={true}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* --- 3. ŚRODEK (Tech Center) --- */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.03, 32]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Biały pierścień wokół środka */}
        <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.75, 0.8, 64]} />
          <meshBasicMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>

      </group>
    </Float>
  );
}

export default function InteractiveSphere() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full h-full bg-transparent" />;

  return (
    <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 8], fov: 30 }}
        gl={{ alpha: true, antialias: true }}
      >
        {/* Minimalistyczne oświetlenie, bo blueprint sam świeci */}
        {/* Preset city daje ładne, ostre refleksy na krawędziach */}
        <Environment preset="city" />

        <BlueprintVinyl />

        {/* Cień - biały/szary blask zamiast czarnej plamy */}
        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={0.3}
          scale={10}
          blur={4}
          far={4}
          color="#ffffff"
        />
      </Canvas>
    </div>
  );
}