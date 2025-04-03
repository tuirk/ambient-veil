
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getIntensityScaling, createParticleTexture } from "./eventDuration/ParticleTextures";

interface EventPointProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  onClick?: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom, 
  onClick 
}) => {
  // Get position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // Get standardized intensity scaling
  const intensityScaling = getIntensityScaling(event.intensity);
  
  // Reference for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  
  // Create a consistent texture
  const glowTexture = useMemo(() => createParticleTexture(), []);
  
  // Create a pulsing animation for the point
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Pulse effect based on time and event intensity
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.1 * intensityScaling.pulseFactor;
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Independent pulse for the glow - scaled by intensity
      const glowScale = 1 + Math.sin(time * 2.2) * 0.15 * intensityScaling.pulseFactor;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
    
    // Make text always face the camera
    if (textGroupRef.current && state.camera) {
      textGroupRef.current.lookAt(state.camera.position);
    }
  });
  
  // Calculate size based on event intensity (1-10)
  const size = (0.025 + (event.intensity / 10) * 0.05) * intensityScaling.sizeFactor;
  
  // Format date for display
  const year = event.startDate.getFullYear();
  
  // Get mood color if available, otherwise use event color
  const eventColor = event.mood?.color || event.color;
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - small but visible */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial 
          color={eventColor} 
          transparent 
          opacity={0.9 * intensityScaling.opacityFactor}
          emissive={eventColor}
          emissiveIntensity={1.0 * intensityScaling.opacityFactor} 
          depthWrite={false} // Prevent depth writing to avoid black shadow
        />
      </mesh>
      
      {/* Glow effect for one-time events */}
      <sprite ref={glowRef} scale={[0.3 + event.intensity * 0.04 * intensityScaling.sizeFactor, 0.3 + event.intensity * 0.04 * intensityScaling.sizeFactor, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={eventColor} 
          transparent 
          opacity={0.55 * intensityScaling.opacityFactor} 
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* Improved event label group that always faces camera */}
      <group ref={textGroupRef} position={[0, size * 2 + 0.05, 0]}>
        {/* Title text with improved visibility */}
        <Text
          position={[0, 0.12, 0]}
          color="white"
          fontSize={0.10}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.004}
          outlineColor="#000000"
          renderOrder={100} // Ensure text renders on top
        >
          {event.title}
        </Text>
        
        {/* Year text */}
        <Text
          position={[0, 0.02, 0]}
          color="white"
          fontSize={0.08}
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.003}
          outlineColor="#000000"
          renderOrder={100} // Ensure text renders on top
        >
          {year}
        </Text>
        
        {/* Optional mood indicator if mood is present */}
        {event.mood && (
          <mesh position={[0, -0.05, 0]} scale={[0.05, 0.05, 0.01]}>
            <planeGeometry />
            <meshBasicMaterial color={event.mood.color} depthWrite={false} />
          </mesh>
        )}
      </group>
    </group>
  );
};
