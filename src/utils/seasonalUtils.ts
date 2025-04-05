
/**
 * Utility functions for handling seasonal rough dates
 */
export interface SeasonalDateRange {
  startMonth: number; // 0-based month index (0 = January)
  endMonth: number;   // 0-based month index
}

/**
 * Mapping of seasons to their corresponding month ranges
 * Note: Winter is a special case as it spans across two years
 */
export const seasonalDateRanges: Record<string, SeasonalDateRange> = {
  Spring: { startMonth: 2, endMonth: 4 }, // March–May
  Summer: { startMonth: 5, endMonth: 7 }, // June–August
  Fall:   { startMonth: 8, endMonth: 10 }, // September–November
  Winter: { startMonth: 11, endMonth: 1 }, // December–February (spans two years)
};

/**
 * Seasons for selection in the UI
 */
export const SEASONS = ["Spring", "Summer", "Fall", "Winter"];

/**
 * Converts a seasonal rough date to a date range with start and end dates
 * @param season The season (Spring, Summer, Fall, Winter)
 * @param year The year
 * @returns Object with start and end dates
 */
export function getSeasonalDateRange(season: string, year: number): { startDate: Date, endDate: Date } {
  const range = seasonalDateRanges[season];
  
  if (!range) {
    throw new Error(`Invalid season: ${season}`);
  }
  
  let startYear = year;
  let endYear = year;
  
  // Handle winter special case (spans two years)
  if (season === "Winter" && range.startMonth > range.endMonth) {
    endYear = year + 1;
  }
  
  const startDate = new Date(startYear, range.startMonth, 1);
  
  // Set end date to last day of the end month
  const endDate = new Date(endYear, range.endMonth + 1, 0);
  
  return { startDate, endDate };
}

/**
 * Get a date in the middle of the specified season
 * Used for positioning events with rough seasonal dates
 * @param season The season (Spring, Summer, Fall, Winter)
 * @param year The year
 * @returns A Date object representing the middle of the season
 */
export function getSeasonMiddleDate(season: string, year: number): Date {
  const range = seasonalDateRanges[season];
  
  if (!range) {
    throw new Error(`Invalid season: ${season}`);
  }
  
  let startYear = year;
  let endYear = year;
  
  // Handle winter special case (spans two years)
  if (season === "Winter" && range.startMonth > range.endMonth) {
    endYear = year + 1;
  }
  
  // Calculate middle month
  let middleMonth: number;
  
  if (season === "Winter" && range.startMonth > range.endMonth) {
    // For winter (Dec-Feb), calculate middle differently since it spans years
    // December + (January + February)/2 as middle
    middleMonth = range.startMonth + 1;
    if (middleMonth > 11) {
      middleMonth = 0; // January of next year
      year = endYear;
    }
  } else {
    // For other seasons, simple middle calculation
    middleMonth = Math.floor((range.startMonth + range.endMonth) / 2);
  }
  
  // Create date at middle of the middle month
  const daysInMonth = new Date(year, middleMonth + 1, 0).getDate();
  const middleDay = Math.floor(daysInMonth / 2);
  
  return new Date(year, middleMonth, middleDay);
}

/**
 * Determines if a given event is a seasonal rough date
 * @param event The event to check
 * @returns True if the event is a seasonal rough date
 */
export function isSeasonalEvent(event: { isRoughDate?: boolean }): boolean {
  return !!event.isRoughDate;
}

/**
 * All seasonal events should be treated as process events
 * even if they don't have an explicit end date
 * @param event The event to check
 * @returns True as seasonal events are always process events
 */
export function isSeasonalProcessEvent(event: { isRoughDate?: boolean }): boolean {
  return isSeasonalEvent(event);
}
