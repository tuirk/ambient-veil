
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the weekly spiral visualization
 * Each coil represents 1 day, with 7 coils making a week
 * @param startDate The first date to display in the spiral
 * @param endDate The last date to display in the spiral
 * @param stepsPerLoop Number of points to use for each day loop
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between day loops
 * @returns Array of spiral points with position and date information
 */
export const generateWeeklySpiralPoints = (
  startDate: Date,
  endDate: Date,
  stepsPerLoop: number = 120, // Fewer steps per day loop
  radius: number = 5,
  heightPerLoop: number = 0.7 // Smaller height change per day
): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
  
  // Get current date to limit the spiral to today
  const now = new Date();
  
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Calculate total days between start and end (or today if earlier)
  const endTime = Math.min(endDate.getTime(), now.getTime());
  const totalDaysSpan = Math.ceil((endTime - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create a date object we'll increment
  const currentDate = new Date(startDate);
  
  // Generate points for each day in range
  for (let dayOffset = 0; dayOffset <= totalDaysSpan; dayOffset++) {
    // Set the current date
    currentDate.setTime(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    const dayOfWeek = currentDate.getDay(); // 0-6 (Sunday-Saturday)
    
    // Create points around the loop for this day
    for (let step = 0; step < stepsPerLoop; step++) {
      const progress = step / stepsPerLoop;
      
      // Calculate hour within the day (0-23)
      const hourProgress = progress * 24;
      const hour = Math.floor(hourProgress);
      
      // Skip future hours if we're on today's date
      if (currentDate.getFullYear() === now.getFullYear() &&
          currentDate.getMonth() === now.getMonth() &&
          currentDate.getDate() === now.getDate() &&
          hour > now.getHours()) {
        continue;
      }
      
      // Calculate angle for this point in the spiral
      // The negative angle creates clockwise rotation
      const angleRad = -progress * Math.PI * 2 + Math.PI/2;
      
      // Calculate the radius - smaller radius increase for weekly view
      const currentRadius = baseRadius + dayOffset * 0.08;
      
      // Position calculation with gradual height change
      const x = currentRadius * Math.cos(angleRad);
      const y = -dayOffset * heightPerLoop; // Negative for downward spiral
      const z = currentRadius * Math.sin(angleRad);
      
      // Store additional hour information for event positioning
      points.push({ 
        position: new Vector3(x, y, z),
        year,
        month,
        day,
        hour
      });
    }
  }

  return points;
};
