
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

  return { particleTexture, glowTexture };
};
