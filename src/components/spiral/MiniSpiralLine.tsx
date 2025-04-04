
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateMiniSpiralPoints } from "@/utils/miniSpiralUtils";

interface MiniSpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MiniSpiralLine: React.FC<MiniSpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate points for the mini spiral
  // This will cover from Jan 1st of current year to today
  const spiralPoints = generateMiniSpiralPoints(
    startYear, 
    currentYear, 
    180, 
    5 * zoom, 
    1.2 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line
  const colors = [];
  
  spiralPoints.forEach((point) => {
    const baseColor = new THREE.Color(0xffffff);
    colors.push(baseColor);
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
};
