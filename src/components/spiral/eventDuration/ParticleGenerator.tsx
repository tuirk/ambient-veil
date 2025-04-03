
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { isSeasonalEvent } from "@/utils/seasonalUtils";

interface ParticleData {
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
}

export interface ParticleGeneratorProps {
  points: THREE.Vector3[];
  particleCount: number;
  backgroundParticleCount: number;
  tertiaryParticleCount: number;
  startEvent: TimeEvent;
  isRoughDate: boolean;
  isMinimalDuration: boolean;
  intensityScaling: {
    particleCountFactor: number;
    sizeFactor: number;
    spreadFactor: number;
    opacityFactor: number;
    animationFactor: number;
    pulseFactor: number;
  };
}

/**
 * Helper function to create color variations
 * Creates subtle variations while maintaining overall color identity
 */
export const getColorVariation = (baseColor: THREE.Color, strength: number = 0.05) => {
  const newColor = baseColor.clone();
  
  // Small random shifts in hue
  const hsl: {h: number, s: number, l: number} = {h: 0, s: 0, l: 0};
  newColor.getHSL(hsl);
  
  // Keep exact same hue, only vary saturation and lightness slightly
  hsl.s += (Math.random() - 0.5) * strength;
  hsl.l += (Math.random() - 0.5) * strength;
  
  // Ensure values stay in valid range
  hsl.s = Math.max(0, Math.min(1, hsl.s));
  hsl.l = Math.max(0.2, Math.min(0.9, hsl.l));
  
  newColor.setHSL(hsl.h, hsl.s, hsl.l);
  return newColor;
};

/**
 * Generates particles distributed along a path with optimized settings
 * for high-quality, crisp particle rendering.
 */
export const generateParticles = ({
  points,
  particleCount,
  backgroundParticleCount,
  tertiaryParticleCount,
  startEvent,
  isRoughDate,
  isMinimalDuration,
  intensityScaling
}: ParticleGeneratorProps): ParticleData => {
  // Primary particles (sharper, more defined)
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);
  
  // Background particles (more diffuse, larger)
  const bgPositions = new Float32Array(backgroundParticleCount * 3);
  const bgSizes = new Float32Array(backgroundParticleCount);
  const bgOpacities = new Float32Array(backgroundParticleCount);
  const bgColors = new Float32Array(backgroundParticleCount * 3);
  
  // Tertiary particles (for additional volume and variety)
  const terPositions = new Float32Array(tertiaryParticleCount * 3);
  const terSizes = new Float32Array(tertiaryParticleCount);
  const terOpacities = new Float32Array(tertiaryParticleCount);
  const terColors = new Float32Array(tertiaryParticleCount * 3);
  
  // Path length for distribution calculation
  const pathLength = points.length;
  
  // Base size calculation - scaled with intensity
  const baseSizeFactor = intensityScaling.sizeFactor;
  
  // Color variations to make the nebula more interesting
  const baseColor = new THREE.Color(startEvent.color);
  
  // Primary particles
  for (let i = 0; i < particleCount; i++) {
    // Distribute particles along the path with slight weighting toward ends
    let pathIndex: number;
    
    // For very short events, cluster particles at the start position
    if (isMinimalDuration) {
      pathIndex = Math.floor(Math.random() * Math.min(30, pathLength - 1));
    } else {
      // Distribution weighting logic - emphasize start and end points a bit
      const rand = Math.random();
      if (rand < 0.1) {
        // Near start point
        pathIndex = Math.floor(Math.random() * Math.min(30, pathLength * 0.2));
      } else if (rand > 0.9) {
        // Near end point
        pathIndex = Math.floor(Math.max(pathLength * 0.8, pathLength - 30) + Math.random() * Math.min(30, pathLength * 0.2));
      } else {
        // Distributed throughout middle
        pathIndex = Math.floor(Math.random() * (pathLength - 1));
      }
    }
    
    const point = points[pathIndex];
    
    // Add some random offset to create volume around the line
    // Seasonal events get more spread to indicate approximate timing
    const spreadFactor = isRoughDate ? 0.5 : 0.3;
    // Scale spread by intensity for more dramatic high-intensity events
    const spreadScale = spreadFactor * intensityScaling.spreadFactor;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale
    );
    
    const i3 = i * 3;
    positions[i3] = point.x + randomOffset.x;
    positions[i3 + 1] = point.y + randomOffset.y;
    positions[i3 + 2] = point.z + randomOffset.z;
    
    // Particle size that scales with intensity
    const baseSize = 0.15 * baseSizeFactor;
    const sizeVariation = 0.15; // 15% variation
    sizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Opacity based on position and intensity
    const pathProgress = pathIndex / pathLength;
    const baseOpacity = isRoughDate ? 0.06 : 0.1;
    
    // Opacity curve - slightly stronger in the middle of the path
    const progressFactor = 4 * (pathProgress * (1 - pathProgress));
    opacities[i] = (baseOpacity * intensityScaling.opacityFactor) * 
                   (0.7 + progressFactor * 0.3) * 
                   (0.8 + Math.random() * 0.4); // Add some random variation
    
    // Add color variations
    const variedColor = getColorVariation(baseColor);
    colors[i3] = variedColor.r;
    colors[i3 + 1] = variedColor.g;
    colors[i3 + 2] = variedColor.b;
  }
  
  // Background particles - larger, more diffuse
  for (let i = 0; i < backgroundParticleCount; i++) {
    const pathIndex = Math.floor(Math.random() * (pathLength - 1));
    const point = points[pathIndex];
    
    // Wider spread for background particles
    const spreadFactor = isRoughDate ? 0.7 : 0.5;
    const spreadScale = spreadFactor * intensityScaling.spreadFactor;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale
    );
    
    const i3 = i * 3;
    bgPositions[i3] = point.x + randomOffset.x;
    bgPositions[i3 + 1] = point.y + randomOffset.y;
    bgPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Larger but more transparent
    const baseSize = 0.26 * baseSizeFactor;
    const sizeVariation = 0.2; // 20% variation
    bgSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Lower opacity for diffuse background glow
    const baseOpacity = 0.04;
    bgOpacities[i] = (baseOpacity * intensityScaling.opacityFactor) * (0.6 + Math.random() * 0.6);
    
    // Slightly varied colors for background
    const variedColor = getColorVariation(baseColor, 0.1);
    bgColors[i3] = variedColor.r;
    bgColors[i3 + 1] = variedColor.g;
    bgColors[i3 + 2] = variedColor.b;
  }
  
  // Tertiary particles - for additional volume and detail
  for (let i = 0; i < tertiaryParticleCount; i++) {
    const pathIndex = Math.floor(Math.random() * (pathLength - 1));
    const point = points[pathIndex];
    
    // Medium spread for tertiary particles
    const spreadFactor = isRoughDate ? 0.6 : 0.4;
    const spreadScale = spreadFactor * intensityScaling.spreadFactor;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale,
      (Math.random() - 0.5) * spreadScale
    );
    
    const i3 = i * 3;
    terPositions[i3] = point.x + randomOffset.x;
    terPositions[i3 + 1] = point.y + randomOffset.y;
    terPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Medium-sized particles
    const baseSize = 0.20 * baseSizeFactor;
    const sizeVariation = 0.25; // 25% variation
    terSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Medium opacity
    const baseOpacity = 0.07;
    terOpacities[i] = (baseOpacity * intensityScaling.opacityFactor) * (0.7 + Math.random() * 0.5);
    
    // Some color variation
    const variedColor = getColorVariation(baseColor, 0.1);
    terColors[i3] = variedColor.r;
    terColors[i3 + 1] = variedColor.g;
    terColors[i3 + 2] = variedColor.b;
  }
  
  return { 
    particlePositions: positions, 
    particleSizes: sizes, 
    particleOpacities: opacities,
    particleColors: colors,
    bgParticlePositions: bgPositions,
    bgParticleSizes: bgSizes,
    bgParticleOpacities: bgOpacities,
    bgParticleColors: bgColors,
    tertiaryParticlePositions: terPositions, 
    tertiaryParticleSizes: terSizes,
    tertiaryParticleColors: terColors,
    tertiaryParticleOpacities: terOpacities
  };
};
