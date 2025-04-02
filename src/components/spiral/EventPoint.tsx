
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
 * Renders a single event as a smaller, more subtle marker on the spiral
 * This serves primarily as an interaction point while the cosmic effect
 * provides the visual impact
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
  
  // Create subtle rotation animation
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });
  
  // Convert color string to THREE.Color
  const colorObj = new THREE.Color(event.color);
  
  return (
    <group position={position} onClick={onClick}>
      {/* Interactive marker sphere - smaller and more subtle */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.07 + event.intensity * 0.01, 8, 8]} />
        <meshBasicMaterial 
          color={colorObj} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </group>
  );
};
