
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { generateQuarterlySpiralPoints } from "@/utils/quarterlyUtils";

interface QuarterlySpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const QuarterlySpiralLine: React.FC<QuarterlySpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  // Generate points for the quarterly spiral with higher resolution
  const spiralPoints = generateQuarterlySpiralPoints(
    startYear, 
    currentYear, 
    540, // More points for smoother spiral 
    5 * zoom, 
    1.5 * zoom
  );
  
  // Extract positions for the spiral line
  const positions = spiralPoints.map(point => point.position);
  
  // Create colors for the spiral line with enhanced quarter transitions
  const colors = [];
  let previousQuarter = -1;
  
  spiralPoints.forEach((point) => {
    const quarter = Math.floor(point.month / 3);
    
    // Enhanced color variations by quarter with improved visibility
    let baseColor;
    if (quarter === 0) {
      baseColor = new THREE.Color(0x6495ED); // Spring blue
    } else if (quarter === 1) {
      baseColor = new THREE.Color(0x98FB98); // Summer green
    } else if (quarter === 2) {
      baseColor = new THREE.Color(0xDAA520); // Fall gold
    } else {
      baseColor = new THREE.Color(0xF0F8FF); // Winter white-blue
    }
    
    // Make colors more visible in quarterly view - less white blending
    baseColor.lerp(new THREE.Color(0xffffff), 0.6); // Reduced from 0.8 to 0.6 for more vibrance
    colors.push(baseColor);
    
    previousQuarter = quarter;
  });
  
  return (
    <Line
      points={positions}
      color="white"
      vertexColors={colors}
      lineWidth={2} // Increased from 1.5 for better visibility
      transparent
      opacity={0.6} // Increased from 0.4 for better visibility
    />
  );
};
