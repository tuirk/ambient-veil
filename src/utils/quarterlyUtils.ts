
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";
import { SpiralPoint } from "./spiralUtils";

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
  
  // Number of years to render
  const yearSpan = currentYear - startYear + 1;
  // Base radius of the spiral
  const baseRadius = radius;
  
  // Generate points for each year in range
  for (let yearOffset = 0; yearOffset < yearSpan; yearOffset++) {
    const year = startYear + yearOffset;
    
    // Create quarterly coils (4 coils per year, 3 months per coil)
    for (let quarter = 0; quarter < 4; quarter++) {
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
        
        // Calculate angle in radians with proper offset
        // Negative angle for clockwise rotation, offset for positioning
        const angleRad = -progress * Math.PI * 2 + Math.PI/2;
        
        // Calculate the total progress through all quarters
        const totalProgress = yearOffset * 4 + quarter + progress;
        
        // Apply consistent radius expansion formula
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

/**
 * Calculates the position for a single event on the quarterly spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between quarter loops
 * @returns 3D vector position for the event
 */
export const getQuarterlyEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  const year = event.startDate.getFullYear();
  const month = event.startDate.getMonth();
  const day = event.startDate.getDate();
  
  // Calculate quarter (0, 1, 2, 3) and progress within quarter
  const quarter = Math.floor(month / 3);
  const monthInQuarter = month % 3;
  const quarterProgress = monthInQuarter / 3 + day / (3 * 30);
  
  // Calculate total progress (in terms of quarter loops)
  const yearOffset = year - startYear;
  const totalProgress = yearOffset * 4 + quarter + quarterProgress;
  
  // Calculate angle
  const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
  
  // Use the same radius formula
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};

/**
 * Generates points for visualizing event durations in the quarterly spiral
 * @param startEvent The event marking the start of the duration
 * @param endEvent The event marking the end of the duration
 * @param startYear First year of the spiral (for reference)
 * @param segmentPoints Requested number of points
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between quarter loops
 * @returns Array of 3D points forming a smooth line between events
 */
export const calculateQuarterlySpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  segmentPoints: number = 100,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  // Calculate a good number of points based on the segment length
  const startDate = new Date(startEvent.startDate);
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Scale points with duration, but keep a reasonable maximum
  const actualSegmentPoints = Math.min(500, segmentPoints);
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(startDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Calculate quarter and progress
    const quarter = Math.floor(month / 3);
    const monthInQuarter = month % 3;
    const quarterProgress = monthInQuarter / 3 + day / (3 * 30);
    
    // Calculate total progress
    const yearOffset = year - startYear;
    const totalProgress = yearOffset * 4 + quarter + quarterProgress;
    
    // Calculate position
    const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
    const currentRadius = radius + totalProgress * 0.5;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
