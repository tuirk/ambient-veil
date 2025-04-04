
import React from "react";
import { Canvas } from "@react-three/fiber";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralScene } from "./SpiralScene";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
  view: "year" | "near-future"; // Update view prop type
}

const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
  view,
}) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ 
          position: [15, 15, 15], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true
        }}
        linear
        dpr={[1, 2]}
      >
        <fog attach="fog" args={['#000', 15, 50]} />
        <SpiralScene 
          events={events} 
          config={config} 
          onEventClick={onSpiralClick}
          view={view} // Pass view to SpiralScene
        />
      </Canvas>
    </div>
  );
};

export default SpiralVisualization;
