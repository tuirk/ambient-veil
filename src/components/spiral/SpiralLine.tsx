
import React, { useMemo } from "react";
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
  
  // Generate spiral data only once when props change
  const { positions, colors } = useMemo(() => {
    // Generate points for the full spiral
    const spiralPoints = generateSpiralPoints(
      startYear, 
      currentYear, 
      360, 
      5 * zoom, 
      1.5 * zoom
    );
    
    // Extract positions for the spiral line
    const positionsArray = spiralPoints.map(point => point.position);
    
    // Create uniform white/off-white colors for the spiral line
    const colorsArray = [];
    
    spiralPoints.forEach((point) => {
      // Use a consistent off-white color - no rainbow effect
      const baseColor = new THREE.Color(0xf0f0f0);
      
      // Only slightly fade older years for subtle effect
      if (point.year < minAllowedYear) {
        // Calculate how far back this year is from the minimum allowed
        const yearsBeyondMin = minAllowedYear - point.year;
        // Maintain high opacity for old years - just slightly dimmer
        const opacity = Math.max(0.5, 1 - (yearsBeyondMin * 0.1));
        
        // Create a very slight gold tint for older years
        const slightlyWarmColor = new THREE.Color(0xf2f0e8);
        // Very subtle blend
        baseColor.lerp(slightlyWarmColor, Math.min(0.3, yearsBeyondMin * 0.05));
      }
      
      // Push the color to our array
      colorsArray.push(baseColor);
    });
    
    return { positions: positionsArray, colors: colorsArray };
  }, [startYear, currentYear, zoom, minAllowedYear]);
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={0.5} // Slightly increased for better visibility
      transparent
      opacity={0.15} // Slightly increased for better visibility
      blending={THREE.AdditiveBlending} // Keep softer blending mode
      depthWrite={false} // Prevent depth writing to avoid black shadow
      renderOrder={10} // Ensure spiral renders above background
    />
  );
};
