
export interface TimeEvent {
  id: string;
  title: string;
  color: string;
  intensity: number; // 1-10
  startDate: Date;
  endDate?: Date; // Optional end date
  dayOfYear?: number; // Optional day of year for more precise positioning
  isRoughDate?: boolean; // Indicates if this is a seasonal rough date
  roughDateSeason?: string; // The season (Spring, Summer, Fall, Winter)
  roughDateYear?: number; // The year for the rough date
}

export interface SpiralConfig {
  startYear: number;
  currentYear: number;
  zoom: number;
  centerX: number;
  centerY: number;
}

// New interface for dust particles
export interface DustParticle {
  position: [number, number, number]; // x, y, z coordinates
  color: string;
  size: number;
  velocity: [number, number, number]; // For animation
  lifespan: number; // For fade effects
}
