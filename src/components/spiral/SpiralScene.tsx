
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./SpiralLine";
import { MonthMarkers } from "./MonthMarkers";
import { EventVisualizations } from "./EventVisualizations";
import { SpaceBackground } from "./SpaceBackground";
import { CosmicDust } from "./CosmicDust";

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
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Set up optimal rendering settings on scene initialization
  useEffect(() => {
    if (gl) {
      // Ensure renderer settings are optimized
      gl.setClearColor(0x000000, 1);
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit to prevent performance issues
    }
  }, [gl]);
  
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
        makeDefault
      />
      
      {/* Add space background with stars and cosmic dust */}
      {/* Render background elements with lower renderOrder */}
      <SpaceBackground />
      <CosmicDust />
      
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
      
      {/* Render all events with the enhanced cosmic visualization */}
      <EventVisualizations 
        events={events}
        config={config}
        onEventClick={onEventClick}
      />
    </>
  );
};
