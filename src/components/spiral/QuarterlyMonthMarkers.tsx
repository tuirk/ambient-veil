
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
      const quarterIndex = Math.floor(month / 3);
      
      // Position calculation for quarterly spiral
      // Each coil represents 3 months
      const coilProgress = (month % 3) / 3;
      const totalProgress = quarterIndex + coilProgress;
      
      // Calculate angle with appropriate offset
      const angleRad = -coilProgress * Math.PI * 2 + Math.PI/2;
      const radius = 5 * zoom + totalProgress * 0.5;
      
      const x = radius * Math.cos(angleRad);
      const y = -totalProgress * 1.5 * zoom;
      const z = radius * Math.sin(angleRad);
      
      // Create text marker
      markers.push(
        <Text
          key={`${year}-${month}`}
          position={[x, y, z]}
          color="white"
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
        >
          {monthNames[month]}
        </Text>
      );
    }
  }
  
  return <>{markers}</>;
};
