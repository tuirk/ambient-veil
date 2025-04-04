
import React from "react";
import { Canvas } from "@react-three/fiber";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { MiniSpiralScene } from "./MiniSpiralScene";

interface MiniSpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

const MiniSpiralVisualization: React.FC<MiniSpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
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
        <MiniSpiralScene 
          events={events} 
          config={config} 
          onEventClick={onSpiralClick} 
        />
      </Canvas>
    </div>
  );
};

export default MiniSpiralVisualization;
