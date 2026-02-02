import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import { MathUtils, Mesh } from "three";
import { useControls } from "leva";

// Set to true to disable Leva GUI (register defaults without rendering UI)
const disableGui = true;

export function InteractiveSphere() {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const mousePos = useRef({ x: 0, y: 0 });
  const targetScale = useRef(1);
  const currentScale = useRef(1);

  // Leva GUI Controls - wszystkie możliwe parametry
  const {
    materialType,
    color,
    hoverColor,
    distortStrength,
    hoverDistortStrength,
    distortSpeed,
    hoverDistortSpeed,
    wobbleSpeed,
    wobbleFactor,
    metalness,
    roughness,
    scale,
    hoverScale,
    rotationSpeed,
    autoRotate,
    segments,
    radius,
    pulseEffect,
    pulseSpeed,
    wireframe,
    transparent,
    opacity,
    emissive,
    emissiveIntensity,
  } = disableGui
      ? {
        materialType: "standard",
        color: "#000000",
        hoverColor: "#000000",
        distortStrength: 1.0,
        hoverDistortStrength: 2.5,
        distortSpeed: 5.5,
        hoverDistortSpeed: 15.0,
        wobbleSpeed: 1.0,
        wobbleFactor: 1.3,
        metalness: 0.8,
        roughness: 0.03,
        scale: 1.4,
        hoverScale: 0.6,
        rotationSpeed: 0.9,
        autoRotate: true,
        segments: 24,
        radius: 1.1,
        pulseEffect: false,
        pulseSpeed: 7.2,
        wireframe: true,
        transparent: false,
        opacity: 0.41,
        emissive: "#4e0808",
        emissiveIntensity: 1.2,
      }
      : useControls("Sfera", {
        materialType: {
          value: "standard",
          options: ["distort", "wobble", "standard"],
          label: "Typ materiału",
        },
        color: { value: "#000000", label: "Kolor" },
        hoverColor: { value: "#000000", label: "Kolor hover" },
        distortStrength: {
          value: 1.0,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Dystorsja",
        },
        hoverDistortStrength: {
          value: 2.5,
          min: 0,
          max: 3,
          step: 0.1,
          label: "Dystorsja hover",
        },
        distortSpeed: {
          value: 5.5,
          min: 0,
          max: 10,
          step: 0.5,
          label: "Prędkość dystorsji",
        },
        hoverDistortSpeed: {
          value: 15.0,
          min: 0,
          max: 20,
          step: 0.5,
          label: "Prędkość hover",
        },
        wobbleSpeed: {
          value: 1.0,
          min: 0,
          max: 10,
          step: 0.1,
          label: "Prędkość wobble",
        },
        wobbleFactor: {
          value: 1.3,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Siła wobble",
        },
        metalness: {
          value: 0.8,
          min: 0,
          max: 1,
          step: 0.01,
          label: "Metaliczność",
        },
        roughness: {
          value: 0.03,
          min: 0,
          max: 1,
          step: 0.01,
          label: "Chropowatość",
        },
        scale: { value: 1.4, min: 0.1, max: 3, step: 0.1, label: "Skala" },
        hoverScale: {
          value: 0.6,
          min: 0.1,
          max: 3,
          step: 0.1,
          label: "Skala hover",
        },
        rotationSpeed: {
          value: 0.9,
          min: 0,
          max: 5,
          step: 0.1,
          label: "Prędkość obrotu",
        },
        autoRotate: { value: true, label: "Auto-rotacja" },
        segments: { value: 24, min: 8, max: 256, step: 8, label: "Segmenty" },
        radius: { value: 1.1, min: 0.1, max: 3, step: 0.1, label: "Promień" },
        pulseEffect: { value: false, label: "Efekt pulsacji" },
        pulseSpeed: {
          value: 7.2,
          min: 0,
          max: 10,
          step: 0.1,
          label: "Prędkość pulsacji",
        },
        wireframe: { value: true, label: "Wireframe" },
        transparent: { value: false, label: "Przezroczystość" },
        opacity: { value: 0.41, min: 0, max: 1, step: 0.01, label: "Opacity" },
        emissive: { value: "#4e0808", label: "Kolor emisyjny" },
        emissiveIntensity: {
          value: 1.2,
          min: 0,
          max: 2,
          step: 0.1,
          label: "Intensywność emisji",
        },
      });



  const animationControls = disableGui
    ? {
      lerpSpeed: 0.05,
      mouseInfluence: 0.5,
      enableMouseFollow: false,
      enableHover: false,
    }
    : useControls("Animacja", {
      lerpSpeed: {
        value: 0.05,
        min: 0.01,
        max: 0.5,
        step: 0.01,
        label: "Płynność ruchu",
      },
      mouseInfluence: {
        value: 0.5,
        min: 0,
        max: 2,
        step: 0.1,
        label: "Wpływ myszy",
      },
      enableMouseFollow: { value: false, label: "Podążanie za myszą" },
      enableHover: { value: false, label: "Efekt Hover" },
    });

  // Animacja i reakcja na mysz
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Podążanie za myszą
    if (animationControls.enableMouseFollow) {
      const targetX = mousePos.current.x * animationControls.mouseInfluence;
      const targetY = mousePos.current.y * animationControls.mouseInfluence;

      meshRef.current.rotation.x = MathUtils.lerp(
        meshRef.current.rotation.x,
        targetY + (autoRotate ? time * rotationSpeed * 0.2 : 0),
        animationControls.lerpSpeed
      );
      meshRef.current.rotation.y = MathUtils.lerp(
        meshRef.current.rotation.y,
        targetX + (autoRotate ? time * rotationSpeed * 0.3 : 0),
        animationControls.lerpSpeed
      );
    } else if (autoRotate) {
      meshRef.current.rotation.x = time * rotationSpeed * 0.2;
      meshRef.current.rotation.y = time * rotationSpeed * 0.3;
    }

    // Skalowanie przy hover z pulsacją
    let targetScaleValue =
      hovered && animationControls.enableHover ? hoverScale : scale;
    if (pulseEffect && hovered && animationControls.enableHover) {
      targetScaleValue += Math.sin(time * pulseSpeed) * 0.05;
    }

    targetScale.current = targetScaleValue;
    currentScale.current = MathUtils.lerp(
      currentScale.current,
      targetScale.current,
      animationControls.lerpSpeed * 2
    );
    meshRef.current.scale.setScalar(currentScale.current);
  });

  const handlePointerMove = (event: { point: { x: number; y: number } }) => {
    mousePos.current = {
      x: event.point.x / 2,
      y: event.point.y / 2,
    };
  };

  const currentColor =
    hovered && animationControls.enableHover ? hoverColor : color;
  const currentDistort =
    hovered && animationControls.enableHover
      ? hoverDistortStrength
      : distortStrength;
  const currentSpeed =
    hovered && animationControls.enableHover ? hoverDistortSpeed : distortSpeed;

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerMove={handlePointerMove}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[radius, segments, segments]} />

      {materialType === "distort" && (
        <MeshDistortMaterial
          color={currentColor}
          distort={currentDistort}
          speed={currentSpeed}
          roughness={roughness}
          metalness={metalness}
          wireframe={wireframe}
          transparent={transparent}
          opacity={opacity}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      )}

      {materialType === "wobble" && (
        <MeshWobbleMaterial
          color={currentColor}
          speed={wobbleSpeed}
          factor={wobbleFactor}
          roughness={roughness}
          metalness={metalness}
          wireframe={wireframe}
          transparent={transparent}
          opacity={opacity}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      )}

      {materialType === "standard" && (
        <meshStandardMaterial
          color={currentColor}
          roughness={roughness}
          metalness={metalness}
          wireframe={wireframe}
          transparent={transparent}
          opacity={opacity}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      )}
    </mesh>
  );
}
