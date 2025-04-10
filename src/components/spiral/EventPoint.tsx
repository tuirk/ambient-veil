
import React, { useMemo } from "react";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getMonthlyEventPosition } from "@/utils/monthlyUtils";
import * as THREE from "three";

interface EventPointProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  viewMode?: "annual" | "quarterly" | "monthly";
  onClick: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom,
  viewMode = "annual",
  onClick 
}) => {
  // Calculate the position based on the view mode
  const position = useMemo(() => {
    switch (viewMode) {
      case "quarterly":
        return getQuarterlyEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      case "monthly":
        return getMonthlyEventPosition(event, startYear, 5 * zoom, 0.6 * zoom);
      case "annual":
      default:
        return getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
    }
  }, [event, startYear, zoom, viewMode]);

  // Size based on intensity
  const size = 0.1 + event.intensity * 0.02;
  
  return (
    <mesh position={[position.x, position.y, position.z]} onClick={onClick}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={event.color} 
        emissive={event.color} 
        emissiveIntensity={0.5} 
        transparent 
        opacity={0.9} 
      />
    </mesh>
  );
};
