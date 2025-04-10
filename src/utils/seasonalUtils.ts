
/**
 * Utility functions for handling seasonal dates
 */

/**
 * Gets the middle date of a season in a given year
 * @param season The season name (Spring, Summer, Fall, Winter)
 * @param year The year
 * @returns A date object representing the middle of the specified season
 */
export const getSeasonMiddleDate = (season: string, year: number): Date => {
  switch (season.toLowerCase()) {
    case 'spring':
      return new Date(year, 3, 15); // April 15th
    case 'summer':
      return new Date(year, 6, 15); // July 15th
    case 'fall':
    case 'autumn':
      return new Date(year, 9, 15); // October 15th
    case 'winter':
      return new Date(year, 0, 15); // January 15th (northern hemisphere)
    default:
      return new Date(year, 6, 1); // Default to mid-year
  }
};

/**
 * Converts a month number (0-11) to a season
 * @param month Month number (0-11)
 * @returns Season name
 */
export const monthToSeason = (month: number): string => {
  // Northern hemisphere seasons
  if (month >= 2 && month <= 4) return "Spring"; // March-May
  if (month >= 5 && month <= 7) return "Summer"; // June-August
  if (month >= 8 && month <= 10) return "Fall";  // September-November
  return "Winter"; // December-February
};

/**
 * Gets the start date of a season in a given year
 * @param season The season name
 * @param year The year
 * @returns A date object representing the start of the specified season
 */
export const getSeasonStartDate = (season: string, year: number): Date => {
  switch (season.toLowerCase()) {
    case 'spring':
      return new Date(year, 2, 20); // March 20th
    case 'summer':
      return new Date(year, 5, 21); // June 21st
    case 'fall':
    case 'autumn':
      return new Date(year, 8, 22); // September 22nd
    case 'winter':
      return new Date(year, 11, 21); // December 21st
    default:
      return new Date(year, 0, 1); // Default to start of year
  }
};
