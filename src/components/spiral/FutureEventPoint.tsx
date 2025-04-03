
import React from "react";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

interface FutureEventPointProps {
  event: TimeEvent;
  onClick?: () => void;
}

/**
 * Visualization for future events that float in space
 */
export const FutureEventPoint: React.FC<FutureEventPointProps> = ({ 
  event,
  onClick
}) => {
  // Calculate a randomized position to create a floating effect
  const randomDistance = 15 + Math.random() * 20;
  const randomAngle = Math.random() * Math.PI * 2;
  const randomHeight = (Math.random() - 0.5) * 20;
  
  const x = randomDistance * Math.cos(randomAngle);
  const y = randomHeight;
  const z = randomDistance * Math.sin(randomAngle);
  
  // Use event's mood color if available
  const eventColor = event.mood?.color || event.color;
  
  // Choose geometry based on intensity
  const Geometry = () => {
    if (event.intensity > 7) {
      return <octahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />;
    } else if (event.intensity > 4) {
      return <tetrahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />;
    } else {
      return <dodecahedronGeometry args={[0.15 + event.intensity * 0.02, 0]} />;
    }
  };
  
  return (
    <mesh 
      position={[x, y, z]}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
      onClick={onClick}
    >
      <Geometry />
      <meshStandardMaterial 
        color={eventColor} 
        transparent 
        opacity={0.7} 
        emissive={eventColor}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};
