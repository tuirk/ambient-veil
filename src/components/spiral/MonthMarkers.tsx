
import React from "react";
import { Text } from "@react-three/drei";

interface MonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
  view: "year" | "near-future"; // Add view prop
}

export const MonthMarkers: React.FC<MonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom,
  view
}) => {
  const today = new Date();
  const currentYearValue = today.getFullYear();
  const currentMonthValue = today.getMonth();
  
  // Calculate previous month and year
  let previousMonthValue = currentMonthValue - 1;
  let previousYearValue = currentYearValue;
  
  if (previousMonthValue < 0) {
    previousMonthValue = 11; // December
    previousYearValue = currentYearValue - 1;
  }
  
  const monthsToShow = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const markers = [];
  
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      // For year view, only show quarterly months
      if (view === "year" && month % 3 !== 0) {
        continue;
      }
      
      // For near-future view, only show current and previous month
      if (view === "near-future" && 
          !((year === currentYearValue && month === currentMonthValue) || 
            (year === previousYearValue && month === previousMonthValue))) {
        continue;
      }
      
      // Calculate position for this month
      const yearIndex = year - startYear;
      const monthFraction = month / 12;
      const angleRad = -monthFraction * Math.PI * 2 + Math.PI/2;
      const radius = 5 * zoom + yearIndex * 0.5;
      
      const x = radius * Math.cos(angleRad);
      const y = -yearIndex * 1.5 * zoom - monthFraction * 1.5 * zoom;
      const z = radius * Math.sin(angleRad);
      
      markers.push(
        <Text
          key={`${year}-${month}`}
          position={[x, y, z]}
          color="white"
          fontSize={view === "near-future" ? 0.4 : 0.3} // Larger text for near-future view
          anchorX="center"
          anchorY="middle"
        >
          {monthsToShow[month]}
        </Text>
      );
    }
  }
  
  return <>{markers}</>;
};
