
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition, calculateSpiralSegment } from "@/utils/spiralUtils";

interface EventDustCloudProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
}

export const EventDustCloud: React.FC<EventDustCloudProps> = ({
  event,
  startYear,
  zoom
}) => {
  // Dramatically increase particle count based on event intensity
  const getParticleCount = (intensity: number) => {
    if (intensity >= 8) return Math.floor(250 + (intensity - 8) * 100); // High: 250-450
    if (intensity >= 4) return Math.floor(120 + (intensity - 4) * 30); // Medium: 120-240
    return Math.floor(50 + intensity * 10); // Low: 50-80
  };
  
  const particlesCount = getParticleCount(event.intensity);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles based on event properties with more nebula-like qualities
  const [positions, colors, sizes] = useMemo(() => {
    // Create array buffers for particle properties
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const color = new THREE.Color(event.color);
    // Increase base size for more visibility and dramatic effect
    const baseSize = 0.15 + (event.intensity * 0.05); 
    
    // If it's a duration event, scatter particles along the path and beyond
    if (event.endDate) {
      const points = calculateSpiralSegment(
        event,
        {...event, startDate: event.endDate},
        startYear,
        300, // More points for smoother distribution
        5 * zoom,
        1.5 * zoom
      );
      
      // Fill arrays with randomized particles along and around the path
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Pick a random point along the path with preference for even distribution
        const pathIndex = Math.floor(Math.random() * points.length);
        const point = points[pathIndex];
        
        // Add significant random scatter for nebula effect
        // Greatly increased scatter radius to create expansive cloud effect
        const scatter = 2.5 * (0.8 + (event.intensity / 10));
        
        // Random scattered position with 3D volumetric effect - more dramatic
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * scatter * 3.0, // Even more horizontal spread
          (Math.random() - 0.5) * scatter * 2.5, // More vertical spread for volumetric effect
          (Math.random() - 0.5) * scatter * 3.0  // More depth spread for 3D nebula feel
        );
        
        positions[i3] = point.x + randomOffset.x;
        positions[i3 + 1] = point.y + randomOffset.y;
        positions[i3 + 2] = point.z + randomOffset.z;
        
        // More pronounced color variation to create visual interest and nebula effect
        const colorVariation = 0.6; // Increase variation for cosmic look
        // Add slight color shifts for nebula effect (slightly shift hue)
        const hueShift = Math.random() * 0.15 - 0.075; // -0.075 to +0.075 hue shift
        const tempColor = new THREE.Color(color.getHex());
        
        // Get HSL components to modify
        let hsl = {h: 0, s: 0, l: 0};
        tempColor.getHSL(hsl);
        // Apply slight random hue variation for nebula effect
        hsl.h = Math.max(0, Math.min(1, hsl.h + hueShift));
        // Randomize saturation slightly
        hsl.s = Math.max(0, Math.min(1, hsl.s * (0.85 + Math.random() * 0.3)));
        tempColor.setHSL(hsl.h, hsl.s, hsl.l);
        
        colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More dramatic size variation for natural nebula look
        // Different particle sizes create more dimensionality
        sizes[i] = baseSize * (0.2 + Math.random() * 4.0);
      }
    } else {
      // For point events, create a dramatic nebula explosion effect
      const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      // Much wider spread factor for more dramatic particle explosion
      const spreadFactor = 2.0 + (event.intensity * 0.25); 
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Create more randomized distribution around the event with nebula-like qualities
        // Use spherical distribution with non-uniform spread
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos((Math.random() * 2) - 1);
        
        // Use exponential distribution to create dense core with diffuse edges
        // This creates a more realistic nebula appearance
        let r;
        if (Math.random() < 0.7) {
          // 70% of particles form a dense core
          r = Math.pow(Math.random(), 1.5) * spreadFactor * 0.7;
        } else {
          // 30% of particles form diffuse outer regions
          r = spreadFactor * (0.7 + Math.random() * 0.8);
        }
        
        // Create slight asymmetry for more natural nebula look
        const asymmetry = new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        );
        
        positions[i3] = centerPosition.x + r * Math.sin(theta) * Math.cos(phi) + asymmetry.x;
        positions[i3 + 1] = centerPosition.y + r * Math.sin(theta) * Math.sin(phi) * 1.5 + asymmetry.y; // More Y stretch
        positions[i3 + 2] = centerPosition.z + r * Math.cos(theta) + asymmetry.z;
        
        // Create color gradient from center (brighter) to edges (more diffuse)
        // Distance from center normalized to 0-1
        const distanceFromCenter = Math.min(1, r / spreadFactor);
        
        // Stronger color variation for visual richness of nebula
        const colorVariation = 0.6;
        // Create slightly different color for each particle
        const hueShift = (Math.random() * 0.2) - 0.1; // -0.1 to +0.1 hue shift
        const tempColor = new THREE.Color(color.getHex());
        
        // Adjust HSL values for nebula effect
        let hsl = {h: 0, s: 0, l: 0};
        tempColor.getHSL(hsl);
        hsl.h = Math.max(0, Math.min(1, hsl.h + hueShift));
        // Particles further from center are less saturated
        hsl.s = Math.max(0.3, Math.min(1, hsl.s * (1.2 - distanceFromCenter * 0.5)));
        // Particles further from center are slightly darker
        hsl.l = Math.max(0.2, Math.min(1, hsl.l * (1.1 - distanceFromCenter * 0.3)));
        tempColor.setHSL(hsl.h, hsl.s, hsl.l);
        
        colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // Create size variation based on distance from center - creates depth
        // Larger particles near center create glow effect
        const sizeVariation = 0.2 + Math.random() * 4.0;
        const centerProximity = 1 - (distanceFromCenter * 0.7); // Particles closer to center are larger
        sizes[i] = baseSize * sizeVariation * (0.6 + centerProximity);
      }
    }
    
    return [positions, colors, sizes];
  }, [event, startYear, zoom, particlesCount]);
  
  // Enhanced animation for the dust particles - create nebula-like movement
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // More dramatic pulsing opacity for the whole cloud
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.2) * 0.2;
        pointsRef.current.material.opacity = 0.85 + pulse;
      }
      
      // Create subtle movement for individual particles - nebula drift effect
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const time = clock.getElapsedTime();
        
        // Create more complex movement pattern for realistic nebula effect
        // Different frequencies create natural-looking turbulence
        const xFreq = 0.05 + Math.sin(i * 0.1) * 0.05;
        const yFreq = 0.03 + Math.cos(i * 0.05) * 0.03;
        const zFreq = 0.04 + Math.sin(i * 0.15) * 0.04;
        
        // Apply subtle but noticeable drift - like cosmic dust in space
        const driftFactor = 0.01 * (event.intensity / 5);
        positions[i3] += Math.sin(time * xFreq + i) * driftFactor;
        positions[i3 + 1] += Math.cos(time * yFreq + i * 0.7) * driftFactor * 0.8;
        positions[i3 + 2] += Math.sin(time * zFreq + i * 1.3) * driftFactor;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particlesCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/4c7b0557-92eb-40ed-8cf8-869e70bb1ccb.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.85}
      />
    </points>
  );
};
