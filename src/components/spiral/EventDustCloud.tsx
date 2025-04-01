
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
  // Use fewer particles for a more sparse, lightweight look
  const particlesCount = event.endDate 
    ? Math.min(20, Math.max(5, event.intensity * 2)) // Fewer for duration events
    : Math.min(30, Math.max(5, event.intensity * 3)); // More for point events
    
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles based on event properties
  const [positions, colors, sizes] = useMemo(() => {
    // Create array buffers for particle properties
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const color = new THREE.Color(event.color);
    // Base size normalized to be smaller overall
    const baseSize = 0.04 + (event.intensity * 0.01); 
    
    // If it's a duration event, scatter particles along the path
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
        
        // Add more random scatter to spread particles out
        const scatter = 0.2 * (0.5 + (event.intensity / 20));
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * scatter,
          (Math.random() - 0.5) * scatter,
          (Math.random() - 0.5) * scatter
        );
        
        positions[i3] = point.x + randomOffset.x;
        positions[i3 + 1] = point.y + randomOffset.y;
        positions[i3 + 2] = point.z + randomOffset.z;
        
        // More color variation for interesting visual effect
        const colorVariation = 0.15;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More size variation for natural look
        sizes[i] = baseSize * (0.5 + Math.random() * 1.5);
      }
    } else {
      // For point events, create a more scattered cluster around the point
      const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      // Wider spread factor for more scattered appearance
      const spreadFactor = 0.25 + (event.intensity * 0.03); 
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Create more randomized distribution around the event
        // Use box distribution for squarish particles like in reference
        const offsetX = (Math.random() - 0.5) * spreadFactor * 2;
        const offsetY = (Math.random() - 0.5) * spreadFactor;
        const offsetZ = (Math.random() - 0.5) * spreadFactor * 2;
        
        positions[i3] = centerPosition.x + offsetX;
        positions[i3 + 1] = centerPosition.y + offsetY;
        positions[i3 + 2] = centerPosition.z + offsetZ;
        
        // Slight color variation
        const colorVariation = 0.15;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More size variation for point events to match reference image
        sizes[i] = baseSize * (0.8 + Math.random() * 1.7) * (event.intensity / 5);
      }
    }
    
    return [positions, colors, sizes];
  }, [event, startYear, zoom, particlesCount]);
  
  // Subtle animation for the dust particles
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Very subtle pulsing opacity for the whole cloud
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.5) * 0.1;
        pointsRef.current.material.opacity = 0.6 + pulse;
      }
      
      // Very subtle jitter for individual particles
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Apply extremely subtle movement (almost imperceptible)
        const jitter = 0.0005;
        positions[i3] += (Math.random() - 0.5) * jitter;
        positions[i3 + 1] += (Math.random() - 0.5) * jitter;
        positions[i3 + 2] += (Math.random() - 0.5) * jitter;
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
        size={0.12}
        vertexColors
        transparent
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/0f532d7b-5ec9-4542-9ddb-337f9dc1ee3f.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.6}
      />
    </points>
  );
};
