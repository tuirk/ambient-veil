
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition, calculateSpiralSegment } from "./spiralUtils";

/**
 * Determines particle count based on event intensity
 * Higher intensity events get dramatically more particles
 */
export const getParticleCount = (intensity: number): number => {
  if (intensity >= 8) return Math.floor(2500 + (intensity - 8) * 600); // High: 2500-3800
  if (intensity >= 4) return Math.floor(1600 + (intensity - 4) * 300);  // Medium: 1600-2800
  return Math.floor(800 + intensity * 100);                           // Low: 800-1800
};

/**
 * Applies a dramatic hue variation to create a stunning nebula effect
 */
export const applyNebulaColorEffect = (
  baseColor: THREE.Color, 
  hueShift: number, 
  distanceFromCenter: number = 0
): THREE.Color => {
  const tempColor = new THREE.Color(baseColor.getHex());
  
  // Get HSL components to modify
  let hsl = {h: 0, s: 0, l: 0};
  tempColor.getHSL(hsl);
  
  // Apply dramatic hue variation for nebula effect
  hsl.h = Math.max(0, Math.min(1, hsl.h + hueShift));
  
  // Maintain higher saturation
  hsl.s = Math.max(0.5, Math.min(1, hsl.s * (0.8 + Math.random() * 0.4)));
  
  // Maintain higher luminance for visibility
  hsl.l = Math.max(0.4, Math.min(1, hsl.l * (0.8 + Math.random() * 0.5)));
  
  tempColor.setHSL(hsl.h, hsl.s, hsl.l);
  return tempColor;
};

/**
 * Generates particle data for an event with duration (path-based)
 */
export const generatePathBasedParticles = (
  event: TimeEvent,
  startYear: number,
  zoom: number,
  particlesCount: number
): [Float32Array, Float32Array, Float32Array] => {
  // Create array buffers for particle properties
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  
  const color = new THREE.Color(event.color);
  // MUCH larger base size for dramatic visual effect
  const baseSize = 2.0 + (event.intensity * 1.0);
  
  const points = calculateSpiralSegment(
    event,
    {...event, startDate: event.endDate as Date},
    startYear,
    400, // More points for smoother path
    5 * zoom,
    1.5 * zoom
  );
  
  // Fill arrays with randomized particles along and around the path
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    
    // Pick a random point along the path
    const pathIndex = Math.floor(Math.random() * points.length);
    const point = points[pathIndex];
    
    // EXTREME scatter radius for massive nebula effect - 10-12x larger than before
    const scatter = 20.0 * (0.8 + (event.intensity / 10));
    
    // Random scattered position with dramatic 3D volumetric effect
    const randomOffset = new THREE.Vector3(
      (Math.random() - 0.5) * scatter * 6.0, // Huge horizontal spread
      (Math.random() - 0.5) * scatter * 5.0, // Massive vertical spread
      (Math.random() - 0.5) * scatter * 6.0  // Huge depth spread
    );
    
    positions[i3] = point.x + randomOffset.x;
    positions[i3 + 1] = point.y + randomOffset.y;
    positions[i3 + 2] = point.z + randomOffset.z;
    
    // Dramatic color variation for stunning nebula look
    const colorVariation = 0.6; // Increased variation for cosmic look
    // Larger hue shifts for more dramatic color variation
    const hueShift = Math.random() * 0.2 - 0.1; // -0.1 to +0.1 hue shift
    
    const tempColor = applyNebulaColorEffect(color, hueShift);
    
    colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
    colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
    colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
    
    // Much more dramatic size variation for stunning nebula effect
    sizes[i] = baseSize * (0.7 + Math.random() * 15.0);
  }
  
  return [positions, colors, sizes];
};

/**
 * Generates particle data for a point event (explosion-like nebula)
 */
export const generatePointBasedParticles = (
  event: TimeEvent,
  startYear: number,
  zoom: number,
  particlesCount: number
): [Float32Array, Float32Array, Float32Array] => {
  // Create array buffers for particle properties
  const positions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);
  const sizes = new Float32Array(particlesCount);
  
  const color = new THREE.Color(event.color);
  // MUCH larger base size for dramatic visual effect
  const baseSize = 2.0 + (event.intensity * 1.0);
  
  // For point events, create a massive nebula explosion effect
  const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  // MUCH wider spread factor for truly dramatic particle explosion
  const spreadFactor = 15.0 + (event.intensity * 2.0);
  
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    
    // Create extremely randomized distribution for nebula effect
    // Use spherical distribution with non-uniform spread
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos((Math.random() * 2) - 1);
    
    // Distribution to create super dense core with massive diffuse edges
    let r;
    if (Math.random() < 0.4) {
      // 40% of particles form a dense core
      r = Math.pow(Math.random(), 1.2) * spreadFactor * 0.7;
    } else {
      // 60% of particles form massive diffuse outer regions
      r = spreadFactor * (0.6 + Math.random() * 2.0);
    }
    
    // Create major asymmetry for dramatic nebula look
    const asymmetry = new THREE.Vector3(
      (Math.random() - 0.5) * 4.0,
      (Math.random() - 0.5) * 4.0,
      (Math.random() - 0.5) * 4.0
    );
    
    positions[i3] = centerPosition.x + r * Math.sin(theta) * Math.cos(phi) + asymmetry.x;
    positions[i3 + 1] = centerPosition.y + r * Math.sin(theta) * Math.sin(phi) * 2.5 + asymmetry.y; // More Y stretch
    positions[i3 + 2] = centerPosition.z + r * Math.cos(theta) + asymmetry.z;
    
    // Calculate distance from center normalized to 0-1
    const distanceFromCenter = Math.min(1, r / spreadFactor);
    
    // Extreme color variation for visual richness of nebula
    const colorVariation = 0.6;
    // Create dramatically different color for each particle
    const hueShift = (Math.random() * 0.2) - 0.1; // Reasonable hue shift range
    
    // Apply color effect with distance consideration
    const tempColor = applyNebulaColorEffect(color, hueShift, distanceFromCenter);
    
    colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
    colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
    colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
    
    // Create dramatic size variation based on distance from center
    const sizeVariation = 0.7 + Math.random() * 18.0; // Much larger variation
    const centerProximity = 1 - (distanceFromCenter * 0.6);
    sizes[i] = baseSize * sizeVariation * (0.8 + centerProximity);
  }
  
  return [positions, colors, sizes];
};

/**
 * Updates particle positions with dramatic movement
 */
export const animateParticles = (
  positions: Float32Array,
  particleCount: number,
  time: number,
  intensity: number
): void => {
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // Create more complex movement pattern for realistic nebula effect
    const xFreq = 0.08 + Math.sin(i * 0.1) * 0.08;
    const yFreq = 0.06 + Math.cos(i * 0.05) * 0.06;
    const zFreq = 0.07 + Math.sin(i * 0.15) * 0.07;
    
    // Apply more dramatic drift - like cosmic dust in space
    const driftFactor = 0.05 * (intensity / 5);
    positions[i3] += Math.sin(time * xFreq + i) * driftFactor;
    positions[i3 + 1] += Math.cos(time * yFreq + i * 0.7) * driftFactor * 1.2;
    positions[i3 + 2] += Math.sin(time * zFreq + i * 1.3) * driftFactor;
  }
};
