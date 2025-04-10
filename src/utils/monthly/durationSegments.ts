import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Generates points for visualizing event durations in the monthly spiral
 * 
 * This function handles events that start before the visible time range by
 * clamping the start date to the beginning of the visible period.
 * 
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
  segmentPoints: number = 50,
  radius: number = 5,
  heightPerLoop: number = 0.6
): Vector3[] => {
  // Get the effective start date - clamp to the start of the visible period if needed
  const effectiveStartDate = new Date(Math.max(
    startEvent.startDate.getTime(),
    new Date(startYear, 0, 1).getTime() // January 1st of startYear
  ));
  
  // Get the end date
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  
  // Calculate total days for the visible portion of the event
  const totalDays = Math.max(1, (endDate.getTime() - effectiveStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Scale points with duration, but keep a reasonable maximum
  const actualSegmentPoints = Math.min(300, Math.max(50, Math.floor(totalDays / 3))); // At least one point per 3 days
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(effectiveStartDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // More accurate day progress calculation
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    // Adjust for leap years
    if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
      daysInMonth[1] = 29;
    }
    
    const dayProgress = (day - 1) / daysInMonth[month];
    
    // Calculate total progress
    const yearOffset = year - startYear;
    const totalMonths = yearOffset * 12 + month;
    const totalProgress = totalMonths + dayProgress;
    
    // Calculate position
    const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
    const currentRadius = radius + totalProgress * 0.2;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
