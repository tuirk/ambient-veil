
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the daily spiral visualization
 * Each coil represents 1 day (one day of the week)
 * @param startDate The starting date (most recent Monday)
 * @param endDate The end date (today)
 * @param stepsPerLoop Number of points to use for each day loop
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each day loop
 * @returns Array of spiral points with position and date information
 */
export const generateDailySpiralPoints = (
  startDate: Date,
  endDate: Date,
  stepsPerLoop: number = 360,
  radius: number = 5,
  heightPerLoop: number = 1.5
): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
  
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Clone the dates to avoid modifying the originals
  const currentDate = new Date(startDate);
  const today = new Date(endDate);
  
  // Set both dates to midnight for consistent day comparison
  today.setHours(23, 59, 59, 999);
  
  // Loop through each day from start date to today
  let dayIndex = 0;
  while (currentDate <= today) {
    // Create points around the loop for this day
    for (let step = 0; step < stepsPerLoop; step++) {
      const progress = step / stepsPerLoop;
      
      // Calculate the hour within the day
      const hourProgress = progress * 24; // 0-24 progress within the day
      const hour = Math.floor(hourProgress);
      
      // Calculate the minute within the hour
      const minuteFraction = hourProgress - Math.floor(hourProgress);
      const minute = Math.floor(minuteFraction * 60);
      
      // If this point is after current time on the current day, don't render it
      const isCurrentDay = currentDate.getFullYear() === today.getFullYear() &&
                          currentDate.getMonth() === today.getMonth() &&
                          currentDate.getDate() === today.getDate();
      
      if (isCurrentDay) {
        const currentHour = new Date().getHours();
        const currentMinute = new Date().getMinutes();
        
        if (hour > currentHour || (hour === currentHour && minute > currentMinute)) {
          continue;
        }
      }
      
      // Calculate angle for this point in the spiral
      // The negative angle creates clockwise rotation
      const angleRad = -progress * Math.PI * 2 + Math.PI/2;
      
      // Apply consistent radius expansion formula
      const currentRadius = baseRadius + dayIndex * 0.5;
      
      // Position calculation with gradual height change
      const x = currentRadius * Math.cos(angleRad);
      const y = -dayIndex * heightPerLoop; // Negative for downward spiral
      const z = currentRadius * Math.sin(angleRad);
      
      // Extract date components
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const day = currentDate.getDate();
      
      points.push({ 
        position: new Vector3(x, y, z),
        year,
        month,
        day,
        hour,
        minute
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }

  return points;
};
