
import { useMemo } from "react";
import * as THREE from "three";

export const useParticleTextures = () => {
  // Create advanced texture for dust particles - more nebula-like with soft edges
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; // Increased from 64 for higher resolution
    canvas.height = 128; // Increased from 64 for higher resolution
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a more complex gradient for a softer, nebula-like particle
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
      
      // Add some texture/noise for more realistic space dust
      for (let i = 0; i < 400; i++) {
        const x = Math.random() * 128;
        const y = Math.random() * 128;
        const radius = Math.random() * 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
        ctx.fill();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Create a second, more diffuse texture for background glow
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256; // Increased from 128 for higher resolution
    canvas.height = 256; // Increased from 128 for higher resolution
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // More diffuse gradient for ethereal glow
      const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)'); // Increased from 0.4 for more visibility
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)'); // Increased from 0.1 for more visibility
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 256, 256);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return { particleTexture, glowTexture };
};
