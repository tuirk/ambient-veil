
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the quarterly spiral visualization
 * Each coil represents 1 month for better detail in the current year
 * @param startYear The first year to display in the spiral
 * @param currentYear The latest year to display in the spiral
 * @param stepsPerLoop Number of points to use for each month loop
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each month loop
 * @returns Array of spiral points with position and date information
 */
export const generateQuarterlySpiralPoints = (
  startYear: number,
  currentYear: number,
  stepsPerLoop: number = 180,
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
    const monthsToShow = (year === todayYear) 
      ? todayMonth + 1 // Only render months up to the current one
      : 12; // All months for past years
    
    // Create monthly coils (12 coils per year)
    for (let month = 0; month < monthsToShow; month++) {
      // Calculate the days in this month
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      // Adjust for leap years
      const daysThisMonth = (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) 
        ? 29 // February in leap year
        : daysInMonth;
      
      // For the current month of the current year, only show days up to today
      const isCurrentMonth = (year === todayYear && month === todayMonth);
      const daysToShow = isCurrentMonth ? todayDay : daysThisMonth;
      
      // Steps for this month - proportional to days in month
      const stepsThisMonth = Math.max(60, Math.floor(stepsPerLoop * (daysToShow / 31)));
      
      // Create points around the loop for this month
      for (let step = 0; step < stepsThisMonth; step++) {
        const dayProgress = step / stepsThisMonth;
        
        // Calculate the day within the month (1-based)
        const day = Math.floor(dayProgress * daysToShow) + 1;
        
        // Calculate angle for this point in the spiral (one full circle per month)
        // The negative angle creates clockwise rotation
        const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
        
        // Calculate the total progress through all months
        const totalMonths = yearOffset * 12 + month;
        const totalProgress = totalMonths + dayProgress;
        
        // Apply gradual radius expansion for visual clarity - match event positioning
        const currentRadius = baseRadius + totalProgress * 0.15;
        
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
