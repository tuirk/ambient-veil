
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
  // Generate points for the monthly spiral with appropriate resolution
  const spiralPoints = generateMonthlySpiralPoints(
    startYear, 
    currentYear, 
    180, // Points for smoother spiral 
    5 * zoom, 
    0.6 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with month transitions
  const colors = [];
  let previousMonth = -1;
  
  spiralPoints.forEach((point) => {
    const month = point.month;
    
    // Color variations by month with good visibility
    let baseColor;
    
    // Different color for each month
    switch(month) {
      case 0: // January
        baseColor = new THREE.Color(0xA1CAF1); // Light blue
        break;
      case 1: // February
        baseColor = new THREE.Color(0xC3B1E1); // Light purple
        break;
      case 2: // March
        baseColor = new THREE.Color(0x6495ED); // Spring blue
        break;
      case 3: // April
        baseColor = new THREE.Color(0x93C572); // Light green
        break;
      case 4: // May
        baseColor = new THREE.Color(0x77DD77); // Light green
        break;
      case 5: // June
        baseColor = new THREE.Color(0x98FB98); // Summer green
        break;
      case 6: // July
        baseColor = new THREE.Color(0xFDB813); // Bright yellow
        break;
      case 7: // August
        baseColor = new THREE.Color(0xFFA500); // Orange
        break;
      case 8: // September
        baseColor = new THREE.Color(0xDAA520); // Fall gold
        break;
      case 9: // October
        baseColor = new THREE.Color(0xFF7518); // Orange-red
        break;
      case 10: // November
        baseColor = new THREE.Color(0xD2691E); // Auburn
        break;
      case 11: // December
        baseColor = new THREE.Color(0xF0F8FF); // Winter white-blue
        break;
      default:
        baseColor = new THREE.Color(0xFFFFFF); // White
    }
    
    // Make colors more visible
    baseColor.lerp(new THREE.Color(0xFFFFFF), 0.6);
    colors.push(baseColor);
    
    previousMonth = month;
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={1.5}
      transparent
      opacity={0.6}
    />
  );
};
