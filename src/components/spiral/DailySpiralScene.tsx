
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent } from "@/types/event";
import { DailySpiralLine } from "./DailySpiralLine";
import { DayMarkers } from "./DayMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface DailySpiralSceneProps {
  events: TimeEvent[];
  startDate: Date;
  endDate: Date;
  zoom: number;
  onEventClick: (year: number, month: number, day: number, x: number, y: number) => void;
}

export const DailySpiralScene: React.FC<DailySpiralSceneProps> = ({ 
  events, 
  startDate,
  endDate,
  zoom,
  onEventClick 
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position for daily view
      // Better positioning to view the daily spiral
      const distance = 15 / zoom;
      camera.position.set(distance, distance * 0.9, distance);
      camera.lookAt(0, -3, 0); // Look slightly lower for better view
    }
  }, [zoom, camera]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
        target={[0, -3, 0]} // Consistent with camera lookAt
      />
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render the daily spiral */}
      <DailySpiralLine 
        startDate={startDate}
        endDate={endDate}
        zoom={zoom}
      />
      
      {/* Render day markers */}
      <DayMarkers 
        startDate={startDate}
        endDate={endDate}
        zoom={zoom}
      />
      
      {/* Render events with the cosmic visualization */}
      <EventVisualizations 
        events={events}
        config={{
          startYear: startDate.getFullYear(),
          currentYear: endDate.getFullYear(),
          zoom: zoom,
          centerX: 0,
          centerY: 0
        }}
        onEventClick={(year, month, x, y) => {
          // Get the current day for this click (based on the closest point on spiral)
          const clickDate = new Date();
          clickDate.setFullYear(year);
          clickDate.setMonth(month);
          onEventClick(year, month, clickDate.getDate(), x, y);
        }}
        dailyMode={{
          enabled: true,
          startDate: startDate,
          endDate: endDate
        }}
      />
    </>
  );
};
