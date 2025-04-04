
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
  // This prevents recalculating the points on every render
  const spiralPoints = useMemo(() => {
    return generateQuarterlySpiralPoints(
      startYear, 
      currentYear, 
      // Reduce resolution for better performance
      280, // Reduced from 360
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
