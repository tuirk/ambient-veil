
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
      endDate: event.endDate ? new Date(event.endDate) : undefined,
      dayOfYear: event.dayOfYear || undefined
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
  if (!storedConfig) return { startYear: new Date().getFullYear() - 5 }; // Default to 5 years ago
  
  try {
    return JSON.parse(storedConfig);
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return { startYear: new Date().getFullYear() - 5 };
  }
};
