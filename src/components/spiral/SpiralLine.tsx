
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
  
  // Create an array of THREE.Color objects that the Line component can handle
  const colors = [];
  
  spiralPoints.forEach((point) => {
    const baseColor = new THREE.Color(0xffffff);
    
    // Apply fading to years older than minAllowedYear
    if (point.year < minAllowedYear) {
      // Calculate how far back this year is from the minimum allowed
      const yearsBeyondMin = minAllowedYear - point.year;
      // 0.3 is minimum opacity, fade more for older years
      const opacity = Math.max(0.3, 1 - (yearsBeyondMin * 0.15));
      
      // Create a gold color for older years instead of silver-gray
      const goldColor = new THREE.Color(0xE6C200);
      // Blend with white based on how old the year is
      baseColor.lerp(goldColor, 0.5 + (yearsBeyondMin * 0.1));
    }
    
    // Push the color to our array
    colors.push(baseColor);
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={0.5} // Slightly increased from 0.4 for better visibility
      transparent
      opacity={0.15} // Slightly increased from 0.12 for better visibility
      blending={THREE.AdditiveBlending} // Keep softer blending mode
      depthWrite={false} // Prevent depth writing to avoid black shadow
    />
  );
};
