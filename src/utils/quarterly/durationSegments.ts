
import { TimeEvent } from "@/types/event";
import { Vector3 } from "three";
import { getQuarterlyEventPosition } from "./eventPositioning";
import { getSeasonMiddleDate } from "../seasonalUtils";

/**
 * Calculate a segment of points between two events on a quarterly spiral
 * Used for visualizing events with duration
 * @param startEvent Event marking the start of the segment
 * @param endEvent Event marking the end of the segment
 * @param startYear First year of the spiral (for reference)
 * @param steps Number of points to generate along the segment
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between loops
 * @returns Array of Vector3 points along the segment
 */
export const calculateQuarterlySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  steps: number = 20,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  const points: Vector3[] = [];
  
  // Handle seasonal events by converting to specific dates
  let effectiveStartEvent = startEvent;
  let effectiveEndEvent = endEvent;
  
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
  
  // Get start and end positions
  const startPos = getQuarterlyEventPosition(effectiveStartEvent, startYear, radius, heightPerLoop);
  const endPos = getQuarterlyEventPosition(effectiveEndEvent, startYear, radius, heightPerLoop);
  
  // Generate intermediate points
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    
    // Linear interpolation between start and end
    const x = startPos.x + (endPos.x - startPos.x) * t;
    const y = startPos.y + (endPos.y - startPos.y) * t;
    const z = startPos.z + (endPos.z - startPos.z) * t;
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
