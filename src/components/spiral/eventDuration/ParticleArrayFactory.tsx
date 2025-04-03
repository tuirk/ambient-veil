
import * as THREE from "three";
import { TimeEvent } from "@/types/event";

// Function to create initialized Float32Array buffers for particle systems
export const createParticleBuffers = (
  primaryCount: number,
  secondaryCount: number,
  tertiaryCount: number
) => {
  return {
    primary: {
      positions: new Float32Array(primaryCount * 3),
      sizes: new Float32Array(primaryCount),
      opacities: new Float32Array(primaryCount),
      colors: new Float32Array(primaryCount * 3),
    },
    secondary: {
      positions: new Float32Array(secondaryCount * 3),
      sizes: new Float32Array(secondaryCount),
      opacities: new Float32Array(secondaryCount),
      colors: new Float32Array(secondaryCount * 3),
    },
    tertiary: {
      positions: new Float32Array(tertiaryCount * 3),
      sizes: new Float32Array(tertiaryCount),
      opacities: new Float32Array(tertiaryCount),
      colors: new Float32Array(tertiaryCount * 3),
    }
  };
};

// Calculate appropriate particle counts based on event intensity
export const calculateParticleCounts = (
  startEvent: TimeEvent, 
  isMinimalDuration: boolean
) => {
  // Base count depends on intensity (1-10 scale)
  const baseMultiplier = 200; // Base number of particles
  const intensityFactor = 1.5 + startEvent.intensity * 0.4;
  
  // For minimal duration, use a fixed count to ensure visibility
  const primaryCount = Math.floor(baseMultiplier * intensityFactor);
  
  // Calculate secondary and tertiary counts as ratios of primary
  const secondaryCount = Math.floor(primaryCount * 0.8);
  const tertiaryCount = Math.floor(primaryCount * 0.5);
  
  return {
    primaryCount,
    secondaryCount,
    tertiaryCount
  };
};

// Calculate scaling factors for particle systems
export const calculateScalingFactors = (startEvent: TimeEvent) => {
  const baseSizeFactor = 0.9 + startEvent.intensity * 0.15;
  const intensitySpreadScale = 0.8 + startEvent.intensity * 0.04;
  
  return {
    baseSizeFactor,
    intensitySpreadScale
  };
};
