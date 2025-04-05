
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";
import { getSeasonMiddleDate } from "@/utils/seasonalUtils";

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
  // Create effective event copies that handle seasonal events
  let effectiveStartEvent = startEvent;
  let effectiveEndEvent = endEvent;
  
  // Handle seasonal dates correctly
  if (startEvent.isRoughDate && startEvent.roughDateSeason) {
    const seasonDate = getSeasonMiddleDate(
      startEvent.roughDateSeason, 
      startEvent.roughDateYear || startEvent.startDate.getFullYear()
    );
    effectiveStartEvent = { ...startEvent, startDate: seasonDate };
  }
  
  if (endEvent.isRoughDate && endEvent.roughDateSeason) {
    const seasonDate = getSeasonMiddleDate(
      endEvent.roughDateSeason, 
      endEvent.roughDateYear || endEvent.startDate.getFullYear()
    );
    effectiveEndEvent = { ...endEvent, startDate: seasonDate };
  }

  // Calculate points along the spiral segment for this event duration
  const points = useQuarterlyPositioning
    ? calculateQuarterlySpiralSegment(
        effectiveStartEvent,
        effectiveEndEvent,
        startYear,
        30,
        5 * zoom,
        1.5 * zoom
      )
    : calculateSpiralSegment(
        effectiveStartEvent,
        effectiveEndEvent,
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
