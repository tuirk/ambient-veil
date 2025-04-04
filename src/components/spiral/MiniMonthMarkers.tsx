
import React from "react";
import { Text } from "@react-three/drei";

interface MiniMonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MiniMonthMarkers: React.FC<MiniMonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  // Show all months for mini spiral view
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const markers = [];
  
  // Get current date to determine how many markers to show
  const now = new Date();
  const currentMonth = now.getMonth();
  
  // Create markers for each month from January of current year to today
  for (let year = startYear; year <= currentYear; year++) {
    // Determine how many months to show for this year
    const monthLimit = year === currentYear ? currentMonth + 1 : 12;
    
    for (let month = 0; month < monthLimit; month++) {
      // Calculate which coil this month belongs to (each coil is 2 months)
      const monthsSinceStart = (year - startYear) * 12 + month;
      const coilIndex = Math.floor(monthsSinceStart / 2);
      
      // Calculate the position within the coil
      const monthInCoil = month % 2;
      const coilProgress = monthInCoil / 2 + 0.25; // Position at the middle of the month
      
      // Calculate angle with appropriate offset
      const angleRad = -coilProgress * Math.PI * 2 + Math.PI/2;
      const radius = 5 * zoom + coilIndex * 0.4;
      
      const x = radius * Math.cos(angleRad);
      const y = -coilIndex * 1.2 * zoom;
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
