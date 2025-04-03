
import { useMemo } from "react";
import * as THREE from "three";

export const useParticleTextures = () => {
  // Create advanced texture for dust particles - more nebula-like with soft edges
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a more complex gradient with warm tones for a softer nebula-like particle
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.2, 'rgba(255, 250, 230, 0.6)'); // Warm tint
      gradient.addColorStop(0.5, 'rgba(255, 240, 220, 0.3)'); // Soft gold
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
      
      // Add some texture/noise for more realistic space dust
      for (let i = 0; i < 300; i++) {
        const x = Math.random() * 64;
        const y = Math.random() * 64;
        const radius = Math.random() * 1.5;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        // Use warmer colors for the speckles
        const alpha = Math.random() * 0.1;
        const r = 255;
        const g = 220 + Math.random() * 35;
        const b = 180 + Math.random() * 40;
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Create a second, more diffuse texture for background glow
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // More diffuse gradient for ethereal warm glow
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.3, 'rgba(255, 240, 200, 0.2)'); // Warm glow
      gradient.addColorStop(0.7, 'rgba(255, 230, 180, 0.1)'); // Soft gold
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return { particleTexture, glowTexture };
};
