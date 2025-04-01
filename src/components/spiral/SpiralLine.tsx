
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
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
  const minAllowedYear = new Date().getFullYear() - 5;
  const maxAllowedYear = new Date().getFullYear() + 1;
  
  // Generate points for the full spiral
  const spiralPoints = generateSpiralPoints(
    startYear, 
    currentYear, 
    360, 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Generate color data for the spiral with opacity fading for older rings
  const colors = new Float32Array(positions.length * 3);
  const colorsArray = Array.from({ length: positions.length });
  
  spiralPoints.forEach((point, i) => {
    const i3 = i * 3;
    const baseColor = new THREE.Color(0xffffff);
    
    // Apply fading to years older than minAllowedYear
    if (point.year < minAllowedYear) {
      // Calculate how far back this year is from the minimum allowed
      const yearsBeyondMin = minAllowedYear - point.year;
      // 0.3 is minimum opacity, fade more for older years
      const opacity = Math.max(0.3, 1 - (yearsBeyondMin * 0.15));
      
      // Create a silver-gray color for older years
      const silverGray = new THREE.Color(0x9F9EA1);
      // Blend with white based on how old the year is
      baseColor.lerp(silverGray, 0.5 + (yearsBeyondMin * 0.1));
      
      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
      
      colorsArray[i] = {
        r: baseColor.r,
        g: baseColor.g,
        b: baseColor.b
      };
    } else {
      // Normal color for years within range
      colors[i3] = 1;     // R
      colors[i3 + 1] = 1; // G
      colors[i3 + 2] = 1; // B
      
      colorsArray[i] = {
        r: 1,
        g: 1,
        b: 1
      };
    }
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
