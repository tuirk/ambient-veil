
import { ParticleLayerParams } from "./ParticleTypes";

// Get configuration parameters for the primary particle layer
export const getPrimaryLayerConfig = (baseSizeFactor: number, isRoughDate: boolean): ParticleLayerParams => {
  return {
    baseSize: 0.35 * baseSizeFactor,
    baseOpacity: isRoughDate ? 0.08 : 0.12,
    spreadFactor: 0.4,
    sizeVariation: 0.2,
    colorVariation: 0.05
  };
};

// Get configuration parameters for the background particle layer
export const getBackgroundLayerConfig = (baseSizeFactor: number): ParticleLayerParams => {
  return {
    baseSize: 0.45 * baseSizeFactor,
    baseOpacity: 0.06,
    spreadFactor: 0.65,
    sizeVariation: 0.3,
    colorVariation: 0.1
  };
};

// Get configuration parameters for the tertiary particle layer
export const getTertiaryLayerConfig = (baseSizeFactor: number): ParticleLayerParams => {
  return {
    baseSize: 0.40 * baseSizeFactor,
    baseOpacity: 0.09,
    spreadFactor: 0.5,
    sizeVariation: 0.25,
    colorVariation: 0.1
  };
};
