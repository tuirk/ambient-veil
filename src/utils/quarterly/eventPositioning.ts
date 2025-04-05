
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
  
  // Fix: Calculate quarter and month position more accurately
  // Each quarter takes up one full loop (0 to 2π)
  // Each month within the quarter takes up 1/3 of the loop
  const monthInQuarter = month % 3;
  
  // Calculate days in the month for more precise positioning
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Adjust for leap years
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }
  
  // Normalize the day position within the month (0 to 1)
  const dayProgress = (day - 1) / daysInMonth[month];
  
  // Calculate position within the quarter (0 to 1)
  // This is critical for correct positioning
  // Each month in the quarter takes up 1/3 of the coil
  const quarterProgress = (monthInQuarter + dayProgress) / 3;
  
  // Calculate total progress in quarter-loops
  const yearOffset = year - startYear;
  const totalProgress = yearOffset * 4 + quarter + quarterProgress;
  
  // Fix: Calculate angle correctly for quarterly view
  // The quarterly spiral uses different angle calculations than the annual spiral
  // In quarterly spiral, one complete coil = one quarter (not one year)
  // Each quarter starts at the same position in its loop
  
  // Fix: angle now correctly represents position within the quarter
  // Subtract from PI/2 to position January, April, July, October at the top
  const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases as we move down the spiral
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
