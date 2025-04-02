
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({ 
  event, 
  startYear, 
  zoom 
}) => {
  // Get the base position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // References for animation
  const particlesRef = useRef<THREE.Points>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Create texture for particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Generate particles for nebula effect
  const { particlePositions, particleColors, particleSizes } = useMemo(() => {
    const count = 100 + Math.floor(event.intensity * 30);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    // Convert event color to THREE.Color
    const baseColor = new THREE.Color(event.color);
    // Calculate complementary colors for variety
    const complementaryColor = new THREE.Color(
      1 - baseColor.r,
      1 - baseColor.g,
      1 - baseColor.b
    ).lerp(baseColor, 0.7); // Mix with original for subtlety
    
    // Intensity affects spread and size
    const spread = 0.5 + event.intensity * 0.15;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Create a spherical distribution with some randomization
      const radius = (Math.random() * spread) * (0.1 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Color varies between base color and complementary color
      const colorMix = Math.random();
      colors[i3] = baseColor.r * (1 - colorMix) + complementaryColor.r * colorMix;
      colors[i3 + 1] = baseColor.g * (1 - colorMix) + complementaryColor.g * colorMix;
      colors[i3 + 2] = baseColor.b * (1 - colorMix) + complementaryColor.b * colorMix;
      
      // Size varies based on distance from center and intensity
      sizes[i] = (0.1 + Math.random() * 0.3) * (0.5 + event.intensity * 0.1);
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [event.color, event.intensity]);
  
  // Animation for the cosmic effect
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Rotate the particle system slowly
      particlesRef.current.rotation.y += delta * 0.1;
      particlesRef.current.rotation.z += delta * 0.05;
      
      // Pulsate the particles slightly
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * 2) * 0.05;
      particlesRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      // Pulsate the glow
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.2;
      glowRef.current.scale.set(
        0.8 + event.intensity * 0.1 * pulseScale, 
        0.8 + event.intensity * 0.1 * pulseScale, 
        1
      );
    }
    
    if (ringRef.current) {
      // Rotate the ring continuously
      ringRef.current.rotation.z += delta * 0.3;
    }
  });
  
  // Create a tint color for the glow based on event color
  const glowColor = new THREE.Color(event.color);
  
  return (
    <group position={position}>
      {/* Particle cloud for nebula effect */}
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
      
      {/* Glow sprite for the central core */}
      <sprite ref={glowRef}>
        <spriteMaterial
          map={particleTexture}
          color={glowColor}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* Thin glowing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.35, 64]} />
        <meshBasicMaterial
          color={event.color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Point light for illumination */}
      <pointLight 
        color={event.color} 
        intensity={0.5 + event.intensity * 0.2}
        distance={3}
        decay={2}
      />
    </group>
  );
};
