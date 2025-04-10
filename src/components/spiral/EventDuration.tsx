
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { TimeEvent, DailyModeConfig } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { calculateDailySpiralSegment } from "@/utils/dailyUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
  dailyMode?: DailyModeConfig;
}

export const EventDuration: React.FC<EventDurationProps> = ({
  startEvent,
  endEvent,
  startYear,
  zoom,
  dailyMode
}) => {
  // Calculate points based on mode
  const points = useMemo(() => {
    if (dailyMode?.enabled) {
      return calculateDailySpiralSegment(
        startEvent,
        endEvent,
        dailyMode.startDate,
        30,
        5 * zoom,
        1.5 * zoom
      );
    } else {
      return calculateSpiralSegment(
        startEvent,
        endEvent,
        startYear,
        30,
        5 * zoom,
        1.5 * zoom
      );
    }
  }, [startEvent, endEvent, startYear, zoom, dailyMode]);

  // If no valid points (e.g., events outside visible range), don't render anything
  if (points.length === 0) {
    return null;
  }

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
