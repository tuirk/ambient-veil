
import { SpiralConfig } from "@/types/event";

interface EventHandlerProps {
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

export const useEventHandler = ({ config, onSpiralClick }: EventHandlerProps) => {
  const handleCanvasClick = (event: any) => {
    // Only process clicks on the background, not on events
    if (!event.object) {
      const { point } = event;
      
      // Convert 3D point to year and month
      // We need to reverse engineer the spiral formula
      const radius = Math.sqrt(point.x * point.x + point.z * point.z);
      const yearIndex = Math.floor((radius - (5 * config.zoom)) / 0.5 + point.y / (-1.5 * config.zoom));
      const year = config.startYear + yearIndex;
      
      // Calculate angle from center (0,0)
      let angle = Math.atan2(point.z, point.x);
      if (angle < 0) angle += 2 * Math.PI;
      
      // Adjust to have January at 12 o'clock
      angle = (angle + Math.PI/2) % (2 * Math.PI);
      
      // Convert angle to month (0-11)
      const month = Math.floor((angle / (2 * Math.PI)) * 12);
      
      onSpiralClick(year, month, point.x, point.z);
    }
  };
  
  return { handleCanvasClick };
};
