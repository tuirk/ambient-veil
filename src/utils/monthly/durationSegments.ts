import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getSeasonMiddleDate } from "../seasonalUtils";

/**
 * Generates points for visualizing event durations in the monthly spiral
 * @param startEvent The event marking the start of the duration
 * @param endEvent The event marking the end of the duration
 * @param startYear First year of the spiral (for reference)
 * @param segmentPoints Requested number of points
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between month loops
 * @returns Array of 3D points forming a smooth line between events
 */
export const calculateMonthlySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  segmentPoints: number = 100,
  radius: number = 5,
  heightPerLoop: number = 1.5
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
    new Date(startYear, 0, 1).getTime() // January 1st of startYear
  ));
  
  // Calculate total days for the visible portion of the event
  const totalDays = Math.max(1, (endDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Scale points with duration, but keep a reasonable maximum
  const actualSegmentPoints = Math.min(500, Math.max(100, Math.floor(totalDays / 3))); // More points for monthly view
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(effectiveStartDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Calculate days in this month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate progress within the month (0 to 1)
    const dayProgress = (day - 1) / daysInMonth;
    
    // Calculate total progress in month-loops
    const yearOffset = year - startYear;
    const totalMonths = yearOffset * 12 + month;
    const totalProgress = totalMonths + dayProgress;
    
    // Calculate angle based on position within the month
    const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
    
    // The radius increases as we move down the spiral
    const currentRadius = radius + totalProgress * 0.2;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
