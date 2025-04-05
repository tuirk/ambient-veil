
import React from "react";
import { Text } from "@react-three/drei";

interface QuarterlyMonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const QuarterlyMonthMarkers: React.FC<QuarterlyMonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  // Get current date to limit markers to today
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  
  // Show all months for quarterly view
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const markers = [];
  
  // Create markers for each month in each year
  for (let year = startYear; year <= currentYear; year++) {
    // Determine how many months to show for this year
    const monthsToShow = (year === todayYear) ? todayMonth + 1 : 12;
    
    for (let month = 0; month < monthsToShow; month++) {
      // Calculate position for quarterly spiral
      const quarter = Math.floor(month / 3);
      const monthInQuarter = month % 3;
      
      // Fix: Use the same positioning logic as in getQuarterlyEventPosition
      // Calculate position within the quarter (0 to 1)
      const quarterProgress = monthInQuarter / 3;
      
      // Calculate the total progress through all quarters
      const yearOffset = year - startYear;
      const totalProgress = yearOffset * 4 + quarter + quarterProgress;
      
      // Calculate angle with appropriate offset - must match event positioning
      const angleRad = -quarterProgress * Math.PI * 2 + Math.PI/2;
      const radius = 5 * zoom + totalProgress * 0.5;
      
      const x = radius * Math.cos(angleRad);
      const y = -totalProgress * 1.5 * zoom;
      const z = radius * Math.sin(angleRad);
      
      // Create text marker with improved visibility
      markers.push(
        <Text
          key={`${year}-${month}`}
          position={[x, y, z]}
          color="#ffffff" // Pure white for better visibility
          fontSize={0.4} // Increased from 0.35 for better readability
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.06} // Increased from 0.05 for better visibility
          outlineColor="#000000" // Pure black outline for maximum contrast
          maxWidth={2}
        >
          {monthNames[month]}
        </Text>
      );
    }
  }
  
  return <>{markers}</>;
};
