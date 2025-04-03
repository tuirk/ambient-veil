export interface TimeEvent {
  id: string;
  title: string;
  color: string;
  intensity: number; // 1-10
  startDate: Date;
  endDate?: Date; // Optional end date for process events
  dayOfYear?: number; // Optional day of year for more precise positioning
  isRoughDate?: boolean; // Indicates if this is a seasonal rough date
  roughDateSeason?: string; // The season (Spring, Summer, Fall, Winter)
  roughDateYear?: number; // The year for the rough date
  eventType: "one-time" | "process"; // Explicit event type to differentiate visualization
  mood?: Mood; // The mood associated with this event
  description?: string; // Optional description of the event
}

export interface SpiralConfig {
  startYear: number;
  currentYear: number;
  zoom: number;
  centerX: number;
  centerY: number;
}

export interface Mood {
  name: string;
  color: string;
  isCustom?: boolean;
}

export const PRESET_MOODS: Mood[] = [
  { name: "Happy", color: "#FFB86B" },      // Joyful, light, present
  { name: "Hopeful", color: "#A3E8FF" },    // Looking forward, optimistic
  { name: "Energized", color: "#FF5E5B" },  // Driven, focused, full of spark
  { name: "Neutral", color: "#B5B5C0" },    // No strong feeling, in-between
  { name: "Drained", color: "#6C6C8B" },    // Tired, depleted
  { name: "Overwhelmed", color: "#9C5DC0" }, // Too much, overstimulated
  { name: "Sad", color: "#444654" }         // Low, moody, emotionally heavy
];
