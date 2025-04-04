
import React, { useMemo } from "react";
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
  // Generate points for the quarterly spiral with memoization
  const spiralPoints = useMemo(() => {
    return generateQuarterlySpiralPoints(
      startYear, 
      currentYear, 
      // Restore higher resolution for smoother curves
      360, // Restored from 280 to 360
      5 * zoom, 
      1.5 * zoom
    );
  }, [startYear, currentYear, zoom]);
  
  // Extract positions for the spiral line
  const positions = useMemo(() => {
    return spiralPoints.map(point => point.position);
  }, [spiralPoints]);
  
  // Create colors for the spiral line
  const colors = useMemo(() => {
    const colorArray = [];
    
    spiralPoints.forEach((point) => {
      const baseColor = new THREE.Color(0xffffff);
      colorArray.push(baseColor);
    });
    
    return colorArray;
  }, [spiralPoints]);
  
  return (
    <>
      {/* Main spiral line */}
      <Line
        points={positions}
        color="white"
        vertexColors={colors}
        lineWidth={1.2} // Increased from 1.0
        transparent
        opacity={0.4} // Increased from 0.3
      />
      
      {/* Subtle glow effect for the spiral */}
      <Line
        points={positions}
        color="white"
        lineWidth={2.5}
        transparent
        opacity={0.15}
        blending={THREE.AdditiveBlending}
      />
    </>
  );
};
