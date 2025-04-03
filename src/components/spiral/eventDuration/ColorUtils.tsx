import * as THREE from "three";

// Create a warmer color palette with golden, white, and soft blue tones
export const getWarmColorVariation = (baseColor: THREE.Color, strength: number = 0.05) => {
  const newColor = baseColor.clone();
  
  // Convert to HSL for easier manipulation
  const hsl: {h: number, s: number, l: number} = {h: 0, s: 0, l: 0};
  newColor.getHSL(hsl);
  
  // Apply a warm tint by shifting hue slightly toward gold/yellow
  // This creates more of the yellow/white aesthetic seen in the first image
  if (Math.random() > 0.5) {
    // 50% chance to shift toward warm golden tones (0.12-0.16 in hue space)
    hsl.h = 0.14 + (Math.random() - 0.5) * 0.04;
    hsl.s = 0.3 + Math.random() * 0.4; // Medium-high saturation for gold
    hsl.l = 0.7 + Math.random() * 0.25; // High lightness for bright appearance
  } else {
    // 50% chance to make white/blue-ish tones
    hsl.h = 0.6 + (Math.random() - 0.5) * 0.1; // Subtle blue hue
    hsl.s = 0.1 + Math.random() * 0.2; // Low saturation for whitish appearance
    hsl.l = 0.8 + Math.random() * 0.15; // Very high lightness
  }
  
  newColor.setHSL(hsl.h, hsl.s, hsl.l);
  return newColor;
};

// For maintaining some color variety while favoring warm tones
export const getColorVariationWithWarmBias = (baseColor: THREE.Color, warmBias: number = 0.7) => {
  // Determine if we should use warm colors or event-based colors
  if (Math.random() < warmBias) {
    return getWarmColorVariation(baseColor);
  }
  
  // Original color variation logic with reduced saturation
  const newColor = baseColor.clone();
  const hsl: {h: number, s: number, l: number} = {h: 0, s: 0, l: 0};
  newColor.getHSL(hsl);
  
  // Keep hue closer to original, reduce saturation variation
  hsl.s = Math.min(0.5, hsl.s); // Cap saturation to prevent overly vivid colors
  hsl.s += (Math.random() - 0.5) * 0.2;
  hsl.l += (Math.random() - 0.5) * 0.2;
  
  // Ensure values stay in valid range
  hsl.s = Math.max(0, Math.min(0.6, hsl.s));
  hsl.l = Math.max(0.5, Math.min(0.9, hsl.l));
  
  newColor.setHSL(hsl.h, hsl.s, hsl.l);
  return newColor;
};
