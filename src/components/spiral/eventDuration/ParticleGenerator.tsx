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

// Helper function to create color variations
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

// Generate particles distributed along the path
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
  
  // Base size calculation - scales with intensity - ENHANCED VALUES
  // Intensity 1 → 0.9x, Intensity 5 → 1.5x, Intensity 10 → 2.4x
  const baseSizeFactor = 0.9 + startEvent.intensity * 0.15;
  
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
    const spreadFactor = isRoughDate ? 0.6 : 0.4;
    // Scale spread by intensity for more dramatic high-intensity events
    const intensitySpreadScale = 0.8 + startEvent.intensity * 0.04;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    positions[i3] = point.x + randomOffset.x;
    positions[i3 + 1] = point.y + randomOffset.y;
    positions[i3 + 2] = point.z + randomOffset.z;
    
    // Vary the size of particles with intensity scaling and 20% random variation
    // Base size enhanced to 0.35 (from 0.30)
    const baseSize = 0.35 * baseSizeFactor;
    const sizeVariation = 0.2; // 20% variation
    sizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Vary opacity based on position and intensity
    // More intense events get slightly higher base opacity
    const pathProgress = pathIndex / pathLength;
    const baseOpacity = isRoughDate ? 0.08 : 0.12; // Increased from 0.06/0.1
    const intensityOpacityBoost = 0.08 * (startEvent.intensity / 10); // Increased from 0.06
    
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
    
    // Wider spread for background particles
    const spreadFactor = isRoughDate ? 0.9 : 0.65;
    const intensitySpreadScale = 0.8 + startEvent.intensity * 0.05;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    bgPositions[i3] = point.x + randomOffset.x;
    bgPositions[i3 + 1] = point.y + randomOffset.y;
    bgPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Larger but more transparent - ENHANCED SIZE
    const baseSize = 0.45 * baseSizeFactor; // Increased from 0.40
    const sizeVariation = 0.3; // 30% variation
    bgSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Higher opacity for diffuse background glow
    const baseOpacity = 0.06; // Increased from 0.04
    const intensityOpacityBoost = 0.04 * (startEvent.intensity / 10); // Increased from 0.03
    bgOpacities[i] = (baseOpacity + intensityOpacityBoost) * (0.6 + Math.random() * 0.6);
    
    // Slightly varied colors for background
    const variedColor = getColorVariation(baseColor, 0.1);
    bgColors[i3] = variedColor.r;
    bgColors[i3 + 1] = variedColor.g;
    bgColors[i3 + 2] = variedColor.b;
  }
  
  // Tertiary particles - for additional volume and detail - ENHANCED SIZE
  for (let i = 0; i < tertiaryParticleCount; i++) {
    const pathIndex = Math.floor(Math.random() * (pathLength - 1));
    const point = points[pathIndex];
    
    // Medium spread for tertiary particles
    const spreadFactor = isRoughDate ? 0.75 : 0.5;
    const intensitySpreadScale = 0.8 + startEvent.intensity * 0.04;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    terPositions[i3] = point.x + randomOffset.x;
    terPositions[i3 + 1] = point.y + randomOffset.y;
    terPositions[i3 + 2] = point.z + randomOffset.z;
    
    // Medium-sized particles - ENHANCED SIZE
    const baseSize = 0.40 * baseSizeFactor; // Increased from 0.35
    const sizeVariation = 0.25; // 25% variation
    terSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
    
    // Medium opacity - ENHANCED OPACITY
    const baseOpacity = 0.09; // Increased from 0.07
    const intensityOpacityBoost = 0.05 * (startEvent.intensity / 10); // Increased from 0.04
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
