
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getQuarterlyEventPosition } from "./eventPositioning";

/**
 * Calculates a segment of points along the quarterly spiral between two events
 * @param startEvent The starting event
 * @param endEvent The ending event
 * @param startYear First year of the spiral (for reference)
 * @param numPoints Number of points to generate
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between loops
 * @returns Array of 3D vectors representing points along the segment
 */
export const calculateQuarterlySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  numPoints: number = 100,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  const points: Vector3[] = [];
  
  // If start and end are the same, return just the position
  if (startEvent.startDate.getTime() === endEvent.startDate.getTime()) {
    const position = getQuarterlyEventPosition(startEvent, startYear, radius, heightPerLoop);
    points.push(position);
    return points;
  }
  
  // Ensure correct time order
  const earlierDate = startEvent.startDate;
  const laterDate = endEvent.startDate;
  
  // Calculate time difference in milliseconds
  const timeDiff = laterDate.getTime() - earlierDate.getTime();
  
  // Generate intermediate points
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const currentTime = earlierDate.getTime() + timeDiff * progress;
    const currentDate = new Date(currentTime);
    
    // Create a temporary event at this date
    const tempEvent = {
      ...startEvent,
      startDate: currentDate
    };
    
    // Get position for this date
    const position = getQuarterlyEventPosition(tempEvent, startYear, radius, heightPerLoop);
    points.push(position);
  }
  
  return points;
};
