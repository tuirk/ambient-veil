
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getSeasonMiddleDate } from "../seasonalUtils";

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
  // Handle seasonal dates by converting them to specific dates
  // This ensures "Summer 2025" is positioned in the middle of summer
  let effectiveDate: Date;
  
  if (event.isRoughDate && event.roughDateSeason) {
    effectiveDate = getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear || event.startDate.getFullYear());
  } else {
    // Use the event's start date
    effectiveDate = event.startDate;
  }
  
  // Ensure we're not positioning events from before the start year incorrectly
  if (effectiveDate.getFullYear() < startYear) {
    effectiveDate = new Date(startYear, 0, 1); // Use January 1st of the start year
  }
  
  const year = effectiveDate.getFullYear();
  const month = effectiveDate.getMonth();
  const day = effectiveDate.getDate();
  
  // Calculate which quarter this month belongs to (0-3)
  const quarter = Math.floor(month / 3);
  
  // Calculate which month within the quarter (0-2)
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
  const quarterProgress = (monthInQuarter + dayProgress) / 3;
  
  // Calculate total progress in quarter-loops
  const yearOffset = year - startYear;
  const totalQuarters = yearOffset * 4 + quarter;
  const totalProgress = totalQuarters + quarterProgress;
  
  // Calculate angle based on position within the quarter
  // One complete circle (2π) represents one quarter
  const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases as we move down the spiral
  // Must match the formula used in generateQuarterlySpiralPoints
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
