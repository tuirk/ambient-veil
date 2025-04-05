
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
  useQuarterlyPositioning?: boolean;
}

export const EventDuration: React.FC<EventDurationProps> = ({
  startEvent,
  endEvent,
  startYear,
  zoom,
  useQuarterlyPositioning = false
}) => {
  // Calculate points along the spiral segment for this event duration
  const points = useQuarterlyPositioning
    ? calculateQuarterlySpiralSegment(
        startEvent,
        endEvent,
        startYear,
        30,
        5 * zoom,
        1.5 * zoom
      )
    : calculateSpiralSegment(
        startEvent,
        endEvent,
        startYear,
        30,
        5 * zoom,
        1.5 * zoom
      );
  
  // Apply intensity to the visualization
  const intensity = startEvent.intensity || 5;
  const lineOpacity = 0.6 + (intensity / 10) * 0.3; // 0.6 to 0.9 based on intensity
  const lineWidth = 2 + (intensity / 10) * 2; // 2 to 4 based on intensity
  
  // Convert color string to THREE.Color
  const colorObj = new THREE.Color(startEvent.color);
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={lineWidth}
      transparent
      opacity={lineOpacity}
    />
  );
};
