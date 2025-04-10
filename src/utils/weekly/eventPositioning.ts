
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getSeasonMiddleDate } from "../seasonalUtils";

/**
 * Calculates milliseconds between two dates
 */
const daysBetween = (start: Date, end: Date): number => {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
};

/**
 * Calculates the position for a single event on the weekly spiral
 * @param event The event to position
 * @param startDate First date of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between day loops
 * @returns 3D vector position for the event
 */
export const getWeeklyEventPosition = (
  event: TimeEvent,
  startDate: Date,
  radius: number = 5,
  heightPerLoop: number = 0.7
): Vector3 => {
  // Handle seasonal rough dates
  let effectiveDate = event.startDate;
  
  // If this is a rough seasonal date, convert to a specific date
  if (event.isRoughDate && event.roughDateSeason && event.roughDateYear) {
    effectiveDate = getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear);
  }
  
  // Ensure we're not positioning events from before the start date incorrectly
  if (effectiveDate < startDate) {
    effectiveDate = new Date(startDate);
  }
  
  // Calculate total days from start date
  const dayOffset = daysBetween(startDate, effectiveDate);
  
  // Get hour of day for more precise positioning (default to noon if not available)
  const hours = effectiveDate.getHours();
  const minutes = effectiveDate.getMinutes();
  
  // Calculate progress within the day (0 to 1)
  const hourProgress = (hours + minutes / 60) / 24;
  
  // Calculate angle based on position within the day
  // One complete circle (2π) represents one day
  const angleRad = -hourProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases slightly as we move down the spiral
  const currentRadius = radius + dayOffset * 0.08;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -dayOffset * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
