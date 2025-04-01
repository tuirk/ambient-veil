
import React from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
}

export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    30,
    5 * zoom, 
    1.5 * zoom
  );
  
  const colorObj = new THREE.Color(startEvent.color);
  
  return (
    <Line
      points={points}
      color={colorObj}
      lineWidth={2 + startEvent.intensity * 0.5}
      transparent
      opacity={0.6 + startEvent.intensity * 0.04}
    />
  );
};
