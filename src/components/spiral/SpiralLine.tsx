
import React from "react";
import { Line } from "@react-three/drei";
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
  // Use more points for a smoother spiral
  const spiralPoints = generateSpiralPoints(
    startYear, 
    currentYear, 
    720, // Double the resolution for smoother spiral
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  return (
    <Line
      points={positions}
      color="white"
      lineWidth={1}
      transparent
      opacity={0.4}
    />
  );
};
