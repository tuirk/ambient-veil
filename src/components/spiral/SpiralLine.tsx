
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateSpiralPoints } from "@/utils/spiralUtils";

interface SpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
  view: "month" | "year"; // Add view prop
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  startYear,
  currentYear,
  zoom,
  view
}) => {
  const minAllowedYear = new Date().getFullYear() - 5;
  const maxAllowedYear = new Date().getFullYear() + 1;
  
  // For month view, only generate points for the current month
  const today = new Date();
  const currentYearValue = today.getFullYear();
  const currentMonthValue = today.getMonth();
  
  // Determine the year and month range based on the view
  let yearStart = startYear;
  let yearEnd = currentYear;
  let stepsPerLoop = 360; // Default for year view
  
  if (view === "month") {
    // For month view, focus on current month +/- half a month
    yearStart = currentYearValue;
    yearEnd = currentYearValue;
    stepsPerLoop = 60; // Higher resolution for month view
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
  const filteredPoints = view === "month" 
    ? spiralPoints.filter(point => {
        // Show only points within +/- half a month of the current month
        if (point.year !== currentYearValue) return false;
        
        const monthDiff = Math.abs(point.month - currentMonthValue);
        // Allow a bit of overlap with adjacent months
        return monthDiff < 1.5 || monthDiff > 10.5; // Handle December-January wrap
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
    
    // If month view, highlight the current month
    if (view === "month" && point.year === currentYearValue && point.month === currentMonthValue) {
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
      lineWidth={view === "month" ? 2 : 1} // Thicker line for month view
      transparent
      opacity={0.5} // Slightly higher opacity for better visibility
    />
  );
};
