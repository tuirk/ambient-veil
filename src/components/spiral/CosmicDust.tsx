
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Enhanced space dust that creates a more immersive galaxy effect
 */
export const CosmicDust: React.FC = () => {
  const particles = useRef<THREE.Points>(null);
  const count = 3000;
  
  // Generate random particles throughout the scene
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    // Distribute particles in a spherical volume
    const radius = 50 * Math.random() + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Different colors for cosmic dust
    const colorChoices = [
      [0.9, 0.9, 1.0],  // Blue-white
      [1.0, 0.9, 0.8],  // Yellow-white
      [1.0, 0.8, 0.8],  // Pink-white
      [0.8, 1.0, 0.9],  // Green-white
      [0.9, 0.8, 1.0],  // Purple-white
    ];
    
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    colors[i3] = color[0];
    colors[i3 + 1] = color[1];
    colors[i3 + 2] = color[2];
    
    // Vary the size of particles
    sizes[i] = Math.random() * 1.5 + 0.2;
  }
  
  useFrame((state) => {
    if (particles.current) {
      // Slowly rotate the entire dust field
      particles.current.rotation.y += 0.0003;
      particles.current.rotation.x += 0.0001;
    }
  });
  
  return (
    <points ref={particles}>
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
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/ac7515f5-00b3-4d1d-aeb5-91538aa24dd6.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
