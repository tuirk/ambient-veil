
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the monthly spiral visualization
 * Each coil represents 1 month (30/31 days)
 * @param startYear The first year to display in the spiral
 * @param currentYear The latest year to display in the spiral
 * @param stepsPerLoop Number of points to use for each month loop
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each month loop
 * @returns Array of spiral points with position and date information
 */
export const generateMonthlySpiralPoints = (
  startYear: number,
  currentYear: number,
  stepsPerLoop: number = 360,
  radius: number = 5,
  heightPerLoop: number = 1.5
): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
  
  // Get current date to limit the spiral to today
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  
  // Number of years to render
  const yearSpan = currentYear - startYear + 1;
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Generate points for each year in range
  for (let yearOffset = 0; yearOffset < yearSpan; yearOffset++) {
    const year = startYear + yearOffset;
    
    // For current year, determine how many months to show based on today's date
    const numberOfMonths = (year === todayYear) 
      ? todayMonth + 1 // Only render months up to the current one
      : 12; // All months for past years
    
    // Create monthly coils (12 coils per year, 1 month per coil)
    for (let month = 0; month < numberOfMonths; month++) {
      // For the current month of the current year, only show days up to today
      const isCurrentMonth = (year === todayYear && month === todayMonth);
      
      // Steps for this month
      const stepsThisMonth = stepsPerLoop;
      
      // Calculate days in this month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Create points around the loop for this month
      for (let step = 0; step < stepsThisMonth; step++) {
        const progress = step / stepsPerLoop;
        
        // Calculate the day within the month
        const dayProgress = progress * daysInMonth;
        const day = Math.floor(dayProgress) + 1;
        
        // Skip points after today's date in the current month
        if (isCurrentMonth && day > todayDay) continue;
        
        // Calculate angle for this point in the spiral
        // The negative angle creates clockwise rotation
        const angleRad = -progress * Math.PI * 2 + Math.PI/2;
        
        // Calculate the total progress through all months
        const totalMonths = yearOffset * 12 + month;
        const totalProgress = totalMonths + progress;
        
        // Apply radius expansion formula
        const currentRadius = baseRadius + totalProgress * 0.2;
        
        // Position calculation with gradual height change
        const x = currentRadius * Math.cos(angleRad);
        const y = -totalProgress * heightPerLoop; // Negative for downward spiral
        const z = currentRadius * Math.sin(angleRad);
        
        points.push({ 
          position: new Vector3(x, y, z),
          year,
          month,
          day
        });
      }
    }
  }

  return points;
};
