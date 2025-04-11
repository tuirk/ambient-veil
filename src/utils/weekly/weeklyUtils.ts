
import { Vector3 } from "three";
import { SpiralPoint } from "@/utils/spiralUtils";

// Get the start of the current week (Monday)
export function getStartOfWeek(date: Date): Date {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

// Get the name of the day of the week
export function getDayName(dayIndex: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[dayIndex];
}

// Generate points for the weekly spiral
export function generateWeeklySpiralPoints(
  zoom: number = 1,
  heightPerLoop: number = 1.5
): SpiralPoint[] {
  const startOfWeek = getStartOfWeek(new Date());
  const startYear = startOfWeek.getFullYear();
  const startMonth = startOfWeek.getMonth();
  const startDay = startOfWeek.getDate();
  
  const points: SpiralPoint[] = [];
  const pointsPerDay = 24; // Hours in a day
  const daysInWeek = 7;
  const totalPoints = pointsPerDay * daysInWeek;
  const baseRadius = 5 * zoom;
  
  for (let i = 0; i <= totalPoints; i++) {
    const progress = i / totalPoints;
    const dayProgress = progress * daysInWeek;
    const currentDayIndex = Math.floor(dayProgress);
    const dayFraction = dayProgress - currentDayIndex;
    
    // Calculate date for this point
    const pointDate = new Date(startOfWeek);
    pointDate.setDate(startDay + currentDayIndex);
    
    // Calculate angle based on time within the day (0 to 2π)
    const angleRad = dayFraction * Math.PI * 2; 
    
    // The radius should be consistent for the whole week
    const currentRadius = baseRadius;
    
    // Calculate height based on day of week
    const y = -currentDayIndex * heightPerLoop * zoom;
    
    // Calculate x and z based on the angle and radius
    const x = currentRadius * Math.cos(angleRad);
    const z = currentRadius * Math.sin(angleRad);
    
    points.push({
      position: new Vector3(x, y, z),
      year: pointDate.getFullYear(),
      month: pointDate.getMonth(),
      day: pointDate.getDate()
    });
  }
  
  return points;
}

// Get event position on the weekly spiral
export function getWeeklyEventPosition(
  date: Date,
  zoom: number = 1,
  heightPerLoop: number = 1.5
): Vector3 {
  const startOfWeek = getStartOfWeek(new Date());
  const startTimestamp = startOfWeek.getTime();
  const dateTimestamp = date.getTime();
  
  // Calculate days since start of week
  const daysSinceStart = Math.floor((dateTimestamp - startTimestamp) / (24 * 60 * 60 * 1000));
  
  if (daysSinceStart < 0 || daysSinceStart >= 7) {
    console.warn("Date is outside of current week");
    // Return a fallback position if the date is outside the week
    return new Vector3(0, 0, 0);
  }
  
  // Calculate time of day as a fraction (0 to 1)
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeOfDay = (hours + minutes / 60) / 24;
  
  // Calculate angle based on time of day
  const angleRad = timeOfDay * Math.PI * 2;
  
  // Calculate position
  const baseRadius = 5 * zoom;
  const x = baseRadius * Math.cos(angleRad);
  const y = -daysSinceStart * heightPerLoop * zoom;
  const z = baseRadius * Math.sin(angleRad);
  
  return new Vector3(x, y, z);
}

// Calculate segment for event durations within the week
export function calculateWeeklySpiralSegment(
  startDate: Date,
  endDate: Date,
  segmentPoints: number = 50,
  zoom: number = 1,
  heightPerLoop: number = 1.5
): Vector3[] {
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  // Clamp dates to current week
  const effectiveStartDate = new Date(Math.max(startDate.getTime(), startOfWeek.getTime()));
  const effectiveEndDate = new Date(Math.min(endDate.getTime(), endOfWeek.getTime()));
  
  // If the dates are outside the week bounds, return an empty array
  if (effectiveStartDate >= endOfWeek || effectiveEndDate < startOfWeek) {
    return [];
  }
  
  // Calculate total milliseconds for the visible portion of the event
  const totalMs = effectiveEndDate.getTime() - effectiveStartDate.getTime();
  if (totalMs <= 0) return [];
  
  const points: Vector3[] = [];
  
  // Create points at regular intervals between the two dates
  for (let i = 0; i <= segmentPoints; i++) {
    const progress = i / segmentPoints;
    const currentDate = new Date(effectiveStartDate.getTime() + progress * totalMs);
    
    points.push(getWeeklyEventPosition(currentDate, zoom, heightPerLoop));
  }
  
  return points;
}
