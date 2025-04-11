
import React from "react";
import { Text } from "@react-three/drei";
import { getDayName, getStartOfWeek } from "@/utils/weekly/weeklyUtils";

interface WeeklyDayMarkersProps {
  zoom: number;
}

export const WeeklyDayMarkers: React.FC<WeeklyDayMarkersProps> = ({ 
  zoom 
}) => {
  const now = new Date();
  const startOfWeek = getStartOfWeek(new Date());
  const markers = [];
  const baseRadius = 5 * zoom;
  const heightPerLoop = 1.5 * zoom;
  
  // Calculate how many days have passed in the current week
  const daysSinceStart = Math.floor((now.getTime() - startOfWeek.getTime()) / (24 * 60 * 60 * 1000));
  // Include the current day
  const daysToRender = Math.min(daysSinceStart + 1, 7);
  
  // Add markers for each day of the week (only up to current day)
  for (let day = 0; day < daysToRender; day++) {
    // Calculate date for this day
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + day);
    
    const dayName = getDayName(day);
    const y = -day * heightPerLoop;
    
    // Add marker to the left of the loop
    markers.push(
      <Text
        key={`day-${day}`}
        position={[-baseRadius - 1, y, 0]}
        color="white"
        fontSize={0.4}
        anchorX="right"
        anchorY="middle"
      >
        {`${dayName} (${currentDate.getDate()}/${currentDate.getMonth() + 1})`}
      </Text>
    );
    
    // For the current day, only show hours up to the current hour
    const maxHour = day === daysSinceStart ? now.getHours() : 23;
    
    // Add time markers for each day (at 6-hour intervals)
    for (let hour = 0; hour <= maxHour; hour += 6) {
      const hourProgress = hour / 24;
      const angleRad = hourProgress * Math.PI * 2;
      
      const x = baseRadius * Math.cos(angleRad);
      const z = baseRadius * Math.sin(angleRad);
      
      const hourLabel = hour === 0 ? "12am" : 
                        hour < 12 ? `${hour}am` : 
                        hour === 12 ? "12pm" : 
                        `${hour - 12}pm`;
      
      markers.push(
        <Text
          key={`day-${day}-hour-${hour}`}
          position={[x, y, z]}
          color="white"
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
        >
          {hourLabel}
        </Text>
      );
    }
  }
  
  return <>{markers}</>;
};
