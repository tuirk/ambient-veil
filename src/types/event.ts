
export interface TimeEvent {
  id: string;
  title: string;
  color: string;
  intensity: number; // 1-10
  startDate: Date;
  endDate?: Date; // Optional end date
  isFutureEvent?: boolean; // Flag for future events
}

export interface SpiralConfig {
  startYear: number;
  currentYear: number;
  zoom: number;
  centerX: number;
  centerY: number;
  yearDepth: number; // How many years to show based on zoom
}
