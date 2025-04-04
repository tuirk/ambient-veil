
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface SpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
  view: "year" | "near-future";
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  startYear,
  currentYear,
  zoom,
  view
}) => {
  const minAllowedYear = new Date().getFullYear() - 5;
  const maxAllowedYear = new Date().getFullYear() + 1;
  
  // Get current year for near-future view
  const currentYearValue = new Date().getFullYear();
  
  // Determine the year range based on the view
  let yearStart = startYear;
  let yearEnd = currentYear;
  let stepsPerLoop = 360; // Default for year view
  
  if (view === "near-future") {
    // For near-future view, start from January 1st of current year
    yearStart = currentYearValue;
    yearEnd = currentYear; // Keep the same end year
  }
  
  // Generate points for the spiral
  const spiralPoints = generateSpiralPoints(
    yearStart, 
    yearEnd, 
    stepsPerLoop, 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Instead of using Float32Array, create an array of THREE.Color objects
  const colors = [];
  
  spiralPoints.forEach((point) => {
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
    }
    
    // Push the color to our array
    colors.push(baseColor);
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={view === "near-future" ? 2 : 1} // Thicker line for near-future view
      transparent
      opacity={0.5} // Slightly higher opacity for better visibility
    />
  );
};
