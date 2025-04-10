
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { WeeklySpiralLine } from "./WeeklySpiralLine";
import { WeeklyDayMarkers } from "./WeeklyDayMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface WeeklySpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  startDate: Date;
  endDate: Date;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const WeeklySpiralScene: React.FC<WeeklySpiralSceneProps> = ({ 
  events, 
  config, 
  startDate,
  endDate,
  onEventClick 
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position for weekly view
      const distance = 12 / config.zoom;
      camera.position.set(distance, distance * 0.7, distance);
      camera.lookAt(0, -3, 0);
    }
  }, [config.zoom, camera]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={4}
        maxDistance={25}
        target={[0, -3, 0]}
      />
      
      {/* Space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render the weekly spiral */}
      <WeeklySpiralLine 
        startDate={startDate}
        endDate={endDate}
        zoom={config.zoom}
      />
      
      {/* Render hour markers */}
      <WeeklyDayMarkers 
        startDate={startDate}
        endDate={endDate}
        zoom={config.zoom}
      />
      
      {/* Render events with visualizations */}
      <EventVisualizations 
        events={events}
        config={config}
        onEventClick={onEventClick}
        viewType="weekly"
        startDate={startDate}
      />
    </>
  );
};
