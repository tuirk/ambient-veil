
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
 * Renders a very subtle path indicator between two events
 * The main visual work is done by dust particles, this is just a hint
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
    50,  // Fewer points needed for a subtle path
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the line
  const colorObj = new THREE.Color(startEvent.color);
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);
  
  // Make the line extremely subtle - just a ghost hint of connection
  // Even more subtle now, as the dust cloud will be the main visual element
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={0.2 + startEvent.intensity * 0.03} // Even thinner line
      transparent
      opacity={0.03 + (startEvent.intensity * 0.003)} // More transparent
      // For rough dates, use dashed line effect
      dashed={isRoughDate ? true : false}
      dashSize={isRoughDate ? 0.1 : 0}
      dashOffset={isRoughDate ? 0.1 : 0}
      dashScale={isRoughDate ? 10 : 0}
    />
  );
};
