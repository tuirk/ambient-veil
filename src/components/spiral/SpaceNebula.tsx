
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Nebula clouds in the background
 */
export const SpaceNebula: React.FC = () => {
  const mesh = useRef<THREE.Mesh>(null);
  
  // Create a better-optimized nebula texture for more realistic effect
  const nebulaTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a more complex gradient for a softer, nebula-like effect
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(42, 0, 76, 0.2)');  // Center color - very transparent
      gradient.addColorStop(0.4, 'rgba(42, 0, 76, 0.1)'); // Mid gradient - almost invisible
      gradient.addColorStop(1, 'rgba(42, 0, 76, 0)');     // Edge - completely transparent
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
      
      // Add some noise for more realistic space nebula
      for (let i = 0; i < 1000; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(60, 20, 90, ${Math.random() * 0.05})`;
        ctx.fill();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      // Very slow rotation for the nebula
      mesh.current.rotation.z += 0.0001;
    }
  });
  
  return (
    <mesh ref={mesh} position={[0, 0, -100]} renderOrder={-2}>
      <sphereGeometry args={[90, 32, 32]} />
      <meshBasicMaterial
        map={nebulaTexture}
        color={new THREE.Color(0x2a004c)}
        transparent={true}
        opacity={0.12}
        side={THREE.BackSide}
        depthWrite={false}
        depthTest={true}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </mesh>
  );
};
