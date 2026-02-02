import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

function VinylRecord() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Base rotation speed
      const baseSpeed = 1.5;
      // Speed up when hovered
      const speed = hovered ? baseSpeed * 2.5 : baseSpeed;
      groupRef.current.rotation.y += delta * speed;

      // Gentle tilt depending on hover
      const targetTilt = hovered ? 0.4 : 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetTilt,
        delta * 2
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      rotation={[0.2, 0, 0]} // Initial slight tilt
    >
      {/* Vinyl Disc */}
      <mesh>
        <cylinderGeometry args={[4, 4, 0.1, 64]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.4}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Vinyl Label */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.05, 64]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>

      {/* Label Detail (Center Hole) */}
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}

export function InteractiveSphere() {
  return (
    <Canvas
      camera={{ position: [0, 5, 8], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="studio" />

      <VinylRecord />
    </Canvas>
  );
}
