
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateWeeklySpiralPoints } from "@/utils/weeklyUtils";

interface WeeklySpiralLineProps {
  startDate: Date;
  endDate: Date;
  zoom: number;
}

export const WeeklySpiralLine: React.FC<WeeklySpiralLineProps> = ({
  startDate,
  endDate,
  zoom
}) => {
  // Generate points for the weekly spiral
  const spiralPoints = generateWeeklySpiralPoints(
    startDate, 
    endDate, 
    120, // Points per day
    5 * zoom, 
    0.7 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with day transitions
  const colors = [];
  let previousDay = -1;
  
  spiralPoints.forEach((point) => {
    // Get day of week (0-6, Sunday-Saturday)
    const date = new Date(point.year, point.month, point.day);
    const dayOfWeek = date.getDay();
    
    // Different color for each day of the week
    let baseColor;
    switch(dayOfWeek) {
      case 0: baseColor = new THREE.Color(0xFF6347); break; // Sunday - Tomato
      case 1: baseColor = new THREE.Color(0x4682B4); break; // Monday - Steel Blue
      case 2: baseColor = new THREE.Color(0x32CD32); break; // Tuesday - Lime Green
      case 3: baseColor = new THREE.Color(0xDA70D6); break; // Wednesday - Orchid
      case 4: baseColor = new THREE.Color(0xFFD700); break; // Thursday - Gold
      case 5: baseColor = new THREE.Color(0x6A5ACD); break; // Friday - Slate Blue
      case 6: baseColor = new THREE.Color(0xFF69B4); break; // Saturday - Hot Pink
      default: baseColor = new THREE.Color(0xFFFFFF); break; // Default white
    }
    
    // Blend with white for better visibility
    baseColor.lerp(new THREE.Color(0xffffff), 0.6);
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
