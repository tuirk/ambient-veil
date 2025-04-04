
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventPointProps {
  event: TimeEvent;
  position: THREE.Vector3; // Pre-computed position
  startYear: number;
  zoom: number;
  onClick?: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  position,
  startYear, 
  zoom, 
  onClick 
}) => {
  // References for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  
  // Memoize the glow texture creation to avoid recreating on each render
  const glowTexture = useMemo(() => {
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
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Create a pulsing animation for the point with reduced frequency
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Slower pulse effect (reduced from 1.5 to 1.0)
      const pulseScale = 1 + Math.sin(time * 1.0) * 0.1 * (event.intensity / 10);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Slower independent pulse for the glow (reduced from 2.2 to 1.5)
      const glowScale = 1 + Math.sin(time * 1.5) * 0.15;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });
  
  // Calculate size based on event intensity (1-10)
  // Further reduced size by 15% for better performance
  const size = 0.03 + (event.intensity / 10) * 0.06; // Reduced from previous values
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - small but visible */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 6, 6]} /> {/* Reduced geometry complexity from 8,8 to 6,6 */}
        <meshStandardMaterial 
          color={event.color} 
          transparent 
          opacity={0.9}
          emissive={event.color}
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Glow effect for one-time events */}
      <sprite ref={glowRef} scale={[0.4 + event.intensity * 0.05, 0.4 + event.intensity * 0.05, 1]}>
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
