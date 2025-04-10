
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";
import { calculateMonthlySpiralSegment } from "@/utils/monthlyUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
  viewMode?: "annual" | "quarterly" | "monthly";
}

export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom,
  viewMode = "annual"
}) => {
  // Calculate points for the segment based on the view mode
  const points = useMemo(() => {
    switch (viewMode) {
      case "quarterly":
        return calculateQuarterlySpiralSegment(
          startEvent, 
          endEvent, 
          startYear, 
          200, // points
          5 * zoom, // base radius
          1.5 * zoom // height per loop
        );
      case "monthly":
        return calculateMonthlySpiralSegment(
          startEvent, 
          endEvent, 
          startYear, 
          100, // points
          5 * zoom, // base radius
          0.6 * zoom // height per loop
        );
      case "annual":
      default:
        return calculateSpiralSegment(
          startEvent, 
          endEvent, 
          startYear, 
          200, // points
          5 * zoom, // base radius
          1.5 * zoom // height per loop
        );
    }
  }, [startEvent, endEvent, startYear, zoom, viewMode]);
  
  // Create color array with gradients
  const colors = useMemo(() => {
    const colorsArray = [];
    const color = new THREE.Color(startEvent.color);
    
    for (let i = 0; i < points.length; i++) {
      const intensity = startEvent.intensity / 10; // Normalize to 0-1
      const adjustedColor = color.clone();
      
      // Add more brightness for higher intensity events
      adjustedColor.lerp(new THREE.Color(1, 1, 1), 0.2 + (intensity * 0.3));
      
      // For process events, fade out towards the end
      if (startEvent !== endEvent) {
        const progress = i / (points.length - 1);
        const fadeOut = Math.max(0.3, 1 - progress); // Don't fade completely
        adjustedColor.multiplyScalar(fadeOut);
      }
      
      colorsArray.push(adjustedColor);
    }
    
    return colorsArray;
  }, [points, startEvent, endEvent]);
  
  // Only render if we have valid points
  if (points.length < 2) {
    return null;
  }
  
  return (
    <Line 
      points={points}
      color={startEvent.color}
      vertexColors={colors}
      lineWidth={1.5 + (startEvent.intensity * 0.2)}
      transparent
      opacity={0.7}
    />
  );
};
