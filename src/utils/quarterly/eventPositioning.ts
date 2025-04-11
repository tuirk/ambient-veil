
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Calculates the position for a single event on the quarterly spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between month loops
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
  const month = effectiveDate.getMonth(); // 0-11
  const day = effectiveDate.getDate(); // 1-31
  
  // Calculate daysInMonth for more precise positioning
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Adjust for leap years
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }
  
  // Normalize the day position within the month (0 to 1)
  const dayProgress = (day - 1) / daysInMonth[month];
  
  // Calculate total progress in month-loops
  const yearOffset = year - startYear;
  const totalMonths = yearOffset * 12 + month; // Total months since start year
  const totalProgress = totalMonths + dayProgress; // Total progress including day within month
  
  // Calculate angle based on position within the month
  // One complete circle (2π) represents one month
  const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases slightly as we move down the spiral
  // Must match the formula used in generateQuarterlySpiralPoints
  const currentRadius = radius + totalProgress * 0.15;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
