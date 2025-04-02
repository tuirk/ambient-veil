
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventPointProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  onClick?: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom, 
  onClick 
}) => {
  // Get position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // Reference for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  
  // Create a pulsing animation for the point
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Pulse effect based on time and event intensity
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.1 * (event.intensity / 10);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Independent pulse for the glow
      const glowScale = 1 + Math.sin(time * 2.2) * 0.15;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });
  
  // Calculate size based on event intensity (1-10)
  const size = 0.05 + (event.intensity / 10) * 0.1;
  
  // Create a texture for the glow effect
  const glowTexture = new THREE.CanvasTexture(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
    }
    return canvas;
  });
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - small but visible */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial 
          color={event.color} 
          transparent 
          opacity={0.9}
          emissive={event.color}
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Glow effect for one-time events */}
      <sprite ref={glowRef} scale={[0.6 + event.intensity * 0.08, 0.6 + event.intensity * 0.08, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={event.color} 
          transparent 
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};
