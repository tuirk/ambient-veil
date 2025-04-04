
import React from "react";
import { Text } from "@react-three/drei";

interface MonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
  view: "year" | "near-future";
}

export const MonthMarkers: React.FC<MonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom,
  view
}) => {
  // Get current year for near-future view
  const currentYearValue = new Date().getFullYear();
  
  const monthsToShow = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const markers = [];
  
  // For near-future view, adjust the start year
  const displayStartYear = view === "near-future" ? currentYearValue : startYear;
  
  for (let year = displayStartYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month++) {
      // Skip months that have already passed in the current year for near-future view
      if (view === "near-future" && year === currentYearValue && month < new Date().getMonth()) {
        continue;
      }
      
      // For year view, only show quarterly months to reduce clutter
      if (view === "year" && month % 3 !== 0) {
        continue;
      }
      
      // Calculate position for this month
      const yearIndex = year - (view === "near-future" ? currentYearValue : startYear);
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
