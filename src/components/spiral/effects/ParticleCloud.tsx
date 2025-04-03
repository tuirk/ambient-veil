
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ParticleCloudProps {
  color: string;
  intensity: number;
  isProcessEvent?: boolean;
}

/**
 * Creates a cloud of particles with consistent high-quality rendering
 */
export const ParticleCloud: React.FC<ParticleCloudProps> = ({ 
  color, 
  intensity,
  isProcessEvent = false 
}) => {
  // Reference for animation
  const particlesRef = useRef<THREE.Points>(null);
  
  // Use the high-quality particle texture
  const particleTexture = useMemo(() => {
    return new THREE.TextureLoader().load('/lovable-uploads/aa0fbf13-30c5-4939-8a62-bf7b1f024055.png');
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
    const baseColor = new THREE.Color(color);
    // Calculate complementary colors for variety
    const complementaryColor = new THREE.Color(
      1 - baseColor.r,
      1 - baseColor.g,
      1 - baseColor.b
    ).lerp(baseColor, 0.7); // Mix with original for subtlety
    
    // Intensity affects spread and size
    const spread = isProcessEvent
      ? 0.3 + intensity * 0.07 // More contained for process events
      : 0.4 + intensity * 0.1; // More expansive for one-time events
    
    // Create a more clustered distribution for better visual effect
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Use a more natural particle distribution method
      // This creates better clustering rather than uniform spherical distribution
      let radius, theta, phi;
      
      // Create clusters by using non-uniform distribution
      if (Math.random() < 0.7) {
        // Main cluster - tighter formation
        radius = (Math.random() * 0.7 * spread) * (0.3 + Math.pow(Math.random(), 2.0) * 0.7);
        theta = Math.random() * Math.PI * 2;
        
        // For process events, particles are more stretched along the spiral path
        phi = isProcessEvent
          ? Math.acos((Math.random() * 1.8) - 1.2) // More vertical stretch 
          : Math.acos((Math.random() * 2.2) - 1.1);  // More rounded formation
      } else {
        // Outlier particles - spread further out
        radius = (Math.random() * spread) * (0.7 + Math.random() * 0.3);
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos((Math.random() * 2) - 1);
      }
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color varies between base color and complementary color
      const colorMix = Math.random();
      colors[i3] = baseColor.r * (1 - colorMix * 0.2) + complementaryColor.r * colorMix * 0.2;
      colors[i3 + 1] = baseColor.g * (1 - colorMix * 0.2) + complementaryColor.g * colorMix * 0.2;
      colors[i3 + 2] = baseColor.b * (1 - colorMix * 0.2) + complementaryColor.b * colorMix * 0.2;
      
      // Size varies based on distance from center and intensity
      // Reduced size for more crisp particles
      const sizeMultiplier = isProcessEvent ? 0.5 : 0.8; 
      sizes[i] = (0.07 + Math.random() * 0.12) * (0.5 + intensity * 0.08) * sizeMultiplier;
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [color, intensity, isProcessEvent]);
  
  // Animation for the particle cloud
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // One-time events: slower, gentler rotation
      // Process events: even slower rotation
      const rotationSpeed = isProcessEvent ? 0.03 : 0.08;
      
      // Rotate the particle system
      particlesRef.current.rotation.y += delta * rotationSpeed;
      particlesRef.current.rotation.z += delta * (rotationSpeed * 0.5);
      
      // Pulsate the particles - gentler for both event types
      const time = state.clock.getElapsedTime();
      const pulseIntensity = isProcessEvent ? 0.02 : 0.04;
      const pulseSpeed = isProcessEvent ? 0.8 : 1.2;
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
