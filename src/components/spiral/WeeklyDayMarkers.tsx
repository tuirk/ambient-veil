
import React from "react";
import { Text } from "@react-three/drei";

interface WeeklyDayMarkersProps {
  startDate: Date;
  endDate: Date;
  zoom: number;
}

export const WeeklyDayMarkers: React.FC<WeeklyDayMarkersProps> = ({
  startDate,
  endDate,
  zoom
}) => {
  const markers = [];
  const heightPerLoop = 0.7 * zoom;
  const baseRadius = 5 * zoom;
  const hourRadius = 0.08; // Radius increase per day
  
  // Number of days to display
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const now = new Date();
  
  // Day name abbreviations
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // Generate day markers
  for (let dayOffset = 0; dayOffset <= Math.min(daysDiff, 31); dayOffset++) {
    // Calculate current date
    const currentDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    // Skip future dates
    if (currentDate > now) continue;
    
    const dayOfWeek = currentDate.getDay();
    
    // Add markers at 0h (midnight), 6h, 12h (noon), 18h
    const hoursToMark = [0, 6, 12, 18];
    
    for (const hour of hoursToMark) {
      // Calculate position
      const hourProgress = hour / 24;
      
      // Calculate angle and radius
      const angleRad = -hourProgress * Math.PI * 2 + Math.PI/2;
      const currentRadius = baseRadius + dayOffset * hourRadius;
      
      const x = currentRadius * Math.cos(angleRad);
      const y = -dayOffset * heightPerLoop;
      const z = currentRadius * Math.sin(angleRad);
      
      // Add text marker - only show day name at midnight
      const label = hour === 0 ? 
        dayNames[dayOfWeek] : 
        `${hour}:00`;
      
      markers.push(
        <Text
          key={`${dayOffset}-${hour}`}
          position={[x, y, z]}
          color="white"
          fontSize={0.15}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.005}
          outlineColor="#000000"
        >
          {label}
        </Text>
      );
    }
  }
  
  return <>{markers}</>;
};
