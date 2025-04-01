
import { TimeEvent } from "@/types/event";

const EVENTS_STORAGE_KEY = "youAreHere_events";
const CONFIG_STORAGE_KEY = "youAreHere_config";

export const saveEvents = (events: TimeEvent[]): void => {
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
};

export const getEvents = (): TimeEvent[] => {
  const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
  if (!storedEvents) return [];
  
  try {
    const parsed = JSON.parse(storedEvents);
    // Convert string dates back to Date objects
    return parsed.map((event: any) => ({
      ...event,
      startDate: new Date(event.startDate),
      endDate: event.endDate ? new Date(event.endDate) : undefined
    }));
  } catch (e) {
    console.error("Failed to parse stored events:", e);
    return [];
  }
};

export const saveConfig = (startYear: number): void => {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify({ startYear }));
};

export const getConfig = (): { startYear: number } => {
  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) {
    // Default to 5 years ago, but ensure it's within 10 years of current year
    const currentYear = new Date().getFullYear();
    const defaultStartYear = Math.max(currentYear - 10, currentYear - 5);
    return { startYear: defaultStartYear };
  }
  
  try {
    const config = JSON.parse(storedConfig);
    
    // Ensure startYear is within 10 years of current year
    const currentYear = new Date().getFullYear();
    if (currentYear - config.startYear > 10) {
      config.startYear = currentYear - 10;
    }
    
    return config;
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    
    // Default to 5 years ago, but ensure it's within 10 years of current year
    const currentYear = new Date().getFullYear();
    const defaultStartYear = Math.max(currentYear - 10, currentYear - 5);
    return { startYear: defaultStartYear };
  }
};
