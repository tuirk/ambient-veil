
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Calculates the position for a single event on the quarterly spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between quarter loops
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
  
  // Calculate quarter (0, 1, 2, 3) and progress within quarter
  const quarter = Math.floor(month / 3);
  const monthInQuarter = month % 3;
  
  // More accurate calculation of progress within the quarter
  // This now properly accounts for days within the month
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Adjust for leap years
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }
  
  // Calculate more accurate progress within quarter
  const dayProgress = (day - 1) / daysInMonth[month];
  const quarterProgress = (monthInQuarter + dayProgress) / 3;
  
  // Calculate total progress (in terms of quarter loops)
  const yearOffset = year - startYear;
  const totalProgress = yearOffset * 4 + quarter + quarterProgress;
  
  // Calculate angle - now more accurately reflecting the day position
  const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
  
  // Use the same radius formula
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
