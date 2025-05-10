
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./spiral-components/SpiralLine";
import { MonthMarkers } from "./spiral-components/MonthMarkers";
import { EventsLayer } from "./EventsLayer";
import { SpaceBackground } from "./SpaceBackground";

interface SpiralSceneContentProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const SpiralSceneContent: React.FC<SpiralSceneContentProps> = ({
  events,
  config,
  onEventClick
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position based on zoom
      const distance = 15 / config.zoom;
      camera.position.set(distance, distance, distance);
      camera.lookAt(0, -3, 0);
    }
  }, [config.zoom, camera]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* Space background with stars, nebula, and cosmic dust */}
      <SpaceBackground />
      
      {/* Render the main spiral */}
      <SpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render month markers */}
      <MonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render all events */}
      <EventsLayer
        events={events}
        config={config}
        onEventClick={onEventClick}
      />
    </>
  );
};
