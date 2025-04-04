
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

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
  
  // Create a pulsing animation for the point
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // More noticeable pulse effect (increased from 1.0 to 1.5)
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.15 * (event.intensity / 10);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Enhanced glow pulse (increased from 1.5 to 2.2)
      const glowScale = 1.2 + Math.sin(time * 2.2) * 0.2;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
  });
  
  // Calculate size based on event intensity (1-10)
  // Increasing size by 30% for more visibility
  const size = 0.05 + (event.intensity / 10) * 0.08;
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - more detailed with better geometry */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} /> {/* Increased geometry detail from 6,6 to 12,12 */}
        <meshStandardMaterial 
          color={event.color} 
          transparent 
          opacity={0.9}
          emissive={event.color}
          emissiveIntensity={2.5} // Increased from 1.5 to 2.5 for more glow
        />
      </mesh>
      
      {/* Enhanced glow effect */}
      <sprite ref={glowRef} scale={[0.6 + event.intensity * 0.08, 0.6 + event.intensity * 0.08, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={event.color} 
          transparent 
          opacity={0.8} // Increased from 0.7
          blending={THREE.AdditiveBlending}
        />
      </sprite>
      
      {/* Add a point light for extra illumination */}
      <pointLight 
        color={event.color} 
        intensity={0.5 + event.intensity * 0.1} 
        distance={1.5} 
        decay={2}
      />
    </group>
  );
};
