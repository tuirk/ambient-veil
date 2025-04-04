
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

interface EventDurationProps {
  event: TimeEvent;
  points: THREE.Vector3[]; // Pre-computed points for the line
  startYear: number;
  zoom: number;
}

export const EventDuration: React.FC<EventDurationProps> = ({
  event,
  points,
  startYear,
  zoom
}) => {
  // Memoize color to prevent recalculation
  const colorObj = useMemo(() => new THREE.Color(event.color), [event.color]);
  
  // Calculate line width and opacity based on intensity, but limit to reasonable values
  const lineWidth = useMemo(() => Math.min(2 + event.intensity * 0.3, 4.5), [event.intensity]);
  const opacity = useMemo(() => Math.min(0.6 + event.intensity * 0.03, 0.85), [event.intensity]);
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
    />
  );
};
