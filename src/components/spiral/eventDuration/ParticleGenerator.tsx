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
  isMinimalDuration
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
  
  // Base size calculation - scales with intensity
  const baseSizeFactor = 0.6 + startEvent.intensity * 0.1;
  
  // Color variations to make the nebula more interesting
  const baseColor = new THREE.Color(startEvent.color);
  
  // Adjust base color brightness by intensity
  const hsl = {h: 0, s: 0, l: 0};
  baseColor.getHSL(hsl);
  // Intensity affects color brightness - higher intensity = brighter
  hsl.l = Math.max(0.3, Math.min(0.8, 0.3 + (startEvent.intensity / 10) * 0.5));
  baseColor.setHSL(hsl.h, hsl.s, hsl.l);
  
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
    // Intensity affects spread - higher intensity = more volume
    // Seasonal events get more spread to indicate approximate timing
    const spreadFactor = isRoughDate ? 0.6 : 0.4;
    // Scale spread by intensity for more dramatic high-intensity events
    const intensitySpreadScale = 0.6 + startEvent.intensity * 0.08;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    positions[i3] = point.x + randomOffset.x;
    positions[i3 + 1] = point.y + randomOffset.y;
    positions[i3 + 2] = point.z + randomOffset.z;
    
    // Intensity affects particle size
    const baseSize = 0.2 + 0.05 * startEvent.intensity / 10;
    const sizeVariation = 0.2; // 20% variation
    sizes[i] = baseSize * baseSizeFactor * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Intensity affects opacity
    // Vary opacity based on position and intensity
    // More intense events get significantly higher opacity
    const pathProgress = pathIndex / pathLength;
    const baseOpacity = isRoughDate ? 0.05 : 0.08;
    const intensityOpacityBoost = 0.15 * (startEvent.intensity / 10);
    
    // Opacity curve - slightly stronger in the middle of the path
    const progressFactor = 4 * (pathProgress * (1 - pathProgress));
    opacities[i] = (baseOpacity + intensityOpacityBoost) * 
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
    
    // Intensity affects spread for background particles
    // Wider spread for background particles
    const spreadFactor = isRoughDate ? 0.9 : 0.65;
    const intensitySpreadScale = 0.7 + startEvent.intensity * 0.07;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    bgPositions[i3] = point.x + randomOffset.x;
    bgPositions[i3 + 1] = point.y + randomOffset.y;
    bgPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Intensity affects background particle size
    // Larger but more transparent
    const baseSize = 0.3 + 0.06 * startEvent.intensity / 10;
    const sizeVariation = 0.3; // 30% variation
    bgSizes[i] = baseSize * baseSizeFactor * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Intensity affects background opacity
    // Higher opacity for diffuse background glow
    const baseOpacity = 0.04;
    const intensityOpacityBoost = 0.08 * (startEvent.intensity / 10);
    bgOpacities[i] = (baseOpacity + intensityOpacityBoost) * (0.6 + Math.random() * 0.6);
    
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
    
    // Intensity affects tertiary particles spread
    // Medium spread for tertiary particles
    const spreadFactor = isRoughDate ? 0.75 : 0.5;
    const intensitySpreadScale = 0.7 + startEvent.intensity * 0.06;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    terPositions[i3] = point.x + randomOffset.x;
    terPositions[i3 + 1] = point.y + randomOffset.y;
    terPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Intensity affects tertiary particle size
    // Medium-sized particles
    const baseSize = 0.25 + 0.055 * startEvent.intensity / 10;
    const sizeVariation = 0.25; // 25% variation
    terSizes[i] = baseSize * baseSizeFactor * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Intensity affects tertiary opacity
    // Medium opacity
    const baseOpacity = 0.06;
    const intensityOpacityBoost = 0.1 * (startEvent.intensity / 10);
    terOpacities[i] = (baseOpacity + intensityOpacityBoost) * (0.7 + Math.random() * 0.5);
    
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
