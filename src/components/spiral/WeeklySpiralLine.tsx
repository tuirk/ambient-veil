
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateWeeklySpiralPoints } from "@/utils/weekly/weeklyUtils";

interface WeeklySpiralLineProps {
  zoom: number;
}

export const WeeklySpiralLine: React.FC<WeeklySpiralLineProps> = ({
  zoom
}) => {
  // Generate points for the weekly spiral
  const spiralPoints = generateWeeklySpiralPoints(zoom, 1.5 * zoom);
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with day-based transitions
  const colors = [];
  let previousDay = -1;
  
  spiralPoints.forEach((point) => {
    // Get the day of the week (0-6, where 0 is Monday)
    const date = new Date(point.year, point.month, point.day);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // Set to Monday
    const dayOfWeek = Math.floor((date.getTime() - startOfWeek.getTime()) / (24 * 60 * 60 * 1000));
    
    // Color variations by day of the week
    let baseColor;
    switch(dayOfWeek) {
      case 0: // Monday
        baseColor = new THREE.Color(0x6495ED); // Blue
        break;
      case 1: // Tuesday
        baseColor = new THREE.Color(0x98FB98); // Green
        break;
      case 2: // Wednesday
        baseColor = new THREE.Color(0xFFD700); // Yellow
        break;
      case 3: // Thursday
        baseColor = new THREE.Color(0xFFA07A); // Light salmon
        break;
      case 4: // Friday
        baseColor = new THREE.Color(0xDA70D6); // Orchid
        break;
      case 5: // Saturday
        baseColor = new THREE.Color(0xFF6347); // Tomato
        break;
      case 6: // Sunday
        baseColor = new THREE.Color(0xF0F8FF); // Alice blue
        break;
      default:
        baseColor = new THREE.Color(0xFFFFFF); // White
    }
    
    // Make colors more visible
    baseColor.lerp(new THREE.Color(0xffffff), 0.5);
    colors.push(baseColor);
    
    previousDay = dayOfWeek;
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={2} // Thicker line for better visibility
      transparent
      opacity={0.6}
    />
  );
};
