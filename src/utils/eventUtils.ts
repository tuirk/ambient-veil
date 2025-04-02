import { TimeEvent } from "@/types/event";

/**
 * Helper function to determine if an event is actually a one-time event
 */
export const isOneTimeEvent = (event: TimeEvent): boolean => {
  // One-time events must have:
  // 1. A specific day (not just month/year or season)
  // 2. No end date
  
  // If explicitly typed as "one-time", trust that
  if (event.eventType === "one-time") return true;
  
  // Otherwise fallback to old logic for backward compatibility
  // If it has an end date, it's a process event
  if (event.endDate) return false;
  
  // If it's a rough date (seasonal), it's a process event
  if (event.isRoughDate) return false;
  
  // Check if the start date has a specific day (not just month/year)
  const startDate = event.startDate;
  const hasSpecificDay = startDate && startDate.getDate() > 0;
  
  // Only events with specific day + no end date are one-time
  return hasSpecificDay;
};

/**
 * Creates a standard date for an event from year and month
 */
export const createEventDate = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

/**
 * Check if a year/month is within the allowed time range
 */
export const isWithinAllowedTimeRange = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 5; // Limited to 5 years before current year
  const maxYear = currentYear + 1;
  
  return year >= minYear && year <= maxYear;
};
