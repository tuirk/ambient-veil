
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { getSeasonMiddleDate } from "../seasonalUtils";

/**
 * Calculates the position for a single event on the monthly spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between month loops
 * @returns 3D vector position for the event
 */
export const getMonthlyEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  // Handle seasonal rough dates
  let effectiveDate = event.startDate;
  
  // If this is a rough seasonal date, convert to a specific date
  if (event.isRoughDate && event.roughDateSeason && event.roughDateYear) {
    effectiveDate = getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear);
  }
  
  // Ensure we're not positioning events from before the start year incorrectly
  if (effectiveDate.getFullYear() < startYear) {
    effectiveDate = new Date(startYear, 0, 1); // Use January 1st of the start year
  }
  
  const year = effectiveDate.getFullYear();
  const month = effectiveDate.getMonth();
  const day = effectiveDate.getDate();
  
  // Calculate days in this month for more accurate positioning
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Calculate progress within the month (0 to 1)
  const dayProgress = (day - 1) / daysInMonth;
  
  // Calculate total progress in month-loops
  const yearOffset = year - startYear;
  const totalMonths = yearOffset * 12 + month;
  const totalProgress = totalMonths + dayProgress;
  
  // Calculate angle based on position within the month
  // One complete circle (2π) represents one month
  const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
  
  // The radius increases as we move down the spiral
  const currentRadius = radius + totalProgress * 0.2;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
