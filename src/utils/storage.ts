
import { TimeEvent, SpiralConfig } from "@/types/event";

const EVENTS_STORAGE_KEY = "youAreHere_events";
const CONFIG_STORAGE_KEY = "youAreHere_config";
const FIRST_TIME_KEY = "youAreHere_firstTime";

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

export const saveConfig = (config: Partial<SpiralConfig>): void => {
  // Get existing config to merge with new values
  const existingConfig = getConfig();
  const updatedConfig = { ...existingConfig, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
};

export const getConfig = (): SpiralConfig => {
  const currentYear = new Date().getFullYear();
  const defaultConfig: SpiralConfig = {
    startYear: currentYear - 5,
    currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  };
  
  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;
  
  try {
    return { ...defaultConfig, ...JSON.parse(storedConfig) };
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return defaultConfig;
  }
};

export const isFirstTimeUser = (): boolean => {
  return localStorage.getItem(FIRST_TIME_KEY) !== "false";
};

export const setFirstTimeStatus = (isFirstTime: boolean): void => {
  localStorage.setItem(FIRST_TIME_KEY, isFirstTime ? "true" : "false");
};

