
import React from "react";
import { Stars } from "@react-three/drei";
import { SpaceNebula } from "./SpaceNebula";
import { CosmicDust } from "./CosmicDust";

/**
 * Combined space background with stars, nebula and cosmic dust
 */
export const SpaceBackground: React.FC = () => {
  return (
    <>
      {/* Transparent background - removed the black color */}
      <fogExp2 attach="fog" args={[0x000000, 0.001]} />
      
      {/* Create more detailed 3D space environment */}
      <Stars radius={100} depth={50} count={7000} factor={4} saturation={0.5} fade speed={1} />
      <SpaceNebula />
      <CosmicDust />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </>
  );
};
