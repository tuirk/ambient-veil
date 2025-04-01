
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";

interface EventDurationProps {
  startEvent: TimeEvent;   // Event that marks the start of the duration
  endEvent: TimeEvent;     // Event that marks the end of the duration
  startYear: number;       // First year of the spiral (used for positioning)
  zoom: number;            // Current zoom level (affects visual scale)
}

/**
 * Renders a line segment between two events on the spiral, representing a duration
 * Higher point count (200) ensures smooth curves for all colors
 */
export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  // Generate points for a smooth curve between the two events
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    200,  // Using 200 points for consistently smooth curves regardless of color
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the line
  const colorObj = new THREE.Color(startEvent.color);
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={2 + startEvent.intensity * 0.5} // Line thickness based on event intensity
      transparent
      opacity={0.6 + startEvent.intensity * 0.04} // Opacity also influenced by intensity
    />
  );
};
