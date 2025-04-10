
import React from "react";
import { Text } from "@react-three/drei";

interface MonthlyDayMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MonthlyDayMarkers: React.FC<MonthlyDayMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  // Get current date to limit markers to today
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDay = now.getDate();
  
  const markers = [];
  
  // Days to show for each month (just 1st, 10th, 20th to avoid cluttering)
  const daysToShow = [1, 10, 20];
  
  // Create markers for specific days in each month
  for (let year = startYear; year <= currentYear; year++) {
    // Determine how many months to show for this year
    const monthsToShow = (year === todayYear) ? todayMonth + 1 : 12;
    
    for (let month = 0; month < monthsToShow; month++) {
      // Get the days in this month
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
      // Adjust for leap years
      let adjustedDaysInMonth = daysInMonth;
      if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
        adjustedDaysInMonth = 29;
      }
      
      // Filter the days to show based on the current month/year
      const filteredDays = daysToShow.filter(day => {
        if (year === todayYear && month === todayMonth) {
          return day <= todayDay; // Only show days up to today
        }
        return day <= adjustedDaysInMonth; // Make sure not to show days that don't exist
      });
      
      // Create markers for the filtered days
      for (let dayIndex = 0; dayIndex < filteredDays.length; dayIndex++) {
        const day = filteredDays[dayIndex];
        
        // Calculate position for monthly spiral
        // Normalize the day position within the month (0 to 1)
        const dayProgress = (day - 1) / adjustedDaysInMonth;
        
        // Calculate the total progress through all months
        const yearOffset = year - startYear;
        const totalMonths = yearOffset * 12 + month;
        const totalProgress = totalMonths + dayProgress;
        
        // Calculate angle - consistent with event positioning
        const angleRad = -dayProgress * Math.PI * 2 + Math.PI/2;
        
        // Apply consistent radius calculation
        const radius = 5 * zoom + totalProgress * 0.2;
        
        const x = radius * Math.cos(angleRad);
        const y = -totalProgress * 0.6 * zoom;
        const z = radius * Math.sin(angleRad);
        
        // Create text marker with improved visibility
        markers.push(
          <Text
            key={`${year}-${month}-${day}`}
            position={[x, y, z]}
            color="#ffffff"
            fontSize={0.3} // Smaller font size for day markers
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            {day}
          </Text>
        );
      }
    }
  }
  
  return <>{markers}</>;
};
