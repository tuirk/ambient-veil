
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getSeasonMiddleDate } from "@/utils/seasonalUtils";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  isProcessEvent: boolean;
  isQuarterly?: boolean;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({
  event,
  startYear,
  zoom,
  isProcessEvent,
  isQuarterly = false
}) => {
  const particles = useRef<THREE.Points>(null);
  const count = 50 + event.intensity * 10; // More particles for higher intensity
  
  // Handle seasonal events correctly
  let effectiveEvent = event;
  if (event.isRoughDate && event.roughDateSeason) {
    const seasonDate = getSeasonMiddleDate(
      event.roughDateSeason, 
      event.roughDateYear || event.startDate.getFullYear()
    );
    effectiveEvent = {
      ...event,
      startDate: seasonDate
    };
  }
  
  // Get event position based on whether we're using quarterly or annual positioning
  const position = isQuarterly
    ? getQuarterlyEventPosition(effectiveEvent, startYear, 5 * zoom, 1.5 * zoom)
    : getEventPosition(effectiveEvent, startYear, 5 * zoom, 1.5 * zoom);
  
  // Generate initial particle positions and colors
  const particlePositions = new Float32Array(count * 3);
  const particleColors = new Float32Array(count * 3);
  const particleSizes = new Float32Array(count);
  
  // Convert event.color (string like "#ff0000") to r,g,b components
  const color = new THREE.Color(event.color);
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // Scatter particles around the event position
    const radius = Math.random() * 0.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    particlePositions[i3 + 2] = radius * Math.cos(phi);
    
    // Set color with variations
    particleColors[i3] = color.r + (Math.random() * 0.2 - 0.1);
    particleColors[i3 + 1] = color.g + (Math.random() * 0.2 - 0.1);
    particleColors[i3 + 2] = color.b + (Math.random() * 0.2 - 0.1);
    
    // Randomize particle sizes
    particleSizes[i] = Math.random() * 0.07 + 0.03;
  }
  
  // Animate the particles
  useFrame((state) => {
    if (particles.current) {
      // Slowly rotate particles
      particles.current.rotation.y += 0.003;
      particles.current.rotation.x += 0.001;
      
      // Update positions for animation effect
      const positions = particles.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        
        // Apply a subtle cosmic motion to each particle
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        positions[i3] = x + Math.sin(time + i * 0.1) * 0.002;
        positions[i3 + 1] = y + Math.cos(time + i * 0.1) * 0.002;
        positions[i3 + 2] = z + Math.sin(time * 0.5 + i * 0.1) * 0.002;
      }
      
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particles} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particlePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particleColors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={particleSizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
