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
  // Scale particle count with intensity
  const intensityFactor = Math.pow(startEvent.intensity / 10, 1.5); // Non-linear scaling
  const baseCount = isMinimalDuration ? 150 : 300; // Increased base counts
  
  // Calculate primary count with intensity scaling
  const primaryCount = Math.floor(baseCount * (0.7 + intensityFactor * 0.6));
  
  // Secondary and tertiary counts as ratios of primary
  const secondaryCount = Math.floor(primaryCount * 0.8);
  const tertiaryCount = Math.floor(primaryCount * 0.6);
  
  return {
    primaryCount,
    secondaryCount,
    tertiaryCount
  };
};

// Calculate scaling factors for particle systems
export const calculateScalingFactors = (startEvent: TimeEvent) => {
  // Enhanced intensity scaling
  const baseSizeFactor = 0.8 + Math.pow(startEvent.intensity / 10, 1.3); // Non-linear size scaling
  const intensitySpreadScale = 0.6 + (startEvent.intensity / 10) * 0.8; // Linear spread scaling
  
  return {
    baseSizeFactor,
    intensitySpreadScale
  };
};
