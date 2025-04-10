
import React from "react";
import { Canvas } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { DailySpiralScene } from "./DailySpiralScene";

interface DailySpiralVisualizationProps {
  events: TimeEvent[];
  startDate: Date;
  endDate: Date;
  zoom: number;
  onSpiralClick: (year: number, month: number, day: number, x: number, y: number) => void;
}

const DailySpiralVisualization: React.FC<DailySpiralVisualizationProps> = ({
  events,
  startDate,
  endDate,
  zoom,
  onSpiralClick,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [15, 12, 15], 
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
        <DailySpiralScene 
          events={events} 
          startDate={startDate}
          endDate={endDate}
          zoom={zoom}
          onEventClick={onSpiralClick} 
        />
      </Canvas>
    </div>
  );
};

export default DailySpiralVisualization;
