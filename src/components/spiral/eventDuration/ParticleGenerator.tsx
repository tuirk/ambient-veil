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
 * Distributes particles along a path
 */
const distributeParticlesAlongPath = (
  points: THREE.Vector3[], 
  count: number, 
  isMinimalDuration: boolean
) => {
  const pathLength = points.length;
  const indices: number[] = [];
  
  for (let i = 0; i < count; i++) {
    let pathIndex: number;
    
    // For very short events, cluster particles at the start position
    if (isMinimalDuration) {
      // Keep particles tightly centered on the event point
      pathIndex = Math.floor(Math.random() * Math.min(10, pathLength - 1));
    } else {
      // Distribution weighting logic - emphasize start and end points a bit
      const rand = Math.random();
      if (rand < 0.15) {
        // Near start point - more dense clustering at start
        pathIndex = Math.floor(Math.random() * Math.min(30, pathLength * 0.2));
      } else if (rand > 0.85) {
        // Near end point - more dense clustering at end
        pathIndex = Math.floor(Math.max(pathLength * 0.8, pathLength - 30) + Math.random() * Math.min(30, pathLength * 0.2));
      } else {
        // Distributed throughout middle with slight non-uniformity
        // This creates more natural-looking clusters
        const middleWeight = Math.pow(Math.random(), 1.2); // Slight bias toward earlier points
        pathIndex = Math.floor(middleWeight * (pathLength - 1));
      }
    }
    
    indices.push(pathIndex);
  }
  
  return indices;
};

/**
 * Creates particle positions with natural clustering and appropriate offset
 */
const createParticlePositions = (
  points: THREE.Vector3[],
  indices: number[],
  spreadScale: number,
  isMinimalDuration: boolean
) => {
  const positions = new Float32Array(indices.length * 3);
  
  for (let i = 0; i < indices.length; i++) {
    const pathIndex = indices[i];
    const point = points[pathIndex];
    const i3 = i * 3;
    
    // For minimal duration, use smaller spread to keep particles clustered
    const localSpread = isMinimalDuration ? spreadScale * 0.3 : spreadScale;
    
    // Create more natural clustering by varying the spread based on position
    const offsetDistance = localSpread * (0.2 + Math.random() * 0.5);
    
    // Generate offset direction - slightly biased to create natural clusters
    let offsetX = (Math.random() - 0.5) * 2;
    let offsetY = (Math.random() - 0.5) * 2;
    let offsetZ = (Math.random() - 0.5) * 2;
    
    // Normalize the direction vector
    const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY + offsetZ * offsetZ);
    offsetX /= length;
    offsetY /= length;
    offsetZ /= length;
    
    // Apply the offset scaled by distance
    positions[i3] = point.x + offsetX * offsetDistance;
    positions[i3 + 1] = point.y + offsetY * offsetDistance;
    positions[i3 + 2] = point.z + offsetZ * offsetDistance;
  }
  
  return positions;
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
  // Path length for distribution calculation
  const pathLength = points.length;
  
  // Base color for the event
  const baseColor = new THREE.Color(startEvent.color);
  
  // Get particle distribution indices
  const primaryIndices = distributeParticlesAlongPath(points, particleCount, isMinimalDuration);
  const bgIndices = distributeParticlesAlongPath(points, backgroundParticleCount, isMinimalDuration);
  const terIndices = distributeParticlesAlongPath(points, tertiaryParticleCount, isMinimalDuration);
  
  // Calculate spread factors
  // Seasonal events get more spread to indicate approximate timing
  const baseSpreadFactor = isRoughDate ? 0.25 : 0.15;
  // Scale spread by intensity for more dramatic high-intensity events
  const spreadScale = baseSpreadFactor * intensityScaling.spreadFactor;
  
  // Create particle positions with clustering
  const positions = createParticlePositions(points, primaryIndices, spreadScale, isMinimalDuration);
  const bgPositions = createParticlePositions(points, bgIndices, spreadScale * 1.2, isMinimalDuration);
  const terPositions = createParticlePositions(points, terIndices, spreadScale * 1.1, isMinimalDuration);
  
  // Create arrays for other particle attributes
  const sizes = new Float32Array(particleCount);
  const opacities = new Float32Array(particleCount);
  const colors = new Float32Array(particleCount * 3);
  
  const bgSizes = new Float32Array(backgroundParticleCount);
  const bgOpacities = new Float32Array(backgroundParticleCount);
  const bgColors = new Float32Array(backgroundParticleCount * 3);
  
  const terSizes = new Float32Array(tertiaryParticleCount);
  const terOpacities = new Float32Array(tertiaryParticleCount);
  const terColors = new Float32Array(tertiaryParticleCount * 3);
  
  // Set particle sizes, opacities and colors
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    const pathProgress = primaryIndices[i] / pathLength;
    
    // Primary particles - sharper, more defined
    const baseSize = 0.12 * intensityScaling.sizeFactor;
    sizes[i] = baseSize * (0.85 + Math.random() * 0.3);
    
    // Opacity with slight variation depending on position
    const progressFactor = 4 * (pathProgress * (1 - pathProgress));
    const baseOpacity = isRoughDate ? 0.08 : 0.12;
    opacities[i] = (baseOpacity * intensityScaling.opacityFactor) * 
                   (0.7 + progressFactor * 0.3) * 
                   (0.8 + Math.random() * 0.4);
                   
    // Subtle color variation
    const variedColor = getColorVariation(baseColor, 0.05);
    colors[i3] = variedColor.r;
    colors[i3 + 1] = variedColor.g;
    colors[i3 + 2] = variedColor.b;
  }
  
  // Background particles - larger, more diffuse
  for (let i = 0; i < backgroundParticleCount; i++) {
    const i3 = i * 3;
    
    // Larger but more transparent
    const baseSize = 0.22 * intensityScaling.sizeFactor;
    bgSizes[i] = baseSize * (0.8 + Math.random() * 0.4);
    
    // Lower opacity for diffuse background glow
    const baseOpacity = 0.05;
    bgOpacities[i] = (baseOpacity * intensityScaling.opacityFactor) * (0.6 + Math.random() * 0.6);
    
    // Slightly varied colors for background
    const variedColor = getColorVariation(baseColor, 0.1);
    bgColors[i3] = variedColor.r;
    bgColors[i3 + 1] = variedColor.g;
    bgColors[i3 + 2] = variedColor.b;
  }
  
  // Tertiary particles - for additional volume and detail
  for (let i = 0; i < tertiaryParticleCount; i++) {
    const i3 = i * 3;
    
    // Medium-sized particles
    const baseSize = 0.17 * intensityScaling.sizeFactor;
    terSizes[i] = baseSize * (0.75 + Math.random() * 0.5);
    
    // Medium opacity
    const baseOpacity = 0.08;
    terOpacities[i] = (baseOpacity * intensityScaling.opacityFactor) * (0.7 + Math.random() * 0.5);
    
    // Some color variation
    const variedColor = getColorVariation(baseColor, 0.08);
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
