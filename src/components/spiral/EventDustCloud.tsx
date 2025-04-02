
import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { 
  getParticleCount, 
  generatePathBasedParticles, 
  generatePointBasedParticles,
  animateParticles
} from "@/utils/dustCloudUtils";

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
  // Get appropriate particle count based on event intensity
  const particlesCount = getParticleCount(event.intensity);
  const pointsRef = useRef<THREE.Points>(null);
  
  // Generate dust particles with appropriate distribution
  const [positions, colors, sizes] = useMemo(() => {
    // For duration events, scatter particles along the path
    if (event.endDate) {
      return generatePathBasedParticles(event, startYear, zoom, particlesCount);
    } else {
      // For point events, create a massive nebula explosion effect
      return generatePointBasedParticles(event, startYear, zoom, particlesCount);
    }
  }, [event, startYear, zoom, particlesCount]);
  
  // Enhanced animation for more dramatic movement
  useFrame(({ clock }) => {
    if (pointsRef.current) {
      // More dramatic pulsing opacity for the whole cloud
      if (pointsRef.current.material instanceof THREE.PointsMaterial) {
        const time = clock.getElapsedTime();
        const pulse = Math.sin(time * 0.3) * 0.15;
        // Higher base opacity for more visibility
        pointsRef.current.material.opacity = 0.98 + pulse;
      }
      
      // Animate individual particles
      const positionsArray = pointsRef.current.geometry.attributes.position.array as Float32Array;
      animateParticles(positionsArray, particlesCount, clock.getElapsedTime(), event.intensity);
      
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
        size={0.7} // Larger base size
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
