
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
  // Always ensure startYear is fixed to 5 years before current year
  const currentYear = new Date().getFullYear();
  const updatedConfig = { 
    ...existingConfig, 
    ...config,
    startYear: currentYear - 5 // Always enforce this constraint
  };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
};

export const getConfig = (): SpiralConfig => {
  const currentYear = new Date().getFullYear();
  const defaultConfig: SpiralConfig = {
    startYear: currentYear - 5, // Always 5 years before current year
    currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  };
  
  const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
  if (!storedConfig) return defaultConfig;
  
  try {
    // Ensure startYear is always enforced
    const parsedConfig = JSON.parse(storedConfig);
    return { 
      ...defaultConfig, 
      ...parsedConfig,
      startYear: currentYear - 5 // Always enforce this constraint
    };
  } catch (e) {
    console.error("Failed to parse stored config:", e);
    return defaultConfig;
  }
};
