
import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface EventRingProps {
  color: string;
  isProcessEvent?: boolean;
}

export const EventRing: React.FC<EventRingProps> = ({ 
  color, 
  isProcessEvent = false 
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Size of the ring - decreased for one-time events
  const ringSize = isProcessEvent ? 0.25 : 0.26;
  
  // Animation for the ring
  useFrame((state, delta) => {
    if (ringRef.current) {
      // Rotate the ring - faster for one-time events
      const rotationSpeed = isProcessEvent ? 0.2 : 0.4;
      ringRef.current.rotation.z += delta * rotationSpeed;
    }
  });
  
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[ringSize * 0.9, ringSize, 64]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
