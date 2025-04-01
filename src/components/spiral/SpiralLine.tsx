
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
      // Using curveType parameter instead of 'curve'
      // The Line component in @react-three/drei supports different curve types
      curveType="catmullrom" // This creates a smooth curve through the points
      curveTension={0.5} // Controls how tight the curve is (0-1)
    />
  );
};
