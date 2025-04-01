
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./SpiralLine";
import { MonthMarkers } from "./MonthMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface SpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const SpiralScene: React.FC<SpiralSceneProps> = ({ 
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
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
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
      <EventVisualizations 
        events={events}
        config={config}
        onEventClick={onEventClick}
      />
    </>
  );
};
