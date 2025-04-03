
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Enhanced space dust that creates a more immersive galaxy effect
 */
export const CosmicDust: React.FC = () => {
  const particles = useRef<THREE.Points>(null);
  const count = 3000;
  
  // Generate random particles throughout the scene
  const positions = useMemo(() => {
    const posArray = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute particles in a spherical volume
      const radius = 50 * Math.random() + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      posArray[i3] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i3 + 2] = radius * Math.cos(phi);
    }
    
    return posArray;
  }, [count]);
  
  // Generate colors for particles
  const colors = useMemo(() => {
    const colorArray = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Different colors for cosmic dust
      const colorChoices = [
        [0.9, 0.9, 1.0],  // Blue-white
        [1.0, 0.9, 0.8],  // Yellow-white
        [1.0, 0.8, 0.8],  // Pink-white
        [0.8, 1.0, 0.9],  // Green-white
        [0.9, 0.8, 1.0],  // Purple-white
      ];
      
      const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      colorArray[i3] = color[0];
      colorArray[i3 + 1] = color[1];
      colorArray[i3 + 2] = color[2];
    }
    
    return colorArray;
  }, [count]);
  
  // Generate sizes for particles
  const sizes = useMemo(() => {
    const sizeArray = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Vary the size of particles
      sizeArray[i] = Math.random() * 1.5 + 0.2;
    }
    
    return sizeArray;
  }, [count]);
  
  // Create a dust particle texture
  const particleTexture = useMemo(() => {
    return new THREE.TextureLoader().load('/lovable-uploads/ac7515f5-00b3-4d1d-aeb5-91538aa24dd6.png');
  }, []);
  
  useFrame((state) => {
    if (particles.current) {
      // Slowly rotate the entire dust field
      particles.current.rotation.y += 0.0003;
      particles.current.rotation.x += 0.0001;
    }
  });
  
  // We need to set the renderOrder on the group instead of the pointsMaterial
  return (
    <points ref={particles} renderOrder={-1}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.7}
        alphaMap={particleTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false} // Critical fix: prevent depth writing to avoid black shadow
        depthTest={true}   // Still perform depth testing
      />
    </points>
  );
};
