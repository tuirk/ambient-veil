
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { isSeasonalEvent } from "@/utils/seasonalUtils";

interface EventDurationProps {
  startEvent: TimeEvent;   // Event that marks the start of the duration
  endEvent: TimeEvent;     // Event that marks the end of the duration
  startYear: number;       // First year of the spiral (used for positioning)
  zoom: number;            // Current zoom level (affects visual scale)
}

/**
 * Renders a line segment between two events on the spiral, representing a duration
 * Higher point count (200) ensures smooth curves for all colors
 * For seasonal rough dates, renders with a special visual effect
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
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);
  
  // For seasonal dates, use different visual properties
  const lineWidth = isRoughDate 
    ? 3 + startEvent.intensity * 0.5 // Wider line for rough dates
    : 2 + startEvent.intensity * 0.5;
    
  const opacity = isRoughDate
    ? 0.5 + startEvent.intensity * 0.03 // More transparent for rough dates
    : 0.6 + startEvent.intensity * 0.04;
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      // Apply blur effect for seasonal rough dates
      vertexColors={isRoughDate ? true : false}
      // For rough dates, use dashed line effect
      dashed={isRoughDate}
      dashSize={isRoughDate ? 0.1 : 0}
      dashOffset={isRoughDate ? 0.1 : 0}
      dashScale={isRoughDate ? 10 : 0}
    />
  );
};
