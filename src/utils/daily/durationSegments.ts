
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getDailyEventPosition } from "./eventPositioning";

/**
 * Calculate a segment of the daily spiral between two events
 * @param startEvent The starting event
 * @param endEvent The ending event
 * @param startDate The starting date of the daily spiral
 * @param segmentPoints Number of points to use for the segment
 * @param baseRadius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each day loop
 * @returns Array of Vector3 points representing the segment
 */
export const calculateDailySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startDate: Date,
  segmentPoints: number = 30,
  baseRadius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  const points: Vector3[] = [];
  
  // Get start and end positions
  const startPos = getDailyEventPosition(startEvent, startDate, baseRadius, heightPerLoop);
  const endPos = getDailyEventPosition(endEvent, startDate, baseRadius, heightPerLoop);
  
  // If either position is outside the visible area, return an empty array
  if (
    (startPos.x === -100 && startPos.y === -100 && startPos.z === -100) ||
    (endPos.x === -100 && endPos.y === -100 && endPos.z === -100)
  ) {
    return [];
  }
  
  // Create points along the segment
  for (let i = 0; i <= segmentPoints; i++) {
    const t = i / segmentPoints;
    
    // Linear interpolation between start and end
    const x = startPos.x + (endPos.x - startPos.x) * t;
    const y = startPos.y + (endPos.y - startPos.y) * t;
    const z = startPos.z + (endPos.z - startPos.z) * t;
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
