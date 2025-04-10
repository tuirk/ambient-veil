
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateMonthlySpiralPoints } from "@/utils/monthlyUtils";

interface MonthlySpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MonthlySpiralLine: React.FC<MonthlySpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate points for the monthly spiral
  const spiralPoints = generateMonthlySpiralPoints(
    startYear, 
    currentYear, 
    360, // Points per month
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with month transitions
  const colors = [];
  let previousMonth = -1;
  
  spiralPoints.forEach((point) => {
    const month = point.month;
    
    // Different color for each month
    let baseColor;
    switch(month) {
      case 0: baseColor = new THREE.Color(0x8A2BE2); break; // January - Purple
      case 1: baseColor = new THREE.Color(0x4169E1); break; // February - Royal Blue
      case 2: baseColor = new THREE.Color(0x32CD32); break; // March - Lime Green
      case 3: baseColor = new THREE.Color(0x00FA9A); break; // April - Medium Spring Green
      case 4: baseColor = new THREE.Color(0xFFD700); break; // May - Gold
      case 5: baseColor = new THREE.Color(0xFF7F50); break; // June - Coral
      case 6: baseColor = new THREE.Color(0xFF4500); break; // July - Orange Red
      case 7: baseColor = new THREE.Color(0xFF1493); break; // August - Deep Pink
      case 8: baseColor = new THREE.Color(0xFF69B4); break; // September - Hot Pink
      case 9: baseColor = new THREE.Color(0xDC143C); break; // October - Crimson
      case 10: baseColor = new THREE.Color(0xCD5C5C); break; // November - Indian Red
      case 11: baseColor = new THREE.Color(0x6495ED); break; // December - Cornflower Blue
      default: baseColor = new THREE.Color(0xFFFFFF); break; // Default to white
    }
    
    // Blend with white for better visibility
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
