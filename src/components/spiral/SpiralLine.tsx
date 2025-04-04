
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface SpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
  view: "year" | "near-future"; // Updated view prop type
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  startYear,
  currentYear,
  zoom,
  view
}) => {
  const minAllowedYear = new Date().getFullYear() - 5;
  const maxAllowedYear = new Date().getFullYear() + 1;
  
  // For near-future view, only generate points for current and previous month
  const today = new Date();
  const currentYearValue = today.getFullYear();
  const currentMonthValue = today.getMonth();

  // Calculate previous month and year
  let previousMonthValue = currentMonthValue - 1;
  let previousYearValue = currentYearValue;

  if (previousMonthValue < 0) {
    previousMonthValue = 11; // December
    previousYearValue = currentYearValue - 1;
  }
  
  // Determine the year and month range based on the view
  let yearStart = startYear;
  let yearEnd = currentYear;
  let stepsPerLoop = 360; // Default for year view
  
  if (view === "near-future") {
    // For near-future view, focus on current month and previous month
    yearStart = Math.min(previousYearValue, currentYearValue);
    yearEnd = currentYearValue;
    stepsPerLoop = 120; // Higher resolution for near-future view
  }
  
  // Generate points for the spiral
  const spiralPoints = generateSpiralPoints(
    yearStart, 
    yearEnd, 
    stepsPerLoop, 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Filter points based on view if needed
  const filteredPoints = view === "near-future" 
    ? spiralPoints.filter(point => {
        // Show only points from current and previous month
        if (point.year === currentYearValue && point.month === currentMonthValue) {
          return true;
        }
        if (point.year === previousYearValue && point.month === previousMonthValue) {
          return true;
        }
        // Also include points in between for smooth transition
        if (point.year === currentYearValue && 
            ((point.month === previousMonthValue && previousYearValue === currentYearValue) || 
             (point.month === (currentMonthValue + 1) % 12))) {
          return true;
        }
        return false;
      })
    : spiralPoints;
  
  // Extract positions for the spiral line
  const positions = filteredPoints.map(point => point.position);
  
  // Instead of using Float32Array, create an array of THREE.Color objects
  const colors = [];
  
  filteredPoints.forEach((point) => {
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
    
    // If near-future view, highlight the current month
    if (view === "near-future" && point.year === currentYearValue && point.month === currentMonthValue) {
      // Brighter color for current month
      baseColor.multiplyScalar(1.5);
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
