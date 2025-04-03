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
    // Distribution weighting logic - emphasize start and end points
    let pathIndex: number;
    
    if (isMinimalDuration) {
      // For minimal durations, cluster near start
      pathIndex = Math.floor(Math.random() * Math.min(20, pathLength - 1));
    } else {
      const rand = Math.random();
      if (rand < 0.15) {
        // Near start point (15% chance)
        pathIndex = Math.floor(Math.random() * Math.min(20, pathLength * 0.2));
      } else if (rand > 0.85) {
        // Near end point (15% chance)
        pathIndex = Math.floor(Math.max(pathLength * 0.8, pathLength - 20) + Math.random() * Math.min(20, pathLength * 0.2));
      } else {
        // Distributed throughout middle (70% chance)
        pathIndex = Math.floor(Math.random() * (pathLength - 1));
      }
    }
    
    const point = points[pathIndex];
    
    // Adjust spread based on event type and intensity
    const spreadFactor = isRoughDate 
      ? config.spreadFactor * 2.0  // More spread for rough dates
      : config.spreadFactor * intensitySpreadScale; // Normal spread scaled by intensity
    
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * spreadFactor,
      (Math.random() - 0.5) * spreadFactor,
      (Math.random() - 0.5) * spreadFactor
    );
    
    const i3 = i * 3;
    config.positions[i3] = point.x + randomOffset.x;
    config.positions[i3 + 1] = point.y + randomOffset.y;
    config.positions[i3 + 2] = point.z + randomOffset.z;
    
    // Increase base size for better visibility
    config.sizes[i] = config.baseSize * 
                     (1 + Math.random() * config.sizeVariation) * 
                     intensitySpreadScale;
    
    // Enhanced opacity curve
    const pathProgress = pathIndex / pathLength;
    const progressFactor = 4 * (pathProgress * (1 - pathProgress));
    config.opacities[i] = config.baseOpacity * 
                         (0.8 + progressFactor * 0.4) * // More opacity variation
                         (0.9 + Math.random() * 0.2); // Slight random variation
    
    // Apply warm color variation
    const variedColor = getWarmColorVariation(baseColor, config.colorVariation);
    config.colors[i3] = variedColor.r;
    config.colors[i3 + 1] = variedColor.g;
    config.colors[i3 + 2] = variedColor.b;
  }
};
