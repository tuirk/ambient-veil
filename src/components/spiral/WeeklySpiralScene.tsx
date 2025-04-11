
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { WeeklySpiralLine } from "./WeeklySpiralLine";
import { WeeklyDayMarkers } from "./WeeklyDayMarkers";
import { WeeklyEventVisualizations } from "./WeeklyEventVisualizations";

interface WeeklySpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, day: number, x: number, y: number) => void;
}

export const WeeklySpiralScene: React.FC<WeeklySpiralSceneProps> = ({ 
  events, 
  config, 
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
        minDistance={5}
        maxDistance={30}
        target={[0, -3, 0]} 
      />
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      {/* Render the weekly spiral */}
      <WeeklySpiralLine zoom={config.zoom} />
      
      {/* Render day markers */}
      <WeeklyDayMarkers zoom={config.zoom} />
      
      {/* Render events */}
      <WeeklyEventVisualizations 
        events={events}
        config={config}
        onEventClick={onEventClick}
      />
    </>
  );
};
