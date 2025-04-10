
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getDailyEventPosition } from "./eventPositioning";

/**
 * Calculate points along the spiral between two events for daily view
 * @param startEvent The starting event
 * @param endEvent The ending event
 * @param startDate The start date of the spiral
 * @param steps Number of points to generate between start and end
 * @param baseRadius Base radius of the spiral
 * @param heightPerLoop Height between loops
 * @returns Array of Vector3 points forming the segment
 */
export const calculateDailySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startDate: Date,
  steps: number = 30,
  baseRadius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  const points: Vector3[] = [];
  const startPosition = getDailyEventPosition(startEvent, startDate, baseRadius, heightPerLoop);
  const endPosition = getDailyEventPosition(endEvent, startDate, baseRadius, heightPerLoop);
  
  // Skip if either position is outside the visible area
  if (
    (startPosition.x === -100 && startPosition.y === -100 && startPosition.z === -100) ||
    (endPosition.x === -100 && endPosition.y === -100 && endPosition.z === -100)
  ) {
    return [startPosition];
  }
  
  // Generate interpolated points between start and end
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const point = new Vector3().lerpVectors(startPosition, endPosition, t);
    points.push(point);
  }
  
  return points;
};
