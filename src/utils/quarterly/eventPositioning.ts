
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Calculates the position for a single event on the quarterly spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical height per month loop
 * @returns 3D vector position for the event
 */
export const getQuarterlyEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  // Ensure we're not positioning events from before the start year incorrectly
  const effectiveDate = event.startDate.getFullYear() < startYear 
    ? new Date(startYear, 0, 1) // Use January 1st of the start year
    : event.startDate;
  
  const year = effectiveDate.getFullYear();
  const month = effectiveDate.getMonth();
  const day = effectiveDate.getDate();
  
  // Calculate total months from start year (important for vertical positioning)
  const yearOffset = year - startYear;
  const totalMonths = yearOffset * 12 + month;
  
  // Get days in this month for precise positioning
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate day progress within the month (0 to 1)
  const dayProgress = (day - 1) / daysInMonth;
  
  // Calculate angle based on position within the month
  // One complete circle (2π) now represents one month
  const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases as we move down the spiral
  // Must be consistent with the formula used in generateQuarterlySpiralPoints
  const currentRadius = radius + totalMonths * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalMonths * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
