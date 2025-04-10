
import React from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface DayMarkersProps {
  startDate: Date;
  endDate: Date;
  zoom: number;
}

export const DayMarkers: React.FC<DayMarkersProps> = ({
  startDate,
  endDate,
  zoom
}) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const markers = [];
  
  // Clone the start date to avoid modifying the original
  const currentDate = new Date(startDate);
  const today = new Date(endDate);
  
  // Loop through each day from start date to today
  let dayIndex = 0;
  while (currentDate <= today) {
    const dayOfWeek = currentDate.getDay();
    const dayName = dayNames[dayOfWeek];
    
    // Calculate position for this day marker
    // Place the marker at noon (0.5 through the day)
    const angleRad = -0.5 * Math.PI * 2 + Math.PI/2;
    const radius = 5 * zoom + dayIndex * 0.5;
    
    const x = radius * Math.cos(angleRad);
    const y = -dayIndex * 1.5 * zoom;
    const z = radius * Math.sin(angleRad);
    
    // Format the date as "Day (MM/DD)"
    const monthStr = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = currentDate.getDate().toString().padStart(2, '0');
    const dateText = `${dayName} (${monthStr}/${dayStr})`;
    
    markers.push(
      <Text
        key={`day-${dayIndex}`}
        position={[x, y, z]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {dateText}
      </Text>
    );
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayIndex++;
  }
  
  return <>{markers}</>;
};
