
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateDailySpiralPoints } from "@/utils/daily/generateSpiralPoints";

interface DailySpiralLineProps {
  startDate: Date;
  endDate: Date;
  zoom: number;
}

export const DailySpiralLine: React.FC<DailySpiralLineProps> = ({
  startDate,
  endDate,
  zoom
}) => {
  // Generate points for the daily spiral with higher resolution
  const spiralPoints = generateDailySpiralPoints(
    startDate, 
    endDate, 
    540, // More points for smoother spiral 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with day transitions
  const colors = [];
  let previousDay = -1;
  
  spiralPoints.forEach((point) => {
    const dayOfWeek = new Date(point.year, point.month, point.day).getDay();
    
    // Enhanced color variations by day of week
    let baseColor;
    switch (dayOfWeek) {
      case 0: // Sunday
        baseColor = new THREE.Color(0xF08080); // Light Coral
        break;
      case 1: // Monday
        baseColor = new THREE.Color(0x6495ED); // Cornflower Blue
        break;
      case 2: // Tuesday
        baseColor = new THREE.Color(0x98FB98); // Pale Green
        break;
      case 3: // Wednesday
        baseColor = new THREE.Color(0xFFA500); // Orange
        break;
      case 4: // Thursday
        baseColor = new THREE.Color(0xDA70D6); // Orchid
        break;
      case 5: // Friday
        baseColor = new THREE.Color(0xFFD700); // Gold
        break;
      case 6: // Saturday
        baseColor = new THREE.Color(0xB0C4DE); // Light Steel Blue
        break;
      default:
        baseColor = new THREE.Color(0xFFFFFF); // White
    }
    
    // Make colors more visible - less white blending
    baseColor.lerp(new THREE.Color(0xffffff), 0.4);
    colors.push(baseColor);
    
    previousDay = dayOfWeek;
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
