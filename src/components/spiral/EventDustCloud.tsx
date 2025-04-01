
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
  const particlesCount = Math.max(100, event.intensity * 50); // More particles for higher intensity
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles based on event properties
  const [positions, colors, sizes] = useMemo(() => {
    // Create array buffers for particle properties
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const color = new THREE.Color(event.color);
    const baseSize = 0.05 + (event.intensity * 0.02); // Scale size based on intensity
    
    // If it's a duration event, spread particles along the path
    if (event.endDate) {
      const points = calculateSpiralSegment(
        event,
        {...event, startDate: event.endDate},
        startYear,
        30,
        5 * zoom,
        1.5 * zoom
      );
      
      // Fill arrays with randomized particles along the path
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Pick a random point along the path
        const pathIndex = Math.floor(Math.random() * points.length);
        const point = points[pathIndex];
        
        // Add some random scatter within the tube
        const scatter = 0.12 * (0.5 + (event.intensity / 20));
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * scatter,
          (Math.random() - 0.5) * scatter,
          (Math.random() - 0.5) * scatter
        );
        
        positions[i3] = point.x + randomOffset.x;
        positions[i3 + 1] = point.y + randomOffset.y;
        positions[i3 + 2] = point.z + randomOffset.z;
        
        // Slight color variation for visual interest
        const colorVariation = 0.1;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // Random size variation
        sizes[i] = baseSize * (0.5 + Math.random());
      }
    } else {
      // For point events, create a cluster around the point
      const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      const spreadFactor = 0.2 + (event.intensity * 0.04); // Higher intensity = more spread
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Create a sphere of particles around the event
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = Math.random() * spreadFactor;
        
        positions[i3] = centerPosition.x + (radius * Math.sin(phi) * Math.cos(theta));
        positions[i3 + 1] = centerPosition.y + (radius * Math.sin(phi) * Math.sin(theta));
        positions[i3 + 2] = centerPosition.z + (radius * Math.cos(phi));
        
        // Slight color variation
        const colorVariation = 0.15;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More size variation for point events
        sizes[i] = baseSize * (0.3 + Math.random() * 1.4);
      }
    }
    
    return [positions, colors, sizes];
  }, [event, startYear, zoom, particlesCount]);
  
  // Animate the dust particles
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Subtle pulsing of the whole cloud
      const time = clock.getElapsedTime();
      pointsRef.current.material.opacity = 0.7 + Math.sin(time * 0.5) * 0.15;
      
      // Random motion of individual particles
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const originalPositions = positions.slice(); // Make a copy of the original positions
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Very subtle movement
        const jitter = event.intensity * 0.001;
        positions[i3] = originalPositions[i3] + (Math.random() - 0.5) * jitter;
        positions[i3 + 1] = originalPositions[i3 + 1] + (Math.random() - 0.5) * jitter;
        positions[i3 + 2] = originalPositions[i3 + 2] + (Math.random() - 0.5) * jitter;
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
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/c5bb5f0f-0c22-4c62-9fd8-26bde53ee35c.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.85}
      />
    </points>
  );
};
