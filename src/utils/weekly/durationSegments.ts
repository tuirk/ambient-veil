import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getSeasonMiddleDate } from "../seasonalUtils";

/**
 * Generates points for visualizing event durations in the weekly spiral
 * @param startEvent The event marking the start of the duration
 * @param endEvent The event marking the end of the duration
 * @param startDate First date of the spiral (for reference)
 * @param segmentPoints Requested number of points
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between day loops
 * @returns Array of 3D points forming a smooth line between events
 */
export const calculateWeeklySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startDate: Date,
  segmentPoints: number = 100,
  radius: number = 5,
  heightPerLoop: number = 0.7
): Vector3[] => {
  // Handle seasonal rough dates for start event
  let effectiveStartDate = startEvent.startDate;
  if (startEvent.isRoughDate && startEvent.roughDateSeason && startEvent.roughDateYear) {
    effectiveStartDate = getSeasonMiddleDate(startEvent.roughDateSeason, startEvent.roughDateYear);
  }
  
  // Handle seasonal rough dates for end event
  let endDate = endEvent.startDate || endEvent.endDate || effectiveStartDate;
  if (endEvent.isRoughDate && endEvent.roughDateSeason && endEvent.roughDateYear) {
    endDate = getSeasonMiddleDate(endEvent.roughDateSeason, endEvent.roughDateYear);
  }
  
  // Clamp start date to the start of the visible period if needed
  effectiveStartDate = new Date(Math.max(
    effectiveStartDate.getTime(),
    startDate.getTime()
  ));
  
  // Calculate total hours for the visible portion of the event (more precise for weekly view)
  const totalHours = Math.max(1, (endDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60));
  
  // Scale points with duration, but keep a reasonable maximum
  const actualSegmentPoints = Math.min(500, Math.max(50, Math.floor(totalHours / 4))); // More points for hourly precision
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(effectiveStartDate.getTime() + progress * totalHours * 60 * 60 * 1000);
    
    // Calculate days from start
    const dayOffset = (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Calculate progress within the day (0-1)
    const hourProgress = (currentDate.getHours() + currentDate.getMinutes() / 60) / 24;
    
    // Calculate angle based on position within the day
    const angleRad = -hourProgress * Math.PI * 2 + Math.PI/2;
    
    // The radius increases as we move down the spiral
    const currentRadius = radius + dayOffset * 0.08;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -dayOffset * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
