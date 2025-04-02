
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
  // DRAMATICALLY increase particle count based on event intensity
  // These numbers are 5-8x higher than before for massive visual impact
  const getParticleCount = (intensity: number) => {
    if (intensity >= 8) return Math.floor(1500 + (intensity - 8) * 400); // High: 1500-2300
    if (intensity >= 4) return Math.floor(800 + (intensity - 4) * 200);  // Medium: 800-1600
    return Math.floor(400 + intensity * 50);                           // Low: 400-800
  };
  
  const particlesCount = getParticleCount(event.intensity);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate much more dramatic dust particles with extreme nebula qualities
  const [positions, colors, sizes] = useMemo(() => {
    // Create array buffers for particle properties
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const color = new THREE.Color(event.color);
    // MUCH larger base size for dramatic visual effect
    const baseSize = 1.0 + (event.intensity * 0.5); 
    
    // If it's a duration event, scatter particles along the path and WELL beyond
    if (event.endDate) {
      const points = calculateSpiralSegment(
        event,
        {...event, startDate: event.endDate},
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
        
        // EXTREME scatter radius for massive nebula effect - 6-8x larger than before
        const scatter = 15.0 * (0.8 + (event.intensity / 10));
        
        // Random scattered position with dramatic 3D volumetric effect
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * scatter * 4.5, // Huge horizontal spread
          (Math.random() - 0.5) * scatter * 4.0, // Massive vertical spread
          (Math.random() - 0.5) * scatter * 4.5  // Huge depth spread
        );
        
        positions[i3] = point.x + randomOffset.x;
        positions[i3 + 1] = point.y + randomOffset.y;
        positions[i3 + 2] = point.z + randomOffset.z;
        
        // Dramatic color variation for stunning nebula look
        const colorVariation = 0.9; // Increased variation for cosmic look
        // Larger hue shifts for more dramatic color variation
        const hueShift = Math.random() * 0.4 - 0.2; // -0.2 to +0.2 hue shift
        const tempColor = new THREE.Color(color.getHex());
        
        // Get HSL components to modify
        let hsl = {h: 0, s: 0, l: 0};
        tempColor.getHSL(hsl);
        // Apply dramatic hue variation for nebula effect
        hsl.h = Math.max(0, Math.min(1, hsl.h + hueShift));
        // Randomize saturation dramatically
        hsl.s = Math.max(0, Math.min(1, hsl.s * (0.7 + Math.random() * 0.6)));
        // Randomize luminance for glowing core and diffuse edges
        hsl.l = Math.max(0, Math.min(1, hsl.l * (0.7 + Math.random() * 0.8)));
        tempColor.setHSL(hsl.h, hsl.s, hsl.l);
        
        colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // Much more dramatic size variation for stunning nebula effect
        sizes[i] = baseSize * (0.5 + Math.random() * 12.0);
      }
    } else {
      // For point events, create a massive nebula explosion effect
      const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      // MUCH wider spread factor for truly dramatic particle explosion
      const spreadFactor = 12.0 + (event.intensity * 1.5); 
      
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
          (Math.random() - 0.5) * 3.0,
          (Math.random() - 0.5) * 3.0,
          (Math.random() - 0.5) * 3.0
        );
        
        positions[i3] = centerPosition.x + r * Math.sin(theta) * Math.cos(phi) + asymmetry.x;
        positions[i3 + 1] = centerPosition.y + r * Math.sin(theta) * Math.sin(phi) * 2.5 + asymmetry.y; // More Y stretch
        positions[i3 + 2] = centerPosition.z + r * Math.cos(theta) + asymmetry.z;
        
        // Calculate distance from center normalized to 0-1
        const distanceFromCenter = Math.min(1, r / spreadFactor);
        
        // Extreme color variation for visual richness of nebula
        const colorVariation = 0.9;
        // Create dramatically different color for each particle
        const hueShift = (Math.random() * 0.4) - 0.2; // Larger hue shift range
        const tempColor = new THREE.Color(color.getHex());
        
        // Adjust HSL values for stunning nebula effect
        let hsl = {h: 0, s: 0, l: 0};
        tempColor.getHSL(hsl);
        hsl.h = Math.max(0, Math.min(1, hsl.h + hueShift));
        // Varied saturation
        hsl.s = Math.max(0.3, Math.min(1, hsl.s * (1.3 - distanceFromCenter * 0.6)));
        // More dramatic luminance changes
        hsl.l = Math.max(0.2, Math.min(1, hsl.l * (1.3 - distanceFromCenter * 0.4)));
        tempColor.setHSL(hsl.h, hsl.s, hsl.l);
        
        colors[i3] = tempColor.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = tempColor.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = tempColor.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // Create dramatic size variation based on distance from center
        const sizeVariation = 0.5 + Math.random() * 15.0; // Much larger variation
        const centerProximity = 1 - (distanceFromCenter * 0.6);
        sizes[i] = baseSize * sizeVariation * (0.7 + centerProximity);
      }
    }
    
    return [positions, colors, sizes];
  }, [event, startYear, zoom, particlesCount]);
  
  // Enhanced animation for more dramatic movement
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // More dramatic pulsing opacity for the whole cloud
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.3) * 0.3;
        // Higher base opacity for more visibility
        pointsRef.current.material.opacity = 0.95 + pulse;
      }
      
      // Create more dramatic movement for individual particles
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        const time = clock.getElapsedTime();
        
        // Create more complex movement pattern for realistic nebula effect
        const xFreq = 0.08 + Math.sin(i * 0.1) * 0.08;
        const yFreq = 0.06 + Math.cos(i * 0.05) * 0.06;
        const zFreq = 0.07 + Math.sin(i * 0.15) * 0.07;
        
        // Apply more dramatic drift - like cosmic dust in space
        const driftFactor = 0.04 * (event.intensity / 5);
        positions[i3] += Math.sin(time * xFreq + i) * driftFactor;
        positions[i3 + 1] += Math.cos(time * yFreq + i * 0.7) * driftFactor * 1.2;
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
        size={0.5} // Larger base size
        vertexColors
        transparent
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/bdc4b9a9-a9b1-4e5b-a2f6-cbddfe02b5ca.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.98} // Higher opacity
      />
    </points>
  );
};
