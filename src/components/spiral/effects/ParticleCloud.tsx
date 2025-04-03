import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ParticleCloudProps {
  color: string;
  intensity: number;
  isProcessEvent?: boolean;
}

export const ParticleCloud: React.FC<ParticleCloudProps> = ({ 
  color, 
  intensity,
  isProcessEvent = false 
}) => {
  // Reference for animation
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create texture for particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 250, 230, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 240, 220, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Generate particles for nebula effect
  const { particlePositions, particleColors, particleSizes } = useMemo(() => {
    // One-time events have more concentrated, brighter particles
    // Process events have more spread-out, diffuse particles
    const count = isProcessEvent 
      ? 80 + Math.floor(intensity * 20) // Fewer particles for process events
      : 120 + Math.floor(intensity * 40); // More particles for one-time events
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    // Convert event color to THREE.Color
    const baseColor = new THREE.Color("#FFD700");
    // Calculate complementary colors for variety
    const complementaryColor = new THREE.Color("#FFFFFF");
    
    // Intensity affects spread and size
    const spread = isProcessEvent
      ? 0.3 + intensity * 0.1
      : 0.6 + intensity * 0.2;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create a spherical distribution with some randomization
      const radius = (Math.random() * spread) * (0.1 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      
      // For process events, particles are more stretched along the spiral path
      const phi = isProcessEvent
        ? Math.acos((Math.random() * 1.5) - 1)
        : Math.acos((Math.random() * 2) - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color varies between gold and white
      const colorMix = Math.random();
      
      // Mix between colors, ensuring warmth by limiting the blue component
      colors[i3] = baseColor.r * (1 - colorMix) + complementaryColor.r * colorMix;
      colors[i3 + 1] = baseColor.g * (1 - colorMix) + complementaryColor.g * colorMix;
      colors[i3 + 2] = baseColor.b * (1 - colorMix) + (complementaryColor.b * colorMix * 0.8);
      
      // Size varies based on distance from center and intensity
      const sizeMultiplier = isProcessEvent ? 0.7 : 1.2;
      sizes[i] = (0.1 + Math.random() * 0.3) * (0.5 + intensity * 0.1) * sizeMultiplier;
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [color, intensity, isProcessEvent]);
  
  // Animation for the particle cloud
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // One-time events: faster rotation, more dynamic
      // Process events: slower, more stable rotation
      const rotationSpeed = isProcessEvent ? 0.05 : 0.15;
      
      // Rotate the particle system
      particlesRef.current.rotation.y += delta * rotationSpeed;
      particlesRef.current.rotation.z += delta * (rotationSpeed * 0.5);
      
      // Pulsate the particles - stronger for one-time events
      const time = state.clock.getElapsedTime();
      const pulseIntensity = isProcessEvent ? 0.03 : 0.08;
      const pulseSpeed = isProcessEvent ? 1.5 : 2.5;
      const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      particlesRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlePositions.length / 3}
          array={particlePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleColors.length / 3}
          array={particleColors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleSizes.length}
          array={particleSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        vertexColors
        transparent
        alphaMap={particleTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
