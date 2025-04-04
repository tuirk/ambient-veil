
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateQuarterlySpiralPoints } from "@/utils/quarterlyUtils";

interface QuarterlySpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const QuarterlySpiralLine: React.FC<QuarterlySpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate points for the quarterly spiral
  // This will now cover from Jan 1st of previous year to today
  const spiralPoints = generateQuarterlySpiralPoints(
    startYear, 
    currentYear, 
    360, 
    5 * zoom, 
    1.5 * zoom
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
