
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventPointProps {
  event: TimeEvent;      // The event to visualize
  startYear: number;     // First year of the spiral (for positioning)
  zoom: number;          // Current zoom level (affects visual scale)
  onClick: () => void;   // Click handler for this event
}

/**
 * Renders a single event as a glowing sphere on the spiral
 * The size, brightness, and glow are all affected by the event's intensity
 */
export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom, 
  onClick 
}) => {
  // Calculate the position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create rotation animation for the event sphere
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01; // Constant rotation for visual effect
    }
  });
  
  // Convert color string to THREE.Color
  const colorObj = new THREE.Color(event.color);
  
  return (
    <group position={position} onClick={onClick}>
      {/* Visible sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.1 + event.intensity * 0.02, 8, 8]} />
        <meshBasicMaterial 
          color={colorObj} 
          transparent 
          opacity={0.7 + event.intensity * 0.03} 
        />
      </mesh>
      {/* Light source for glow effect */}
      <pointLight 
        color={colorObj} 
        intensity={event.intensity * 0.5} 
        distance={1} 
      />
    </group>
  );
};
