
import React from "react";
import { Line } from "@react-three/drei";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface SpiralLineProps {
  startYear: number;     // First year to display in the spiral
  currentYear: number;   // Latest year to display in the spiral
  zoom: number;          // Zoom level (affects visual scale)
}

/**
 * Renders the main spiral timeline structure
 * Uses high point count (720) for a smooth curve
 */
export const SpiralLine: React.FC<SpiralLineProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  // Generate the spiral with high resolution for smoothness
  const spiralPoints = generateSpiralPoints(
    startYear, 
    currentYear, 
    720, // High resolution for a very smooth spiral
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
