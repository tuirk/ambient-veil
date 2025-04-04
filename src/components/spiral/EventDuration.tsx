
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
  
  // Calculate line width and opacity based on intensity, with enhanced values
  const lineWidth = useMemo(() => Math.min(3 + event.intensity * 0.4, 6.0), [event.intensity]);
  const opacity = useMemo(() => Math.min(0.7 + event.intensity * 0.04, 0.95), [event.intensity]);
  
  // Create a glow effect with a second line
  const glowWidth = useMemo(() => lineWidth * 1.8, [lineWidth]);
  const glowOpacity = useMemo(() => opacity * 0.5, [opacity]);
  
  return (
    <>
      {/* Main line */}
      <Line
        points={points}
        color={colorObj}
        lineWidth={lineWidth}
        transparent
        opacity={opacity}
      />
      
      {/* Glow effect line */}
      <Line
        points={points}
        color={colorObj}
        lineWidth={glowWidth}
        transparent
        opacity={glowOpacity}
        blending={THREE.AdditiveBlending}
      />
    </>
  );
};
