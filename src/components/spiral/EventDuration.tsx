import React, { useRef, useMemo } from "react";
import { Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { isSeasonalEvent } from "@/utils/seasonalUtils";

interface EventDurationProps {
  startEvent: TimeEvent;   // Event that marks the start of the duration
  endEvent: TimeEvent;     // Event that marks the end of the duration
  startYear: number;       // First year of the spiral (used for positioning)
  zoom: number;            // Current zoom level (affects visual scale)
}

/**
 * Renders a cosmic dust trail between two events on the spiral, representing a duration
 * Inspired by deep space nebula imagery
 */
export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  // Calculate if this is a minimal duration (no end date or same as start date)
  const isMinimalDuration = !startEvent.endDate || 
    startEvent.startDate.getTime() === (startEvent.endDate?.getTime() || 0);
  
  // Calculate the span length in days for density calculations
  const spanLengthInDays = isMinimalDuration ? 1 : 
    Math.max(1, Math.floor((endEvent.startDate.getTime() - startEvent.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Generate points for a smooth curve between the two events
  // More points for longer spans to ensure smooth curves
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    // Ensure we have more points for longer spans
    isMinimalDuration ? 100 : 200 + Math.min(300, spanLengthInDays),
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the particles
  const colorObj = new THREE.Color(startEvent.color);
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);

  // Generate particles for nebula effect
  const particlesRef = useRef<THREE.Points>(null);
  const secondaryParticlesRef = useRef<THREE.Points>(null);
  const tertiaryParticlesRef = useRef<THREE.Points>(null);
  
  // Create advanced texture for dust particles - more nebula-like with soft edges
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create a more complex gradient for a softer, nebula-like particle
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
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
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
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
      // More diffuse gradient for ethereal glow
      const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Number of particles based on event intensity and span length - ENHANCED VALUES
  const particleCount = useMemo(() => {
    // Base count depends on intensity (1-10 scale)
    // Intensity 1 → 150× spanLength (increased from 50)
    // Intensity 5 → 300× spanLength (increased from 100)
    // Intensity 10 → 450× spanLength (increased from 200)
    const intensityFactor = 1.5 + startEvent.intensity * 0.3; // Increased from 0.5 + 0.15
    const baseMultiplier = 150; // Increased from 100
    
    // For minimal duration, use a fixed count to ensure visibility
    if (isMinimalDuration) {
      return Math.floor(baseMultiplier * intensityFactor);
    }
    
    // For actual spans, scale by length but cap for performance
    const lengthFactor = Math.min(1.2, Math.log10(spanLengthInDays) / 3 + 0.6); // Increased from 1.0
    return Math.floor(baseMultiplier * intensityFactor * lengthFactor);
  }, [startEvent.intensity, isMinimalDuration, spanLengthInDays]);
  
  // Additional background particles for more volume
  const backgroundParticleCount = Math.floor(particleCount * 0.8); // Increased from 0.7
  const tertiaryParticleCount = Math.floor(particleCount * 0.5); // Increased from 0.4
  
  // Helper function to create color variations
  const getColorVariation = (baseColor: THREE.Color, strength: number = 0.05) => {
    const newColor = baseColor.clone();
    
    // Small random shifts in hue
    const hsl: {h: number, s: number, l: number} = {h: 0, s: 0, l: 0};
    newColor.getHSL(hsl);
    
    // Keep exact same hue, only vary saturation and lightness slightly
    hsl.s += (Math.random() - 0.5) * strength;
    hsl.l += (Math.random() - 0.5) * strength;
    
    // Ensure values stay in valid range
    hsl.s = Math.max(0, Math.min(1, hsl.s));
    hsl.l = Math.max(0.2, Math.min(0.9, hsl.l));
    
    newColor.setHSL(hsl.h, hsl.s, hsl.l);
    return newColor;
  };
  
  // Generate particles distributed along the path
  const { 
    particlePositions, 
    particleSizes, 
    particleOpacities,
    particleColors,
    bgParticlePositions,
    bgParticleSizes,
    bgParticleOpacities,
    bgParticleColors,
    tertiaryParticlePositions, 
    tertiaryParticleSizes,
    tertiaryParticleColors,
    tertiaryParticleOpacities
  } = useMemo(() => {
    // Primary particles (sharper, more defined)
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    
    // Background particles (more diffuse, larger)
    const bgPositions = new Float32Array(backgroundParticleCount * 3);
    const bgSizes = new Float32Array(backgroundParticleCount);
    const bgOpacities = new Float32Array(backgroundParticleCount);
    const bgColors = new Float32Array(backgroundParticleCount * 3);
    
    // Tertiary particles (for additional volume and variety)
    const terPositions = new Float32Array(tertiaryParticleCount * 3);
    const terSizes = new Float32Array(tertiaryParticleCount);
    const terOpacities = new Float32Array(tertiaryParticleCount);
    const terColors = new Float32Array(tertiaryParticleCount * 3);
    
    // Path length for distribution calculation
    const pathLength = points.length;
    
    // Base size calculation - scales with intensity - ENHANCED VALUES
    // Intensity 1 → 0.9x, Intensity 5 → 1.5x, Intensity 10 → 2.4x
    const baseSizeFactor = 0.9 + startEvent.intensity * 0.15; // Increased from 0.6 + 0.1
    
    // Color variations to make the nebula more interesting
    const baseColor = new THREE.Color(startEvent.color);
    const slightlyLighter = baseColor.clone().multiplyScalar(1.2);
    const slightlyDarker = baseColor.clone().multiplyScalar(0.8);
    
    // Primary particles
    for (let i = 0; i < particleCount; i++) {
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
      const spreadFactor = isRoughDate ? 0.6 : 0.4;
      // Scale spread by intensity for more dramatic high-intensity events
      const intensitySpreadScale = 0.8 + startEvent.intensity * 0.04;
      
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
      );
      
      const i3 = i * 3;
      positions[i3] = point.x + randomOffset.x;
      positions[i3 + 1] = point.y + randomOffset.y;
      positions[i3 + 2] = point.z + randomOffset.z;
      
      // Vary the size of particles with intensity scaling and 20% random variation
      // Base size enhanced from 0.15 to 0.30
      const baseSize = 0.30 * baseSizeFactor;
      const sizeVariation = 0.2; // 20% variation
      sizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
      
      // Vary opacity based on position and intensity
      // More intense events get slightly higher base opacity
      const pathProgress = pathIndex / pathLength;
      const baseOpacity = isRoughDate ? 0.08 : 0.12; // Increased from 0.06/0.1
      const intensityOpacityBoost = 0.08 * (startEvent.intensity / 10); // Increased from 0.06
      
      // Opacity curve - slightly stronger in the middle of the path
      const progressFactor = 4 * (pathProgress * (1 - pathProgress));
      opacities[i] = (baseOpacity + intensityOpacityBoost) * 
                     (0.7 + progressFactor * 0.3) * 
                     (0.8 + Math.random() * 0.4); // Add some random variation
      
      // Add color variations
      const variedColor = getColorVariation(baseColor);
      colors[i3] = variedColor.r;
      colors[i3 + 1] = variedColor.g;
      colors[i3 + 2] = variedColor.b;
    }
    
    // Background particles - larger, more diffuse
    for (let i = 0; i < backgroundParticleCount; i++) {
      const pathIndex = Math.floor(Math.random() * (pathLength - 1));
      const point = points[pathIndex];
      
      // Wider spread for background particles
      const spreadFactor = isRoughDate ? 0.9 : 0.65;
      const intensitySpreadScale = 0.8 + startEvent.intensity * 0.05;
      
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
      );
      
      const i3 = i * 3;
      bgPositions[i3] = point.x + randomOffset.x;
      bgPositions[i3 + 1] = point.y + randomOffset.y;
      bgPositions[i3 + 2] = point.z + randomOffset.z;
      
      // Larger but more transparent - ENHANCED SIZE
      const baseSize = 0.40 * baseSizeFactor; // Increased from 0.25
      const sizeVariation = 0.3; // 30% variation
      bgSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
      
      // Higher opacity for diffuse background glow
      const baseOpacity = 0.06; // Increased from 0.04
      const intensityOpacityBoost = 0.04 * (startEvent.intensity / 10); // Increased from 0.03
      bgOpacities[i] = (baseOpacity + intensityOpacityBoost) * (0.6 + Math.random() * 0.6);
      
      // Slightly varied colors for background
      const variedColor = getColorVariation(baseColor, 0.1);
      bgColors[i3] = variedColor.r;
      bgColors[i3 + 1] = variedColor.g;
      bgColors[i3 + 2] = variedColor.b;
    }
    
    // Tertiary particles - for additional volume and detail - ENHANCED SIZE
    for (let i = 0; i < tertiaryParticleCount; i++) {
      const pathIndex = Math.floor(Math.random() * (pathLength - 1));
      const point = points[pathIndex];
      
      // Medium spread for tertiary particles
      const spreadFactor = isRoughDate ? 0.75 : 0.5;
      const intensitySpreadScale = 0.8 + startEvent.intensity * 0.04;
      
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale,
        (Math.random() - 0.5) * spreadFactor * intensitySpreadScale
      );
      
      const i3 = i * 3;
      terPositions[i3] = point.x + randomOffset.x;
      terPositions[i3 + 1] = point.y + randomOffset.y;
      terPositions[i3 + 2] = point.z + randomOffset.z;
      
      // Medium-sized particles - ENHANCED SIZE
      const baseSize = 0.35 * baseSizeFactor; // Increased from 0.18
      const sizeVariation = 0.25; // 25% variation
      terSizes[i] = baseSize * (1 - sizeVariation/2 + Math.random() * sizeVariation);
      
      // Medium opacity - ENHANCED OPACITY
      const baseOpacity = 0.09; // Increased from 0.07
      const intensityOpacityBoost = 0.05 * (startEvent.intensity / 10); // Increased from 0.04
      terOpacities[i] = (baseOpacity + intensityOpacityBoost) * (0.7 + Math.random() * 0.5);
      
      // Some color variation
      const variedColor = getColorVariation(baseColor, 0.1);
      terColors[i3] = variedColor.r;
      terColors[i3 + 1] = variedColor.g;
      terColors[i3 + 2] = variedColor.b;
    }
    
    return { 
      particlePositions: positions, 
      particleSizes: sizes, 
      particleOpacities: opacities,
      particleColors: colors,
      bgParticlePositions: bgPositions,
      bgParticleSizes: bgSizes,
      bgParticleOpacities: bgOpacities,
      bgParticleColors: bgColors,
      tertiaryParticlePositions: terPositions, 
      tertiaryParticleSizes: terSizes,
      tertiaryParticleColors: terColors,
      tertiaryParticleOpacities: terOpacities
    };
  }, [points, particleCount, backgroundParticleCount, tertiaryParticleCount, isRoughDate, startEvent.intensity, isMinimalDuration, startEvent.color]);
  
  // Animation factors linked to intensity - more intense events animate more dramatically
  const animationSpeed = useMemo(() => {
    return 0.003 * (0.7 + startEvent.intensity * 0.05);
  }, [startEvent.intensity]);
  
  const animationAmplitude = useMemo(() => {
    return 0.01 * (0.7 + startEvent.intensity * 0.05);
  }, [startEvent.intensity]);
  
  // Subtle animation for the dust trail
  useFrame((state, delta) => {
    if (particlesRef.current && secondaryParticlesRef.current && tertiaryParticlesRef.current) {
      // Time-based animation
      const time = state.clock.getElapsedTime();
      
      // Very slow subtle drift - different for each particle system
      particlesRef.current.rotation.y += delta * animationSpeed;
      secondaryParticlesRef.current.rotation.y += delta * animationSpeed * 0.7;
      tertiaryParticlesRef.current.rotation.y -= delta * animationSpeed * 0.4;
      
      // Subtle breathing effect
      const primaryPulse = Math.sin(time * 0.2) * animationAmplitude;
      const secondaryPulse = Math.sin(time * 0.15 + 1) * animationAmplitude * 1.2;
      const tertiaryPulse = Math.sin(time * 0.1 + 2) * animationAmplitude * 1.5;
      
      // Scale pulse to create a breathing effect
      particlesRef.current.scale.set(
        1 + primaryPulse, 
        1 + primaryPulse, 
        1 + primaryPulse
      );
      
      secondaryParticlesRef.current.scale.set(
        1 + secondaryPulse, 
        1 + secondaryPulse, 
        1 + secondaryPulse
      );
      
      tertiaryParticlesRef.current.scale.set(
        1 + tertiaryPulse, 
        1 + tertiaryPulse, 
        1 + tertiaryPulse
      );
      
      // Additional subtle noise movement along all axes
      const noiseX = Math.sin(time * 0.3) * 0.001;
      const noiseY = Math.cos(time * 0.3) * 0.001;
      const noiseZ = Math.sin(time * 0.4) * 0.001;
      
      particlesRef.current.position.x += noiseX;
      particlesRef.current.position.y += noiseY;
      particlesRef.current.position.z += noiseZ;
      
      secondaryParticlesRef.current.position.x -= noiseX * 1.2;
      secondaryParticlesRef.current.position.y -= noiseY * 1.2;
      secondaryParticlesRef.current.position.z -= noiseZ * 1.2;
      
      tertiaryParticlesRef.current.position.x += noiseZ * 0.8;
      tertiaryParticlesRef.current.position.y += noiseX * 0.8;
      tertiaryParticlesRef.current.position.z += noiseY * 0.8;
    }
  });
  
  // For all durations, show layered particle systems
  return (
    <group>
      {/* Base path line - very subtle guide, only visible for non-minimal durations */}
      {!isMinimalDuration && (
        <Line
          points={points}
          color={colorObj}
          lineWidth={0.6 + startEvent.intensity * 0.08} // Increased from 0.4/0.04
          transparent
          opacity={0.15} // Increased from 0.1
          blending={THREE.AdditiveBlending}
          dashed={isRoughDate}
          dashSize={isRoughDate ? 0.1 : 0}
          dashOffset={isRoughDate ? 0.1 : 0}
          dashScale={isRoughDate ? 10 : 0}
        />
      )}
      
      {/* Primary particle dust - sharper, more defined */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={particleSizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.30} // Increased from 0.15
          vertexColors
          transparent
          opacity={0.9} // Increased from 0.8
          depthWrite={false}
          map={particleTexture}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Secondary particle layer - more diffuse background glow */}
      <points ref={secondaryParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={backgroundParticleCount}
            array={bgParticlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={backgroundParticleCount}
            array={bgParticleSizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={backgroundParticleCount}
            array={bgParticleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.40} // Increased from 0.25
          vertexColors
          transparent
          opacity={0.7} // Increased from 0.6
          depthWrite={false}
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
      
      {/* Tertiary particle layer - intermediate size and opacity */}
      <points ref={tertiaryParticlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={tertiaryParticleCount}
            array={tertiaryParticlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={tertiaryParticleCount}
            array={tertiaryParticleSizes}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-color"
            count={tertiaryParticleCount}
            array={tertiaryParticleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.35} // Increased from 0.18
          vertexColors
          transparent
          opacity={0.8} // Increased from 0.7
          depthWrite={false}
          map={particleTexture}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};
