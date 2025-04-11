
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
  // Generate points for the weekly spiral with increased density for smoother curve
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
    
    // Color variations by day of the week with smoother transitions
    const dayColors = [
      new THREE.Color(0x6495ED), // Monday - Blue
      new THREE.Color(0x98FB98), // Tuesday - Green
      new THREE.Color(0xFFD700), // Wednesday - Yellow
      new THREE.Color(0xFFA07A), // Thursday - Light salmon
      new THREE.Color(0xDA70D6), // Friday - Orchid
      new THREE.Color(0xFF6347), // Saturday - Tomato
      new THREE.Color(0xF0F8FF)  // Sunday - Alice blue
    ];
    
    // Get the base color for this day
    let baseColor = dayColors[dayOfWeek];
    
    // If this is a new day, implement a gradual transition
    if (dayOfWeek !== previousDay && previousDay !== -1) {
      // Create a transition by blending between colors
      const prevColor = dayColors[previousDay];
      const fraction = (point.position.y % (1.5 * zoom)) / (1.5 * zoom);
      baseColor = prevColor.clone().lerp(baseColor, fraction);
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
      lineWidth={2.5} // Slightly thicker line for better visibility
      transparent
      opacity={0.7}
    />
  );
};
