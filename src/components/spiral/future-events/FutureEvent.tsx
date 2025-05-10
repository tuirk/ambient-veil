
import React from "react";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

interface FutureEventProps {
  event: TimeEvent;
  onClick: (year: number, month: number, x: number, z: number) => void;
}

export const FutureEvent: React.FC<FutureEventProps> = ({ event, onClick }) => {
  // Create a more interesting future event visualization as floating debris
  const randomDistance = 15 + Math.random() * 20;
  const randomAngle = Math.random() * Math.PI * 2;
  const randomHeight = (Math.random() - 0.5) * 20;
  
  const x = randomDistance * Math.cos(randomAngle);
  const y = randomHeight;
  const z = randomDistance * Math.sin(randomAngle);
  
  // Handle click on the future event
  const handleClick = () => {
    const year = event.startDate.getFullYear();
    const month = event.startDate.getMonth();
    onClick(year, month, x, z);
  };
  
  // Create different geometry based on intensity
  return (
    <mesh 
      position={[x, y, z]}
      rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
      onClick={handleClick}
    >
      {event.intensity > 7 ? (
        <octahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
      ) : event.intensity > 4 ? (
        <tetrahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
      ) : (
        <dodecahedronGeometry args={[0.15 + event.intensity * 0.02, 0]} />
      )}
      <meshStandardMaterial 
        color={event.color} 
        transparent 
        opacity={0.7} 
        emissive={event.color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};
