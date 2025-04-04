
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { QuarterlySpiralLine } from "./QuarterlySpiralLine";
import { QuarterlyMonthMarkers } from "./QuarterlyMonthMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface QuarterlySpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const QuarterlySpiralScene: React.FC<QuarterlySpiralSceneProps> = ({ 
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
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      
      {/* Render the quarterly spiral */}
      <QuarterlySpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render month markers */}
      <QuarterlyMonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render events with the enhanced cosmic visualization */}
      <EventVisualizations 
        events={events.filter(event => 
          event.startDate.getFullYear() >= config.startYear && 
          event.startDate.getFullYear() <= config.currentYear
        )}
        config={config}
        onEventClick={onEventClick}
      />
    </>
  );
};
