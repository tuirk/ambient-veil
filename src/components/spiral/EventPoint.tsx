
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventPointProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  onClick: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom, 
  onClick 
}) => {
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Glow effect animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  // Convert color string to THREE.Color
  const colorObj = new THREE.Color(event.color);
  
  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1 + event.intensity * 0.02, 8, 8]} />
        <meshBasicMaterial 
          color={colorObj} 
          transparent 
          opacity={0.7 + event.intensity * 0.03} 
        />
      </mesh>
      {/* Glow effect */}
      <pointLight 
        color={colorObj} 
        intensity={event.intensity * 0.5} 
        distance={1} 
      />
    </group>
  );
};
