
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralLine } from "./SpiralLine";
import { MonthMarkers } from "./MonthMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface SpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
  view: "year" | "near-future";
}

export const SpiralScene: React.FC<SpiralSceneProps> = ({ 
  events, 
  config, 
  onEventClick,
  view
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom and view
  useEffect(() => {
    if (camera) {
      if (view === "near-future") {
        // For near future view, position camera closer to the current year's spiral
        const currentYear = new Date().getFullYear();
        
        // Calculate position on spiral for current year (January)
        const yearOffset = 0; // Start at 0 for the current year in near-future view
        
        // Position camera to see the current year spiral section
        const currentRadius = (5 * config.zoom) + (yearOffset * 0.5);
        const distanceFactor = 2.5 / config.zoom;
        
        camera.position.set(
          distanceFactor * 2, 
          distanceFactor * 0.5, 
          distanceFactor * 2
        );
        
        // Look at the current year position
        camera.lookAt(
          currentRadius * 0.5,
          -yearOffset * (1.5 * config.zoom),
          currentRadius * 0.5
        );
        
        // Update controls target
        if (controlsRef.current) {
          controlsRef.current.target.set(
            currentRadius * 0.5,
            -yearOffset * (1.5 * config.zoom),
            currentRadius * 0.5
          );
        }
      } else {
        // For year view, use the original position
        const distance = 15 / config.zoom;
        camera.position.set(distance, distance, distance);
        camera.lookAt(0, -3, 0);
        
        // Reset controls target
        if (controlsRef.current) {
          controlsRef.current.target.set(0, -3, 0);
        }
      }
    }
  }, [config.zoom, camera, view, config.startYear]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
      />
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      
      {/* Render the main spiral */}
      <SpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
        view={view}
      />
      
      {/* Render month markers */}
      <MonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
        view={view}
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
