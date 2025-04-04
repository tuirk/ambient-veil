
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

export interface MiniSpiralPoint {
  position: Vector3;
  year: number;
  month: number;
  day: number;
}

/**
 * Generates points for the mini spiral visualization with each coil representing 2 months
 * @param startYear The first year to display (Jan 1st of current year)
 * @param currentYear The latest year (current date)
 * @param stepsPerCoil Number of points to use for each 2-month coil
 * @param radius Base radius of the spiral
 * @param heightPerCoil Vertical distance between each coil
 * @returns Array of spiral points with position and date information
 */
export const generateMiniSpiralPoints = (
  startYear: number,
  currentYear: number,
  stepsPerCoil: number = 180,
  radius: number = 5,
  heightPerCoil: number = 1.2
): MiniSpiralPoint[] => {
  const points: MiniSpiralPoint[] = [];
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Current date
  const currentDate = new Date();
  const startDate = new Date(startYear, 0, 1); // January 1st of the current year
  
  // Calculate total months from start to today
  const monthDiff = (currentDate.getFullYear() - startDate.getFullYear()) * 12 + 
                    currentDate.getMonth() - startDate.getMonth() + 
                    (currentDate.getDate() / 30); // Add partial month progress
  
  // Each coil represents 2 months
  const totalCoils = monthDiff / 2;
  
  // Generate points for the mini spiral
  for (let coilIndex = 0; coilIndex <= Math.ceil(totalCoils); coilIndex++) {
    // Calculate month range for this coil
    const coilStartMonth = coilIndex * 2;
    const monthsFromStart = coilStartMonth;
    
    // Calculate the year and month for this coil's start
    const coilYear = startYear + Math.floor(monthsFromStart / 12);
    const coilMonth = monthsFromStart % 12;
    
    // Skip if this coil is beyond the current date
    if (coilYear > todayYear || (coilYear === todayYear && coilMonth > todayMonth)) {
      continue;
    }
    
    // For the last coil (current month), only generate points up to today
    const isCurrentMonthCoil = coilYear === todayYear && 
                             Math.floor(coilMonth / 2) * 2 === Math.floor(todayMonth / 2) * 2;
    
    const stepsForThisCoil = isCurrentMonthCoil 
      ? Math.floor((todayDay / 30) * stepsPerCoil)
      : stepsPerCoil;
    
    // Create points around the coil
    for (let step = 0; step < stepsForThisCoil; step++) {
      // Progress within this 2-month coil (0 to 1)
      const coilProgress = step / stepsPerCoil;
      
      // Calculate which day this represents
      const dayProgress = coilProgress * 60; // ~60 days in 2 months
      
      // Calculate the precise date
      const pointDate = new Date(coilYear, coilMonth, 1 + Math.floor(dayProgress));
      const pointDay = 1 + Math.floor(dayProgress);
      
      // If this date exceeds today, stop generating points
      if (pointDate > currentDate) {
        break;
      }
      
      // Calculate angle in radians with proper offset
      // Negative angle for clockwise rotation, offset for positioning
      const angleRad = -coilProgress * Math.PI * 2 + Math.PI/2;
      
      // Apply consistent radius expansion formula for smooth spiral
      const currentRadius = baseRadius + coilIndex * 0.4;
      
      // Position calculation with gradual height change
      const x = currentRadius * Math.cos(angleRad);
      const y = -coilIndex * heightPerCoil; // Negative for downward spiral
      const z = currentRadius * Math.sin(angleRad);
      
      points.push({ 
        position: new Vector3(x, y, z),
        year: coilYear,
        month: coilMonth,
        day: pointDay
      });
    }
  }

  return points;
};

/**
 * Calculates the position for a single event on the mini spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerCoil Vertical distance between coils
 * @returns 3D vector position for the event
 */
export const getMiniEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerCoil: number = 1.2
): Vector3 => {
  const year = event.startDate.getFullYear();
  const month = event.startDate.getMonth();
  const day = event.startDate.getDate();
  
  // Get the total months from the start date
  const startDate = new Date(startYear, 0, 1);
  const monthsSinceStart = (year - startYear) * 12 + month;
  
  // Calculate which coil this event falls on (each coil is 2 months)
  const coilIndex = Math.floor(monthsSinceStart / 2);
  
  // Calculate the progress within this coil (0-1)
  const monthInCoil = month % 2;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const coilProgress = monthInCoil / 2 + day / (daysInMonth * 2);
  
  // Calculate angle consistently with generateMiniSpiralPoints
  const angleRad = -coilProgress * Math.PI * 2 + Math.PI/2;
  
  // Use the same radius formula as in generateMiniSpiralPoints
  const currentRadius = radius + coilIndex * 0.4;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -coilIndex * heightPerCoil;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};
