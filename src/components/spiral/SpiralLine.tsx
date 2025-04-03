
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface SpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate spiral data only once when props change
  const { positions } = useMemo(() => {
    // Generate points for the full spiral
    const spiralPoints = generateSpiralPoints(
      startYear, 
      currentYear, 
      360, 
      5 * zoom, 
      1.5 * zoom
    );
    
    // Extract positions for the spiral line
    const positionsArray = spiralPoints.map(point => point.position);
    
    return { positions: positionsArray };
  }, [startYear, currentYear, zoom]);
  
  return (
    <Line
      points={positions}
      color="#f0f0f0"
      lineWidth={0.5}
      transparent
      opacity={0.15}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      renderOrder={10}
    />
  );
};
