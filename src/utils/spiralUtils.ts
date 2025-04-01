
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

export interface SpiralPoint {
  position: Vector3;
  year: number;
  month: number;
  day: number;
}

/**
 * Generates points for the spiral visualization based on time range
 * @param startYear The first year to display in the spiral
 * @param currentYear The latest year to display in the spiral
 * @param stepsPerLoop Number of points to use for each year loop (higher = smoother curve)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between each year loop
 * @returns Array of spiral points with position and date information
 */
export const generateSpiralPoints = (
  startYear: number,
  currentYear: number,
  stepsPerLoop: number = 360,
  radius: number = 5,
  heightPerLoop: number = 1.5
): SpiralPoint[] => {
  const points: SpiralPoint[] = [];
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
    
    // For current year, only generate points up to today
    const yearProgress = year === todayYear 
      ? (todayMonth / 12) + (todayDay / 365)
      : 1; // Full year for past years
    
    const stepsThisYear = year === todayYear 
      ? Math.floor(yearProgress * stepsPerLoop) 
      : stepsPerLoop;
    
    // Create points around the loop for this year
    for (let step = 0; step < stepsThisYear; step++) {
      const progress = step / stepsPerLoop;
      const month = Math.floor(progress * 12);
      const day = Math.floor((progress * 12 - month) * 30) + 1;
      
      // Calculate angle in radians with proper offset
      // Negative angle for clockwise rotation, offset for positioning
      const angleRad = -progress * Math.PI * 2 + Math.PI/2;
      
      // Calculate the total progress through all years
      const totalProgress = yearOffset + progress;
      
      // Apply consistent radius expansion formula for smooth spiral
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

  return points;
};

/**
 * Calculates the position for a single event on the spiral
 * @param event The event to position
 * @param startYear First year of the spiral (for reference)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between year loops
 * @returns 3D vector position for the event
 */
export const getEventPosition = (
  event: TimeEvent,
  startYear: number,
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3 => {
  const year = event.startDate.getFullYear();
  const month = event.startDate.getMonth();
  const day = event.startDate.getDate();
  
  // Calculate yearOffset and progress within year for consistent positioning
  const yearOffset = year - startYear;
  const yearProgress = month / 12 + day / 365;
  const totalProgress = yearOffset + yearProgress;
  
  // Calculate angle consistently with generateSpiralPoints
  const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
  
  // Use the same radius formula as in generateSpiralPoints
  const currentRadius = radius + totalProgress * 0.5;
  
  const x = currentRadius * Math.cos(angleRad);
  const y = -totalProgress * heightPerLoop;
  const z = currentRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
};

/**
 * Generates points for visualizing event durations (line segments between dates)
 * @param startEvent The event marking the start of the duration
 * @param endEvent The event marking the end of the duration
 * @param startYear First year of the spiral (for reference)
 * @param segmentPoints Requested number of points (will be overridden)
 * @param radius Base radius of the spiral
 * @param heightPerLoop Vertical distance between year loops
 * @returns Array of 3D points forming a smooth line between events
 */
export const calculateSpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  segmentPoints: number = 100, // Default is 100 points but we override it
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  // Always use 300 points regardless of passed parameter to ensure smoothness for all colors
  const actualSegmentPoints = 300;
  
  const points: Vector3[] = [];
  
  const startDate = new Date(startEvent.startDate);
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  
  // Calculate total days between dates
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(startDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Calculate position consistently with other functions
    const yearOffset = year - startYear;
    const yearProgress = month / 12 + day / 365;
    const totalProgress = yearOffset + yearProgress;
    
    const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
    const currentRadius = radius + totalProgress * 0.5;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
