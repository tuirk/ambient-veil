
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { MonthlySpiralLine } from "./MonthlySpiralLine";
import { MonthlyMonthMarkers } from "./MonthlyMonthMarkers";
import { EventVisualizations } from "./EventVisualizations";

interface MonthlySpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const MonthlySpiralScene: React.FC<MonthlySpiralSceneProps> = ({ 
  events, 
  config, 
  onEventClick 
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position for monthly view
      const distance = 15 / config.zoom;
      camera.position.set(distance, distance * 0.8, distance);
      camera.lookAt(0, -5, 0); // Look at a point further down the spiral
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
        target={[0, -5, 0]} // Consistent with camera lookAt
      />
      
      {/* Space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render the monthly spiral */}
      <MonthlySpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render day markers */}
      <MonthlyMonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render events with visualizations */}
      <EventVisualizations 
        events={events}
        config={config}
        onEventClick={onEventClick}
        viewType="monthly"
      />
    </>
  );
};
