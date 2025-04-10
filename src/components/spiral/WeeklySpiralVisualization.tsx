
import React from "react";
import { Canvas } from "@react-three/fiber";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { WeeklySpiralScene } from "./WeeklySpiralScene";

interface WeeklySpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  startDate: Date;
  endDate: Date;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

const WeeklySpiralVisualization: React.FC<WeeklySpiralVisualizationProps> = ({
  events,
  config,
  startDate,
  endDate,
  onSpiralClick,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [12, 10, 12], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }}
        linear
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          // Handle WebGL context loss and restoration gracefully
          const canvas = gl.domElement;
          canvas.addEventListener('webglcontextlost', (event) => {
            console.log('WebGL context lost. You can try refreshing the page.');
            event.preventDefault();
          }, false);
          
          canvas.addEventListener('webglcontextrestored', () => {
            console.log('WebGL context restored.');
          }, false);
        }}
      >
        <fog attach="fog" args={['#000', 15, 50]} />
        <WeeklySpiralScene 
          events={events} 
          config={config} 
          startDate={startDate}
          endDate={endDate}
          onEventClick={onSpiralClick} 
        />
      </Canvas>
    </div>
  );
};

export default WeeklySpiralVisualization;
