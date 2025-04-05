
import { Vector3 } from "three";
import { SpiralPoint } from "../spiralUtils";

/**
 * Generates points for the quarterly spiral visualization
 * Each coil represents 3 months (one quarter of a year)
 * @param startYear The first year to display in the spiral
 * @param currentYear The latest year to display in the spiral
 * @param stepsPerLoop Number of points to use for each quarter loop
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each quarter loop
 * @returns Array of spiral points with position and date information
 */
export const generateQuarterlySpiralPoints = (
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
    
    // For current year, determine how many quarters to show based on today's date
    const numberOfQuarters = (year === todayYear) 
      ? Math.floor(todayMonth / 3) + 1 // Only render quarters up to the current one
      : 4; // All quarters for past years
    
    // Create quarterly coils (4 coils per year, 3 months per coil)
    for (let quarter = 0; quarter < numberOfQuarters; quarter++) {
      // For the current quarter of the current year, only show days up to today
      const isCurrentQuarter = (year === todayYear && quarter === Math.floor(todayMonth / 3));
      
      // Steps for this quarter
      const stepsThisQuarter = stepsPerLoop;
      
      // Create points around the loop for this quarter
      for (let step = 0; step < stepsThisQuarter; step++) {
        const progress = step / stepsPerLoop;
        
        // Calculate the month within the year
        const monthOffset = quarter * 3; // 0, 3, 6, or 9
        const monthProgress = progress; // 0-1 progress within the quarter
        const month = Math.floor(monthOffset + monthProgress * 3);
        
        // Calculate the day within the month (approximate)
        const day = Math.floor((monthProgress * 3 - Math.floor(monthProgress * 3)) * 30) + 1;
        
        // Skip points after today's date in the current quarter
        if (isCurrentQuarter) {
          // If we're in a future month of the current quarter
          if (month > todayMonth) continue;
          
          // If we're in the current month but a future day
          if (month === todayMonth && day > todayDay) continue;
        }
        
        // Fix: Use consistent angle calculation with event positioning
        // The negative angle creates clockwise rotation
        const angleRad = -progress * Math.PI * 2 + Math.PI/2;
        
        // Calculate the total progress through all quarters
        const totalProgress = yearOffset * 4 + quarter + progress;
        
        // Apply consistent radius expansion formula - must match event positioning
        const currentRadius = baseRadius + totalProgress * 0.5;
        
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
