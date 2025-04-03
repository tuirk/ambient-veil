
import * as THREE from "three";

// Create a warmer color palette with golden, white, and soft blue tones
export const getWarmColorVariation = (baseColor: THREE.Color, strength: number = 0.05) => {
  // Always use a warm golden base color instead of the passed event color
  const warmBase = new THREE.Color("#FFD700"); // Gold base
  
  // Create variations around the warm base
  const hsl: {h: number, s: number, l: number} = {h: 0, s: 0, l: 0};
  warmBase.getHSL(hsl);
  
  // Create two types of variations:
  // 1. Warm golden tones (70% chance)
  // 2. White/pale variations (30% chance)
  if (Math.random() < 0.7) {
    // Warm golden variations
    hsl.h = 0.14 + (Math.random() - 0.5) * 0.02; // Tight range around gold
    hsl.s = 0.6 + Math.random() * 0.3; // Medium-high saturation
    hsl.l = 0.6 + Math.random() * 0.3; // Bright but not washed out
  } else {
    // White/pale variations
    hsl.h = 0.14; // Keep gold hue
    hsl.s = Math.random() * 0.3; // Low saturation for whitish appearance
    hsl.l = 0.8 + Math.random() * 0.2; // Very bright
  }
  
  const newColor = new THREE.Color().setHSL(hsl.h, hsl.s, hsl.l);
  return newColor;
};

