
import { useMemo } from "react";
import * as THREE from "three";

/**
 * Custom hook to provide consistent high-quality particle textures
 * across the application.
 * 
 * @returns Object containing particle and glow textures
 */
export const useParticleTextures = () => {
  // Use the high-quality particle texture for all particles
  const particleTexture = useMemo(() => {
    return new THREE.TextureLoader().load('/lovable-uploads/aa0fbf13-30c5-4939-8a62-bf7b1f024055.png');
  }, []);
  
  // Create a second, more diffuse version for glow effects
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a soft glow gradient
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Create a third, sharper core texture for main particle points
  const coreTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a sharper gradient with smaller core and faster falloff
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return { particleTexture, glowTexture, coreTexture };
};

// Standalone utility function for creating standard textures without hooks
export const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  return new THREE.CanvasTexture(canvas);
};

// Utility for consistent intensity scaling across all particle systems
export const getIntensityScaling = (intensity: number) => {
  // Normalize intensity to 0-1 range for easier calculations
  const normalizedIntensity = intensity / 10;
  
  return {
    // Particle counts (more particles for higher intensity)
    particleCountFactor: 0.4 + normalizedIntensity * 0.6, // 0.4 to 1.0
    
    // Size scaling (larger particles for higher intensity)
    sizeFactor: 0.7 + normalizedIntensity * 0.6, // 0.7 to 1.3
    
    // Particle spread (wider area for higher intensity)
    spreadFactor: 0.8 + normalizedIntensity * 0.4, // 0.8 to 1.2
    
    // Opacity (brighter for higher intensity)
    opacityFactor: 0.8 + normalizedIntensity * 0.4, // 0.8 to 1.2
    
    // Animation (faster/more dynamic for higher intensity)
    animationFactor: 0.7 + normalizedIntensity * 0.6, // 0.7 to 1.3
    
    // Pulse intensity (stronger pulse for higher intensity)
    pulseFactor: 0.6 + normalizedIntensity * 0.8, // 0.6 to 1.4
  };
};
