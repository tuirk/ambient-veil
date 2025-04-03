
import React from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { SpiralScene } from "./SpiralScene";

interface SpiralVisualizationProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSpiralClick: (year: number, month: number, x: number, y: number) => void;
}

/**
 * Main visualization component with optimized rendering settings
 * for high-quality particle effects
 */
const SpiralVisualization: React.FC<SpiralVisualizationProps> = ({
  events,
  config,
  onSpiralClick,
}) => {
  return (
    <div className="w-full h-full bg-black">
      <Canvas 
        camera={{ 
          position: [15, 15, 15], 
          fov: 50,
          near: 0.1,
          far: 1000 
        }}
        gl={{ 
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance",
          depth: true,
          stencil: false, // Optimize memory usage
          logarithmicDepthBuffer: true // Help with z-fighting
        }}
        linear
        dpr={[1, 2]} // Better resolution handling
        shadows={false} // Explicitly disable shadows which can cause issues
        onCreated={({ gl }) => {
          // Add explicit renderer settings to prevent context loss
          gl.setClearColor(new THREE.Color("#000000"), 1);
          
          // Set pixel ratio to improve quality without performance hit
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          
          // Use SRGB color space for better color rendering
          gl.outputColorSpace = THREE.SRGBColorSpace;
          
          // Disable shadow maps for performance
          gl.shadowMap.enabled = false;
          gl.info.autoReset = true; // Auto reset memory stats to prevent leaks
        }}
      >
        <SpiralScene 
          events={events} 
          config={config} 
          onEventClick={onSpiralClick} 
        />
      </Canvas>
    </div>
  );
};

export default SpiralVisualization;
