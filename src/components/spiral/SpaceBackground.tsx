
import React from "react";
import { Stars } from "@react-three/drei";

/**
 * Combined space background with stars, nebula and cosmic dust
 * MUST be used within a Canvas component
 */
export const SpaceBackground: React.FC = () => {
  return (
    <>
      {/* Enhanced space background */}
      <color attach="background" args={["#010203"]} />
      {/* Removed fogExp2 that was contributing to black shadow */}
      
      {/* Create more detailed 3D space environment */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0.5} fade speed={1} />
      
      <ambientLight intensity={0.4} /> {/* Increased slightly from 0.3 */}
      <directionalLight position={[10, 10, 5]} intensity={0.6} /> {/* Increased slightly from 0.5 */}
    </>
  );
};
