
import React, { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getIntensityScaling } from "./ParticleTextures";

interface ParticleSystemProps {
  particlePositions: Float32Array;
  particleSizes: Float32Array;
  particleColors: Float32Array;
  texture: THREE.Texture;
  size: number;
  opacity: number;
  intensity: number;
  pulseIntensity?: number;
  pulseSpeed?: number;
  animationSpeed?: number;
  animationAmplitude?: number;
}

/**
 * Core particle system component with optimized rendering settings
 * for high-quality, crisp particles.
 */
export const ParticleSystem: React.FC<ParticleSystemProps> = ({
  particlePositions,
  particleSizes,
  particleColors,
  texture,
  size,
  opacity,
  intensity,
  pulseIntensity = 0.05,
  pulseSpeed = 0.2,
  animationSpeed = 0.003,
  animationAmplitude = 0.01
}) => {
  const ref = useRef<THREE.Points>(null);
  
  // Get standard intensity scaling
  const intensityScaling = getIntensityScaling(intensity);
  
  // Subtle animation for the dust trail
  useFrame((state, delta) => {
    if (ref.current) {
      // Time-based animation
      const time = state.clock.getElapsedTime();
      
      // Very slow subtle drift - scaled by intensity
      ref.current.rotation.y += delta * animationSpeed * intensityScaling.animationFactor;
      
      // Subtle breathing effect - scaled by intensity
      const pulse = Math.sin(time * pulseSpeed) * 
                    pulseIntensity * 
                    intensityScaling.pulseFactor;
      
      // Scale pulse to create a breathing effect
      ref.current.scale.set(
        1 + pulse, 
        1 + pulse, 
        1 + pulse
      );
      
      // Additional subtle noise movement along all axes - scaled by intensity
      const noiseScale = animationAmplitude * intensityScaling.animationFactor;
      const noiseX = Math.sin(time * 0.3) * noiseScale;
      const noiseY = Math.cos(time * 0.3) * noiseScale;
      const noiseZ = Math.sin(time * 0.4) * noiseScale;
      
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
        alphaTest={0.01}
      />
    </points>
  );
};

/**
 * Group of particle systems that work together to create a layered effect
 * with consistent, high-quality particles.
 */
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
    coreTexture: THREE.Texture;
  };
  intensity: number;
}> = ({ data, textures, intensity }) => {
  // Get standard intensity scaling
  const intensityScaling = getIntensityScaling(intensity);
  
  // Base animation values scaled by intensity
  const animationSpeed = 0.003 * intensityScaling.animationFactor;
  const pulseSpeed = 0.2 * intensityScaling.animationFactor;
  const pulseIntensity = 0.05 * intensityScaling.pulseFactor;

  return (
    <group>
      {/* Primary particle dust - sharper, more defined */}
      <ParticleSystem
        particlePositions={data.particlePositions}
        particleSizes={data.particleSizes}
        particleColors={data.particleColors}
        texture={textures.coreTexture}
        size={0.2 * intensityScaling.sizeFactor}
        opacity={0.9 * intensityScaling.opacityFactor}
        intensity={intensity}
        animationSpeed={animationSpeed}
        animationAmplitude={0.01 * intensityScaling.animationFactor}
        pulseSpeed={pulseSpeed}
        pulseIntensity={pulseIntensity}
      />
      
      {/* Secondary particle layer - more diffuse background glow */}
      <ParticleSystem
        particlePositions={data.bgParticlePositions}
        particleSizes={data.bgParticleSizes}
        particleColors={data.bgParticleColors}
        texture={textures.glowTexture}
        size={0.3 * intensityScaling.sizeFactor}
        opacity={0.6 * intensityScaling.opacityFactor}
        intensity={intensity}
        animationSpeed={animationSpeed * 0.7}
        animationAmplitude={0.01 * intensityScaling.animationFactor * 1.2}
        pulseSpeed={pulseSpeed * 0.75}
        pulseIntensity={pulseIntensity * 1.2}
      />
      
      {/* Tertiary particle layer - intermediate size and opacity */}
      <ParticleSystem
        particlePositions={data.tertiaryParticlePositions}
        particleSizes={data.tertiaryParticleSizes}
        particleColors={data.tertiaryParticleColors}
        texture={textures.particleTexture}
        size={0.25 * intensityScaling.sizeFactor}
        opacity={0.7 * intensityScaling.opacityFactor}
        intensity={intensity}
        animationSpeed={animationSpeed * 0.4 * -1} // Negative to go in opposite direction
        animationAmplitude={0.01 * intensityScaling.animationFactor * 1.5}
        pulseSpeed={pulseSpeed * 0.5}
        pulseIntensity={pulseIntensity * 1.5}
      />
    </group>
  );
};
