
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

/**
 * Calculate the position for an event on the daily spiral
 * @param event The event to position
 * @param startDate The start date of the spiral (most recent Monday)
 * @param baseRadius Base radius of the spiral
 * @param heightPerLoop Height between loops
 * @returns A Vector3 position for the event
 */
export const getDailyEventPosition = (
  event: TimeEvent,
  startDate: Date,
  baseRadius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  const eventDate = new Date(event.startDate);
  const start = new Date(startDate);
  
  // Calculate days since start date
  const timeDiff = eventDate.getTime() - start.getTime();
  const daysSinceStart = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  
  // If the event is before the start date, return a position outside the visible area
  if (daysSinceStart < 0) {
    return new Vector3(-100, -100, -100);
  }
  
  // Get time of day as a fraction (0-1)
  const hours = eventDate.getHours();
  const minutes = eventDate.getMinutes();
  const timeOfDay = (hours + minutes / 60) / 24;
  
  // Calculate the angle based on time of day (0-360 degrees)
  // The negative angle creates clockwise rotation
  const angleRad = -timeOfDay * Math.PI * 2 + Math.PI/2;
  
  // Calculate radius with consistent expansion
  const radius = baseRadius + daysSinceStart * 0.5;
  
  // Calculate the position
  const x = radius * Math.cos(angleRad);
  const y = -daysSinceStart * heightPerLoop; // Negative for downward spiral
  const z = radius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
