
import React, { useMemo } from "react";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getMonthlyEventPosition } from "@/utils/monthlyUtils";
import { Points, Point } from "@react-three/drei";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  isProcessEvent: boolean;
  viewMode?: "annual" | "quarterly" | "monthly";
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({
  event,
  startYear,
  zoom,
  isProcessEvent,
  viewMode = "annual"
}) => {
  // Calculate the central position based on the view mode
  const centralPosition = useMemo(() => {
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
  
  // Generate particle positions in a spherical pattern around the center
  const particlePositions = useMemo(() => {
    const positions = [];
    const count = isProcessEvent ? 20 : 30 + event.intensity * 5;
    const radius = isProcessEvent ? 0.3 : 0.5 + (event.intensity * 0.1);
    
    for (let i = 0; i < count; i++) {
      // Random position on sphere
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      
      // Random distance from center (within radius)
      const distance = Math.random() * radius;
      
      // Convert to Cartesian coordinates
      const x = centralPosition.x + distance * Math.sin(phi) * Math.cos(theta);
      const y = centralPosition.y + distance * Math.sin(phi) * Math.sin(theta);
      const z = centralPosition.z + distance * Math.cos(phi);
      
      positions.push([x, y, z]);
    }
    
    return positions;
  }, [centralPosition, event.intensity, isProcessEvent]);
  
  return (
    <Points>
      <pointsMaterial
        size={0.05 + event.intensity * 0.01}
        color={event.color}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
      {particlePositions.map((position, index) => (
        <Point key={index} position={position as [number, number, number]} />
      ))}
    </Points>
  );
};
