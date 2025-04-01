
import { Vector3 } from "three";
import { TimeEvent } from "@/types/event";

export interface SpiralPoint {
  position: Vector3;
  year: number;
  month: number;
  day: number;
}

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
  
  // Generate for each year in range
  for (let yearOffset = 0; yearOffset < yearSpan; yearOffset++) {
    const year = startYear + yearOffset;
    
    // Determine how much of this year to render
    const yearProgress = year === todayYear 
      ? (todayMonth / 12) + (todayDay / 365)
      : 1; // Full year for past years
    
    const stepsThisYear = year === todayYear 
      ? Math.floor(yearProgress * stepsPerLoop) 
      : stepsPerLoop;
    
    for (let step = 0; step < stepsThisYear; step++) {
      const progress = step / stepsPerLoop;
      const month = Math.floor(progress * 12);
      const day = Math.floor((progress * 12 - month) * 30) + 1;
      
      // Calculate angle with continuous progression
      // Use negative angle for clockwise rotation and offset for proper positioning
      const angleRad = -progress * Math.PI * 2 + Math.PI/2;
      
      // Calculate the total progress through all years
      const totalProgress = yearOffset + progress;
      
      // Use a consistent radius expansion formula for smooth spiral
      const currentRadius = baseRadius + totalProgress * 0.5;
      
      // Position calculation with gradual height change
      const x = currentRadius * Math.cos(angleRad);
      const y = -totalProgress * heightPerLoop; // Smooth height progression
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

export const calculateSpiralSegment = (
  startEvent: TimeEvent,
  endEvent: TimeEvent,
  startYear: number,
  segmentPoints: number = 100, // Default is already 100 points
  radius: number = 5,
  heightPerLoop: number = 1.5
): Vector3[] => {
  // Increase this to ensure ALL event duration lines are smooth regardless of color
  const actualSegmentPoints = 200; // Doubled from default to ensure smoothness
  
  const points: Vector3[] = [];
  
  const startDate = new Date(startEvent.startDate);
  const endDate = new Date(endEvent.startDate || endEvent.endDate || startEvent.startDate);
  
  // Calculate total days between dates
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Create significantly more points for smoother curves
  for (let i = 0; i <= actualSegmentPoints; i++) {
    const progress = i / actualSegmentPoints;
    const currentDate = new Date(startDate.getTime() + progress * totalDays * 24 * 60 * 60 * 1000);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    
    // Calculate yearOffset and progress consistently
    const yearOffset = year - startYear;
    const yearProgress = month / 12 + day / 365;
    const totalProgress = yearOffset + yearProgress;
    
    // Calculate angle consistently with other functions
    const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
    
    // Use consistent radius calculation
    const currentRadius = radius + totalProgress * 0.5;
    
    const x = currentRadius * Math.cos(angleRad);
    const y = -totalProgress * heightPerLoop;
    const z = currentRadius * Math.sin(angleRad);
    
    points.push(new Vector3(x, y, z));
  }
  
  return points;
};
