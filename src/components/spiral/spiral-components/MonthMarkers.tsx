
import React from "react";
import { Text } from "@react-three/drei";

interface MonthMarkersProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const MonthMarkers: React.FC<MonthMarkersProps> = ({ 
  startYear, 
  currentYear, 
  zoom 
}) => {
  const monthsToShow = ["Jan", "Apr", "Jul", "Oct"];
  const markers = [];
  
  for (let year = startYear; year <= currentYear; year++) {
    for (let month = 0; month < 12; month += 3) {
      if (monthsToShow.includes(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][month])) {
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
            fontSize={0.3}
            anchorX="center"
            anchorY="middle"
          >
            {monthsToShow[month/3]}
          </Text>
        );
      }
    }
  }
  
  return <>{markers}</>;
};
