
import React from "react";
import { Text } from "@react-three/drei";

interface MonthlyMonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MonthlyMonthMarkers: React.FC<MonthlyMonthMarkersProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  const markers = [];
  const heightPerLoop = 1.5 * zoom;
  const baseRadius = 5 * zoom;
  
  // Generate month markers for each year in range
  for (let year = startYear; year <= currentYear; year++) {
    const yearOffset = year - startYear;
    
    // For each month in the year
    for (let month = 0; month < 12; month++) {
      // Only show markers for days 1, 10, 20 of each month
      const daysToMark = [1, 10, 20];
      
      for (const day of daysToMark) {
        // Skip invalid days (e.g., February 30)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        if (day > daysInMonth) continue;
        
        // Calculate current date
        const currentDate = new Date(year, month, day);
        
        // Skip future dates
        if (currentDate > new Date()) continue;
        
        // Calculate position
        const monthIndex = month;
        const dayProgress = (day - 1) / daysInMonth;
        
        // Calculate total progress through all months
        const totalMonths = yearOffset * 12 + monthIndex;
        const totalProgress = totalMonths + dayProgress;
        
        // Calculate angle and radius
        const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
        const currentRadius = baseRadius + totalProgress * 0.2;
        
        const x = currentRadius * Math.cos(angleRad);
        const y = -totalProgress * heightPerLoop;
        const z = currentRadius * Math.sin(angleRad);
        
        // Only label day 1 with month name
        const label = day === 1 ? 
          new Date(year, month, 1).toLocaleDateString(undefined, { month: 'short' }) :
          day.toString();
        
        // Add text marker
        markers.push(
          <Text
            key={`${year}-${month}-${day}`}
            position={[x, y, z]}
            color="white"
            fontSize={0.2}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        );
      }
    }
  }
  
  return <>{markers}</>;
};
