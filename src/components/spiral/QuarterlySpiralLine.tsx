
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
  // Generate points for the quarterly spiral with higher resolution
  const spiralPoints = generateQuarterlySpiralPoints(
    startYear, 
    currentYear, 
    180, // Points per monthly coil
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with enhanced month transitions
  const colors = [];
  let previousMonth = -1;
  
  spiralPoints.forEach((point) => {
    const month = point.month;
    
    // Enhanced color variations by month with improved visibility
    let baseColor;
    
    // Seasonal coloring
    if (month === 0 || month === 1 || month === 2) {
      // Winter (blue-white)
      baseColor = new THREE.Color(0xF0F8FF);
    } else if (month === 3 || month === 4 || month === 5) {
      // Spring (green)
      baseColor = new THREE.Color(0x98FB98);
    } else if (month === 6 || month === 7 || month === 8) {
      // Summer (gold)
      baseColor = new THREE.Color(0xFFD700);
    } else {
      // Fall (orange-gold)
      baseColor = new THREE.Color(0xDAA520);
    }
    
    // Make colors more visible in quarterly view
    baseColor.lerp(new THREE.Color(0xffffff), 0.6);
    colors.push(baseColor);
    
    previousMonth = month;
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={2}
      transparent
      opacity={0.6}
    />
  );
};
