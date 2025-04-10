
import React, { useMemo } from "react";
import { Line } from "@react-three/drei";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";
import { calculateMonthlySpiralSegment } from "@/utils/monthlyUtils";
import { calculateWeeklySpiralSegment } from "@/utils/weeklyUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
  viewType?: "annual" | "quarterly" | "monthly" | "weekly";
  startDate?: Date;
}

export const EventDuration: React.FC<EventDurationProps> = ({
  startEvent,
  endEvent,
  startYear,
  zoom,
  viewType = "annual",
  startDate
}) => {
  // Calculate points for the event duration based on the view type
  const durationPoints = useMemo(() => {
    // Select the appropriate calculation function based on view type
    if (viewType === "quarterly") {
      return calculateQuarterlySpiralSegment(
        startEvent, 
        endEvent, 
        startYear, 
        100, // Segment points
        5 * zoom, 
        1.5 * zoom
      );
    } else if (viewType === "monthly") {
      return calculateMonthlySpiralSegment(
        startEvent,
        endEvent,
        startYear,
        100,
        5 * zoom,
        1.5 * zoom
      );
    } else if (viewType === "weekly" && startDate) {
      return calculateWeeklySpiralSegment(
        startEvent,
        endEvent,
        startDate,
        100,
        5 * zoom,
        0.7 * zoom
      );
    } else {
      // Default to annual view
      return calculateSpiralSegment(
        startEvent, 
        endEvent, 
        startYear, 
        100, 
        5 * zoom, 
        1.5 * zoom
      );
    }
  }, [startEvent, endEvent, startYear, zoom, viewType, startDate]);

  // Determine if this is a "significant" event with high intensity
  const isSignificant = startEvent.intensity >= 7;
  
  return (
    <Line
      points={durationPoints}
      color={startEvent.color}
      // Adjust line width based on event intensity
      lineWidth={(isSignificant ? 3 : 2) + startEvent.intensity * 0.3}
      transparent
      opacity={0.6 + startEvent.intensity * 0.04}
    />
  );
};
