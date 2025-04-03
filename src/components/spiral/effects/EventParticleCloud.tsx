
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getIntensityScaling, createParticleTexture } from "../eventDuration/ParticleTextures";

interface EventParticleCloudProps {
  color: string;
  intensity: number;
  isProcessEvent?: boolean;
}

export const EventParticleCloud: React.FC<EventParticleCloudProps> = ({ 
  color, 
  intensity,
  isProcessEvent = false 
}) => {
  // Reference for animation
  const particlesRef = useRef<THREE.Points>(null);
  
  // Get standardized intensity scaling
  const intensityScaling = getIntensityScaling(intensity);
  
  // Use consistent shared texture
  const particleTexture = useMemo(() => createParticleTexture(), []);
  
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
    const baseColor = new THREE.Color(color);
    // Calculate complementary colors for variety
    const complementaryColor = new THREE.Color(
      1 - baseColor.r,
      1 - baseColor.g,
      1 - baseColor.b
    ).lerp(baseColor, 0.7); // Mix with original for subtlety
    
    // Intensity affects spread and size
    const spread = isProcessEvent
      ? 0.3 + intensity * 0.1 * intensityScaling.spreadFactor // More contained for process events
      : 0.6 + intensity * 0.2 * intensityScaling.spreadFactor; // More expansive for one-time events
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create a spherical distribution with some randomization
      const radius = (Math.random() * spread) * (0.1 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      
      // For process events, particles are more stretched along the spiral path
      const phi = isProcessEvent
        ? Math.acos((Math.random() * 1.5) - 1) // More vertical stretch
        : Math.acos((Math.random() * 2) - 1);  // Even distribution
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color varies between base color and complementary color
      const colorMix = Math.random();
      colors[i3] = baseColor.r * (1 - colorMix) + complementaryColor.r * colorMix;
      colors[i3 + 1] = baseColor.g * (1 - colorMix) + complementaryColor.g * colorMix;
      colors[i3 + 2] = baseColor.b * (1 - colorMix) + complementaryColor.b * colorMix;
      
      // Size varies based on distance from center and intensity
      const sizeMultiplier = isProcessEvent ? 0.6 : 0.9;
      sizes[i] = (0.07 + Math.random() * 0.12) * 
                 (0.5 + intensity * 0.1) * 
                 sizeMultiplier * 
                 intensityScaling.sizeFactor;
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [color, intensity, isProcessEvent, intensityScaling]);
  
  // Animation for the particle cloud - scaled by intensity
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // One-time events: faster rotation, more dynamic
      // Process events: slower, more stable rotation
      const baseRotationSpeed = isProcessEvent ? 0.05 : 0.15;
      const rotationSpeed = baseRotationSpeed * intensityScaling.animationFactor;
      
      // Rotate the particle system
      particlesRef.current.rotation.y += delta * rotationSpeed;
      particlesRef.current.rotation.z += delta * (rotationSpeed * 0.5);
      
      // Pulsate the particles - stronger for one-time events, scaled by intensity
      const time = state.clock.getElapsedTime();
      const basePulseIntensity = isProcessEvent ? 0.03 : 0.08;
      const pulseIntensity = basePulseIntensity * intensityScaling.pulseFactor;
      const basePulseSpeed = isProcessEvent ? 1.5 : 2.5;
      const pulseSpeed = basePulseSpeed * intensityScaling.animationFactor;
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
        size={0.15}
        vertexColors
        transparent
        alphaMap={particleTexture}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={true}
        sizeAttenuation={true}
        alphaTest={0.01}
      />
    </points>
  );
};
