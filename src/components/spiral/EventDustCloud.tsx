
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
    if (intensity >= 8) return Math.floor(120 + (intensity - 8) * 50); // High: 120-200
    if (intensity >= 4) return Math.floor(60 + (intensity - 4) * 15); // Medium: 60-120
    return Math.floor(20 + intensity * 5); // Low: 20-35
  };
  
  const particlesCount = getParticleCount(event.intensity);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles based on event properties
  const [positions, colors, sizes] = useMemo(() => {
    // Create array buffers for particle properties
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);
    
    const color = new THREE.Color(event.color);
    // Base size determined by intensity - increased for better visibility
    const baseSize = 0.1 + (event.intensity * 0.03); 
    
    // If it's a duration event, scatter particles along the path
    if (event.endDate) {
      const points = calculateSpiralSegment(
        event,
        {...event, startDate: event.endDate},
        startYear,
        200, // More points for smoother distribution
        5 * zoom,
        1.5 * zoom
      );
      
      // Fill arrays with randomized particles along the path
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Pick a random point along the path with preference for even distribution
        const pathIndex = Math.floor(Math.random() * points.length);
        const point = points[pathIndex];
        
        // Add significant random scatter for splatter effect
        // Greatly increased scatter radius to create more "explosion" effect
        const scatter = 1.2 * (0.8 + (event.intensity / 10));
        
        // Random scattered position with 3D volumetric effect
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * scatter * 2.0, // Much more horizontal spread
          (Math.random() - 0.5) * scatter * 1.5, // More vertical spread (above/below spiral)
          (Math.random() - 0.5) * scatter * 2.0  // Much more depth spread
        );
        
        positions[i3] = point.x + randomOffset.x;
        positions[i3 + 1] = point.y + randomOffset.y;
        positions[i3 + 2] = point.z + randomOffset.z;
        
        // More pronounced color variation to create visual interest
        const colorVariation = 0.4;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More significant size variation for natural look
        // Different particle sizes create more dimensionality
        sizes[i] = baseSize * (0.3 + Math.random() * 3.0);
      }
    } else {
      // For point events, create a splash effect around the point
      const centerPosition = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
      // Much wider spread factor for more dramatic particle explosion
      const spreadFactor = 1.0 + (event.intensity * 0.15); 
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Create more randomized distribution around the event
        // Use spherical distribution for better 3D feel
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.random() * Math.PI;
        // Varied distances from center create splash effect
        // Use non-linear distribution to create clusters and outliers
        const r = Math.pow(Math.random(), 0.4) * spreadFactor; 
        
        positions[i3] = centerPosition.x + r * Math.sin(theta) * Math.cos(phi);
        positions[i3 + 1] = centerPosition.y + r * Math.sin(theta) * Math.sin(theta) * 1.2; // More Y variance
        positions[i3 + 2] = centerPosition.z + r * Math.sin(theta) * Math.sin(phi);
        
        // Stronger color variation for visual richness
        const colorVariation = 0.4;
        colors[i3] = color.r * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 1] = color.g * (1 - colorVariation + Math.random() * colorVariation);
        colors[i3 + 2] = color.b * (1 - colorVariation + Math.random() * colorVariation);
        
        // More size variation for particles - smaller particles create depth effect
        // Particles closer to center are larger
        const sizeVariation = 0.3 + Math.random() * 3.0;
        const distanceFactor = 1 - (r / spreadFactor) * 0.3; // Particles farther from center are smaller
        sizes[i] = baseSize * sizeVariation * distanceFactor;
      }
    }
    
    return [positions, colors, sizes];
  }, [event, startYear, zoom, particlesCount]);
  
  // Enhanced animation for the dust particles
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // Gentle pulsing opacity for the whole cloud
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.3) * 0.15;
        pointsRef.current.material.opacity = 0.75 + pulse;
      }
      
      // Subtle jitter for individual particles - creates "alive" feeling
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Apply more noticeable movement - like cosmic dust drifting in space
        const jitter = 0.005;
        positions[i3] += (Math.random() - 0.5) * jitter;
        positions[i3 + 1] += (Math.random() - 0.5) * jitter * 0.8;
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
        size={0.15}
        vertexColors
        transparent
        alphaMap={new THREE.TextureLoader().load('/lovable-uploads/4d8a6c90-07e8-45a8-bd26-3b2c8db4cce8.png')}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.75}
      />
    </points>
  );
};
