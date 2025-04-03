
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { isSeasonalEvent } from "@/utils/seasonalUtils";
import { ParticleData, ParticleGeneratorProps } from "./ParticleTypes";
import { generateParticleLayer } from "./ParticleLayerGenerator";
import { createParticleBuffers, calculateParticleCounts, calculateScalingFactors } from "./ParticleArrayFactory";
import { getPrimaryLayerConfig, getBackgroundLayerConfig, getTertiaryLayerConfig } from "./ParticleLayerConfigs";

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
  // Create particle buffers
  const buffers = createParticleBuffers(
    particleCount,
    backgroundParticleCount,
    tertiaryParticleCount
  );
  
  // Get scaling factors for particles
  const { baseSizeFactor, intensitySpreadScale } = calculateScalingFactors(startEvent);
  
  // Use a warm golden color base instead of the event color
  // This is crucial for restoring the old warm aesthetic
  const baseColor = new THREE.Color("#FFD700"); // Gold base
  
  // Get layer configurations
  const primaryConfig = getPrimaryLayerConfig(baseSizeFactor, isRoughDate);
  const backgroundConfig = getBackgroundLayerConfig(baseSizeFactor);
  const tertiaryConfig = getTertiaryLayerConfig(baseSizeFactor);
  
  // Generate primary particles
  generateParticleLayer(
    points,
    baseColor,
    {
      positions: buffers.primary.positions,
      sizes: buffers.primary.sizes,
      opacities: buffers.primary.opacities,
      colors: buffers.primary.colors,
      count: particleCount,
      ...primaryConfig
    },
    isRoughDate,
    isMinimalDuration,
    intensitySpreadScale
  );
  
  // Generate background particles
  generateParticleLayer(
    points,
    baseColor,
    {
      positions: buffers.secondary.positions,
      sizes: buffers.secondary.sizes,
      opacities: buffers.secondary.opacities,
      colors: buffers.secondary.colors,
      count: backgroundParticleCount,
      ...backgroundConfig
    },
    isRoughDate,
    isMinimalDuration,
    intensitySpreadScale
  );
  
  // Generate tertiary particles
  generateParticleLayer(
    points,
    baseColor,
    {
      positions: buffers.tertiary.positions,
      sizes: buffers.tertiary.sizes,
      opacities: buffers.tertiary.opacities,
      colors: buffers.tertiary.colors,
      count: tertiaryParticleCount,
      ...tertiaryConfig
    },
    isRoughDate,
    isMinimalDuration,
    intensitySpreadScale
  );
  
  // Return data in the expected format
  return { 
    particlePositions: buffers.primary.positions, 
    particleSizes: buffers.primary.sizes, 
    particleOpacities: buffers.primary.opacities,
    particleColors: buffers.primary.colors,
    bgParticlePositions: buffers.secondary.positions,
    bgParticleSizes: buffers.secondary.sizes,
    bgParticleOpacities: buffers.secondary.opacities,
    bgParticleColors: buffers.secondary.colors,
    tertiaryParticlePositions: buffers.tertiary.positions, 
    tertiaryParticleSizes: buffers.tertiary.sizes,
    tertiaryParticleColors: buffers.tertiary.colors,
    tertiaryParticleOpacities: buffers.tertiary.opacities
  };
};
