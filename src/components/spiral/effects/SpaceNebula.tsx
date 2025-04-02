
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Nebula clouds in the background
 */
export const SpaceNebula: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      // Very slow rotation for the nebula
      mesh.current.rotation.z += 0.0001;
    }
  });
  
  return (
    <mesh ref={mesh} position={[0, 0, -80]}>
      <sphereGeometry args={[70, 32, 32]} />
      <meshBasicMaterial
        color={new THREE.Color(0x2a004c)}
        transparent
        opacity={0.2}
        side={THREE.BackSide}
      />
    </mesh>
  );
};
