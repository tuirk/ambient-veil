
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getMonthlyEventPosition } from "@/utils/monthlyUtils";
import { getWeeklyEventPosition } from "@/utils/weeklyUtils";
import { getSeasonMiddleDate } from "@/utils/seasonalUtils";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  isProcessEvent?: boolean;
  viewType?: "annual" | "quarterly" | "monthly" | "weekly";
  startDate?: Date;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({
  event,
  startYear,
  zoom,
  isProcessEvent = false,
  viewType = "annual",
  startDate
}) => {
  // Get position on the spiral based on view type
  let position;
  if (viewType === "quarterly") {
    position = getQuarterlyEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  } else if (viewType === "monthly") {
    position = getMonthlyEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  } else if (viewType === "weekly" && startDate) {
    // Handle seasonal rough dates for weekly view
    let effectiveEvent = {...event};
    if (event.isRoughDate && event.roughDateSeason && event.roughDateYear) {
      effectiveEvent = {
        ...event,
        startDate: getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear)
      };
    }
    position = getWeeklyEventPosition(effectiveEvent, startDate, 5 * zoom, 0.7 * zoom);
  } else {
    // Default to annual view
    position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  }
  
  // References for animation
  const particlesRef = useRef<THREE.Points>(null);
  
  // Generate particles for the cosmic effect
  const particleCount = isProcessEvent ? 50 : Math.max(30, event.intensity * 10);
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  const color = new THREE.Color(event.color);
  const colorHSL = {h: 0, s: 0, l: 0};
  color.getHSL(colorHSL);
  
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    
    // For process events, create a more contained effect
    const radius = isProcessEvent ? 
      0.3 + Math.random() * 0.5 : 
      0.2 + Math.random() * (0.1 * event.intensity);
    
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
    
    // Vary the color slightly
    const newColor = new THREE.Color();
    const hVar = Math.min(0.1, 0.01 * event.intensity); // Color variation based on intensity
    newColor.setHSL(
      (colorHSL.h + (Math.random() * hVar * 2 - hVar)) % 1.0,
      Math.min(1.0, colorHSL.s + Math.random() * 0.2),
      Math.min(0.9, colorHSL.l + Math.random() * 0.3)
    );
    
    colors[i3] = newColor.r;
    colors[i3 + 1] = newColor.g;
    colors[i3 + 2] = newColor.b;
    
    // Vary sizes based on event intensity
    sizes[i] = isProcessEvent ? 
      0.03 + Math.random() * 0.03 : 
      0.05 + Math.random() * (0.01 * event.intensity);
  }
  
  // Animation for particles
  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Slowly rotate the particle system
      particlesRef.current.rotation.y = time * 0.1;
      
      // Pulse the particles
      const positions = particlesRef.current.geometry.attributes.position.array;
      const sizes = particlesRef.current.geometry.attributes.size.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Calculate distance from center
        const dist = Math.sqrt(x * x + y * y + z * z);
        
        // Adjust scale based on sine wave
        const scale = 1 + Math.sin(time * 2 + dist * 5) * 0.2;
        
        // Adjust position to create a breathing effect
        positions[i3] = x * scale;
        positions[i3 + 1] = y * scale;
        positions[i3 + 2] = z * scale;
        
        // Also pulse the sizes
        sizes[i] = (0.05 + Math.random() * 0.01 * event.intensity) * (1 + Math.sin(time * 3 + i) * 0.2);
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.geometry.attributes.size.needsUpdate = true;
    }
  });
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.7}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
