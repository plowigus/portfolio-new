"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Vinyl() {
  const groupRef = useRef<THREE.Group>(null);

  // Procedural Groove Texture - Generated in memory
  const grooveTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 1. Black background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, 1024, 1024);

    // 2. Draw concentric circles (The Grooves)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    const center = 512;

    // Start from label radius (approx 150px) to edge (approx 500px)
    for (let r = 160; r < 500; r += 1.5) {
      // Add slight noise to line width or color for realism if possible, 
      // but simple circles work well for anisotropy base
      ctx.beginPath();
      ctx.arc(center, center, r, 0, 2 * Math.PI);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    // Anisotropy helps with the "radial steak" reflection
    texture.anisotropy = 16;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotation: ~33 RPM. 
      // 33 RPM is ~3.5 rad/s. User suggested slower visual (delta * 1.0), 
      // but let's go for a realistic "feel" somewhere in between or stick to user's "1.0 fine".
      // Let's use 1.2 for a chill spin.
      groupRef.current.rotation.y += delta * 1.2;

      // Subtle Wobble (Z-axis) - characteristic of vinyl
      // Using time to drive a slow sine wave
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.015;

      // Slight vertical floating to keep it alive
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.5, 0, 0]}>
      {/* 1. Base Disc (The Vinyl) */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshPhysicalMaterial
          color="#050505"
          map={grooveTexture}
          bumpMap={grooveTexture}
          bumpScale={0.02}
          roughness={0.4}
          metalness={0.1}
          clearcoat={1.0}        // Plastic coating
          clearcoatRoughness={0.1}
          iridescence={0.1}      // Subtle oil-like sheen
          envMapIntensity={1.2}
        />
      </mesh>

      {/* 2. The Label (Center) */}
      <mesh position={[0, 0.051, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.02, 64]} />
        {/* Accent Color: Indigo/Purple from project */}
        <meshStandardMaterial color="#6366f1" roughness={0.3} />
      </mesh>

      {/* 3. Spindle Hole (Center) */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.02, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function InteractiveSphere() {
  return (
    <Canvas
      camera={{ position: [0, 4, 6], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      className="w-full h-full"
    >
      <Environment preset="city" />

      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.25}
        penumbra={1}
        intensity={2}
        castShadow
      />

      <Vinyl />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.6}
        scale={12}
        blur={2.5}
        far={4}
      />
    </Canvas>
  );
}
