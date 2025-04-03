
// Export the main component
export { EventDuration } from './EventDuration';

// Export utility modules for particles
export { generateParticles } from './ParticleGenerator';
export { generateParticleLayer } from './ParticleLayerGenerator';
export { getWarmColorVariation } from './ColorUtils';
export { useParticleTextures } from './ParticleTextures';
export { ParticleSystemGroup } from './ParticleSystems';
export { calculateParticleCounts, calculateScalingFactors } from './ParticleArrayFactory';

// Export types
export type { ParticleData, ParticleGeneratorProps, ParticleLayerParams } from './ParticleTypes';
