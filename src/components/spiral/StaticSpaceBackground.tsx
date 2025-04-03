
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

/**
 * A version of the space background that can be used outside of a Three.js Canvas
 * This is a standalone component that includes its own Canvas
 */
export const StaticSpaceBackground: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 1] }}
        gl={{ 
          antialias: true,
          alpha: false,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        linear
        dpr={[1, 2]}
      >
        <color attach="background" args={["#010203"]} />
        <fogExp2 attach="fog" args={[0x000000, 0.001]} />
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0.5} fade speed={1} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
      </Canvas>
    </div>
  );
};
