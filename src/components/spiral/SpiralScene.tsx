
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
  view: "year" | "near-future"; // Updated view prop type
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
        // For near future view, position camera closer to the current and previous month
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        
        // Calculate position on spiral for current month
        const yearOffset = currentYear - config.startYear;
        const monthProgress = currentMonth / 12;
        const totalProgress = yearOffset + monthProgress;
        
        // Calculate angle for current month
        const angleRad = -monthProgress * Math.PI * 2 + Math.PI/2;
        
        // Radius at current month position
        const currentRadius = (5 * config.zoom) + (totalProgress * 0.5);
        
        // Position camera looking at current month
        const distanceFactor = 2.5 / config.zoom; // Closer for near future view
        const x = currentRadius * Math.cos(angleRad) + distanceFactor * Math.cos(angleRad);
        const y = -totalProgress * (1.5 * config.zoom) - distanceFactor;
        const z = currentRadius * Math.sin(angleRad) + distanceFactor * Math.sin(angleRad);
        
        camera.position.set(x, y, z);
        
        // Look at the current month position
        camera.lookAt(
          currentRadius * Math.cos(angleRad),
          -totalProgress * (1.5 * config.zoom),
          currentRadius * Math.sin(angleRad)
        );
        
        // Update controls target
        if (controlsRef.current) {
          controlsRef.current.target.set(
            currentRadius * Math.cos(angleRad),
            -totalProgress * (1.5 * config.zoom),
            currentRadius * Math.sin(angleRad)
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
        view={view} // Pass view to SpiralLine
      />
      
      {/* Render month markers */}
      <MonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
        view={view} // Pass view to MonthMarkers
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
