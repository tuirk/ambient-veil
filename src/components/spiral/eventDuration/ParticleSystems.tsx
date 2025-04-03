
import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface ParticleSystemProps {
  particlePositions: Float32Array;
  particleSizes: Float32Array;
  particleColors: Float32Array;
  texture: THREE.Texture;
  size: number;
  opacity: number;
  pulseIntensity?: number;
  pulseSpeed?: number;
  animationSpeed?: number;
  animationAmplitude?: number;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particlePositions,
  particleSizes,
  particleColors,
  texture,
  size,
  opacity,
  pulseIntensity = 0.05,
  pulseSpeed = 0.2,
  animationSpeed = 0.003,
  animationAmplitude = 0.01
}) => {
  const ref = useRef<THREE.Points>(null);
  
  // Subtle animation for the dust trail
  useFrame((state, delta) => {
    if (ref.current) {
      // Time-based animation
      const time = state.clock.getElapsedTime();
      
      // Very slow subtle drift
      ref.current.rotation.y += delta * animationSpeed;
      
      // Subtle breathing effect
      const pulse = Math.sin(time * pulseSpeed) * pulseIntensity;
      
      // Scale pulse to create a breathing effect
      ref.current.scale.set(
        1 + pulse, 
        1 + pulse, 
        1 + pulse
      );
      
      // Additional subtle noise movement along all axes
      const noiseX = Math.sin(time * 0.3) * 0.001;
      const noiseY = Math.cos(time * 0.3) * 0.001;
      const noiseZ = Math.sin(time * 0.4) * 0.001;
      
      ref.current.position.x += noiseX;
      ref.current.position.y += noiseY;
      ref.current.position.z += noiseZ;
    }
  });
  
  const itemSize = particlePositions.length / 3;
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={itemSize}
          array={particlePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={itemSize}
          array={particleSizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-color"
          count={itemSize}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        vertexColors
        transparent
        opacity={opacity}
        depthWrite={false}
        map={texture}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
};

export const ParticleSystemGroup: React.FC<{
  data: {
    particlePositions: Float32Array;
    particleSizes: Float32Array;
    particleOpacities: Float32Array;
    particleColors: Float32Array;
    bgParticlePositions: Float32Array;
    bgParticleSizes: Float32Array;
    bgParticleOpacities: Float32Array;
    bgParticleColors: Float32Array;
    tertiaryParticlePositions: Float32Array;
    tertiaryParticleSizes: Float32Array;
    tertiaryParticleColors: Float32Array;
    tertiaryParticleOpacities: Float32Array;
  };
  textures: {
    particleTexture: THREE.Texture;
    glowTexture: THREE.Texture;
  };
  intensity: number;
}> = ({ data, textures, intensity }) => {
  // Animation factors linked to intensity
  const animationSpeed = 0.003 * (0.7 + intensity * 0.05);
  const animationAmplitude = 0.01 * (0.7 + intensity * 0.05);

  return (
    <group>
      {/* Primary particle dust - sharper, more defined */}
      <ParticleSystem
        particlePositions={data.particlePositions}
        particleSizes={data.particleSizes}
        particleColors={data.particleColors}
        texture={textures.particleTexture}
        size={0.35}
        opacity={0.9}
        animationSpeed={animationSpeed}
        animationAmplitude={animationAmplitude}
        pulseSpeed={0.2}
        pulseIntensity={animationAmplitude}
      />
      
      {/* Secondary particle layer - more diffuse background glow */}
      <ParticleSystem
        particlePositions={data.bgParticlePositions}
        particleSizes={data.bgParticleSizes}
        particleColors={data.bgParticleColors}
        texture={textures.glowTexture}
        size={0.45}
        opacity={0.7}
        animationSpeed={animationSpeed * 0.7}
        animationAmplitude={animationAmplitude * 1.2}
        pulseSpeed={0.15}
        pulseIntensity={animationAmplitude * 1.2}
      />
      
      {/* Tertiary particle layer - intermediate size and opacity */}
      <ParticleSystem
        particlePositions={data.tertiaryParticlePositions}
        particleSizes={data.tertiaryParticleSizes}
        particleColors={data.tertiaryParticleColors}
        texture={textures.particleTexture}
        size={0.40}
        opacity={0.8}
        animationSpeed={animationSpeed * 0.4 * -1} // Negative to go in opposite direction
        animationAmplitude={animationAmplitude * 1.5}
        pulseSpeed={0.1}
        pulseIntensity={animationAmplitude * 1.5}
      />
    </group>
  );
};
