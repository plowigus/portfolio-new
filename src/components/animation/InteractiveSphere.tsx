import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function VinylRecord() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // 33.33 RPM calculation
  // 33.33 revolutions per minute = 0.5555 revolutions per second
  // 1 revolution = 2 * PI radians
  // Radians per second = 0.5555 * 2 * PI ≈ 3.49 rad/s
  const RPM_33 = (33.33 / 60) * 2 * Math.PI;

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Constant rotation
      groupRef.current.rotation.y += delta * RPM_33;

      // Hover interaction (tilt and slight lift)
      const targetTilt = hovered ? 0.3 : 0.2;
      const targetScale = hovered ? 1.05 : 1.0;

      // Smoothly interpolate tilt and scale
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetTilt,
        delta * 3
      );
      groupRef.current.scale.setScalar(
        THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, delta * 3)
      );
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      rotation={[0.2, 0, 0]}
    >
      {/* Vinyl Disc Body - High Detail */}
      <mesh receiveShadow castShadow>
        <cylinderGeometry args={[4, 4, 0.08, 128]} />
        <meshPhysicalMaterial
          color="#050505"
          roughness={0.4}
          metalness={0.1}
          clearcoat={1.0}
          clearcoatRoughness={0.2}
          anisotropy={16}
          anisotropyRotation={0}
          sheen={0.5}
          sheenColor="#ffffff"
        />
      </mesh>

      {/* Grooves Texture Simulation (Inner Ring) */}
      <mesh position={[0, 0.041, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.55, 3.8, 64]} />
        <meshPhysicalMaterial
          color="#080808"
          roughness={0.6}
          metalness={0.2}
          opacity={0.8}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Label - Top */}
      <mesh position={[0, 0.045, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.02, 64]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.0} />
      </mesh>

      {/* Label - Bottom */}
      <mesh position={[0, -0.045, 0]}>
        <cylinderGeometry args={[1.5, 1.5, 0.02, 64]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.0} />
      </mesh>

      {/* Center Hole / Spindle */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.12, 32]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
    </group>
  );
}

export function InteractiveSphere() {
  return (
    <Canvas
      camera={{ position: [0, 6, 8], fov: 40 }}
      style={{ width: "100%", height: "100%" }}
      className="w-full h-full"
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <ambientLight intensity={0.2} />
      {/* Main Key Light */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {/* Fill Light */}
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#4f46e5" />
      {/* Rim Light for edges */}
      <spotLight
        position={[0, 5, -5]}
        intensity={1}
        angle={0.5}
        penumbra={1}
        color="#ffffff"
      />

      <Environment preset="studio" background={false} />

      <VinylRecord />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
