
import { TimeEvent, SpiralConfig } from "@/types/event";

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

export const saveConfig = (config: Partial<SpiralConfig>): void => {
  // Get existing config first
  const existingConfig = getConfig();
  // Merge with new values
  const updatedConfig = { ...existingConfig, ...config };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
};

export const getConfig = (): SpiralConfig => {
  const currentYear = new Date().getFullYear();
  const defaultConfig: SpiralConfig = { 
    startYear: currentYear - 5,
    currentYear: currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    yearDepth: 3
  };
  
  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;
  
  try {
    const parsedConfig = JSON.parse(storedConfig);
    return { ...defaultConfig, ...parsedConfig };
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return defaultConfig;
  }
};
