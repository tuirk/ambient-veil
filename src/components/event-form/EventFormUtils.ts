
import { TimeEvent } from "@/types/event";
import { v4 as uuidv4 } from "uuid";
import { getSeasonalDateRange } from "@/utils/seasonalUtils";
import { daysInMonth } from "./constants";

export const validateDateRanges = (
  dateLength: "ONE_DAY" | "SPAN",
  spanType: "SEASONAL" | "EXACT",
  singleYear: number, 
  singleMonth: number, 
  singleDay: number,
  seasonYear: number,
  spanStartYear: number,
  startMonth: number,
  startDay: number,
  endYear: number,
  endMonth: number,
  endDay: number,
  specifyDays: boolean,
  minYear: number,
  maxYear: number
): { isValid: boolean, errorTitle?: string, errorDescription?: string } => {
  if (dateLength === "ONE_DAY") {
    const eventDate = new Date(singleYear, singleMonth, singleDay);
    const minDate = new Date(minYear, 0, 1);
    const maxDate = new Date(maxYear, 11, 31);
    
    if (eventDate < minDate || eventDate > maxDate) {
      return {
        isValid: false,
        errorTitle: "Invalid Date",
        errorDescription: `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`
      };
    }
  } else if (dateLength === "SPAN") {
    if (spanType === "SEASONAL") {
      if (seasonYear < minYear || seasonYear > maxYear) {
        return {
          isValid: false,
          errorTitle: "Invalid Year",
          errorDescription: `Year must be between ${minYear} and ${maxYear}`
        };
      }
    } else {
      // Validate exact span dates
      const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1);
      const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
      const minDate = new Date(minYear, 0, 1);
      const maxDate = new Date(maxYear, 11, 31);
      
      if (startDate < minDate || startDate > maxDate || endDate < minDate || endDate > maxDate) {
        return {
          isValid: false,
          errorTitle: "Invalid Date Range",
          errorDescription: `Dates must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`
        };
      }
      
      if (endDate < startDate) {
        return {
          isValid: false,
          errorTitle: "Invalid Date Range",
          errorDescription: "End date cannot be before start date"
        };
      }
    }
  }
  
  return { isValid: true };
};

export const createEventObject = (
  dateLength: "ONE_DAY" | "SPAN",
  spanType: "SEASONAL" | "EXACT",
  title: string,
  selectedColor: string,
  intensity: number,
  singleYear: number,
  singleMonth: number,
  singleDay: number,
  seasonYear: number,
  season: string,
  spanStartYear: number,
  startMonth: number,
  startDay: number,
  endYear: number,
  endMonth: number,
  endDay: number,
  specifyDays: boolean
): TimeEvent => {
  let newEvent: TimeEvent;

  if (dateLength === "ONE_DAY") {
    // Create a one-time event with a specific day
    newEvent = {
      id: uuidv4(),
      title,
      color: selectedColor,
      intensity,
      startDate: new Date(singleYear, singleMonth, singleDay),
      eventType: "one-time"
    };
  } else if (dateLength === "SPAN") {
    if (spanType === "SEASONAL") {
      // Create a seasonal event
      const { startDate, endDate } = getSeasonalDateRange(season, seasonYear);
      
      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate,
        endDate,
        isRoughDate: true,
        roughDateSeason: season,
        roughDateYear: seasonYear,
        eventType: "process"
      };
    } else {
      // Create an exact process event
      const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1);
      const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
      
      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate,
        endDate,
        eventType: "process"
      };
    }
  }

  return newEvent;
};
