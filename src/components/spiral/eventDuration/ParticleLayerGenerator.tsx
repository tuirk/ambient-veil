
import * as THREE from "three";
import { getWarmColorVariation } from "./ColorUtils";

// Interface for particle layer configuration
export interface ParticleLayerConfig {
  positions: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
  colors: Float32Array;
  count: number;
  baseSize: number;
  baseOpacity: number;
  spreadFactor: number;
  sizeVariation: number;
  colorVariation: number;
}

// Function to generate a single particle layer
export const generateParticleLayer = (
  points: THREE.Vector3[],
  baseColor: THREE.Color,
  config: ParticleLayerConfig,
  isRoughDate: boolean,
  isMinimalDuration: boolean,
  intensitySpreadScale: number
): void => {
  const pathLength = points.length;
  
  for (let i = 0; i < config.count; i++) {
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
    const spreadFactor = isRoughDate ? config.spreadFactor * 1.5 : config.spreadFactor;
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
      (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
    );
    
    const i3 = i * 3;
    config.positions[i3] = point.x + randomOffset.x;
    config.positions[i3 + 1] = point.y + randomOffset.y;
    config.positions[i3 + 2] = point.z + randomOffset.z;
    
    // Vary the size of particles
    config.sizes[i] = config.baseSize * (1 - config.sizeVariation/2 + Math.random() * config.sizeVariation);
    
    // Vary opacity based on position and intensity
    const pathProgress = pathIndex / pathLength;
    
    // Opacity curve - slightly stronger in the middle of the path
    const progressFactor = 4 * (pathProgress * (1 - pathProgress));
    config.opacities[i] = config.baseOpacity * 
                   (0.7 + progressFactor * 0.3) * 
                   (0.8 + Math.random() * 0.4); // Add some random variation
    
    // Apply warm color variation - this is the key change to restore the old look
    const variedColor = getWarmColorVariation(baseColor, config.colorVariation);
    config.colors[i3] = variedColor.r;
    config.colors[i3 + 1] = variedColor.g;
    config.colors[i3 + 2] = variedColor.b;
  }
};
