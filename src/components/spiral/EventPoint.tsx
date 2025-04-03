
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

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
  
  // Reference for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const textGroupRef = useRef<THREE.Group>(null);
  
  // Create a pulsing animation for the point
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // Pulse effect based on time and event intensity
      const pulseScale = 1 + Math.sin(time * 1.5) * 0.1 * (event.intensity / 10);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Independent pulse for the glow
      const glowScale = 1 + Math.sin(time * 2.2) * 0.15;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
    
    // Make text always face the camera
    if (textGroupRef.current && state.camera) {
      textGroupRef.current.lookAt(state.camera.position);
    }
  });
  
  // Calculate size based on event intensity (1-10)
  // Further reduced by 25% for all event points (on top of previous reduction)
  const size = 0.028 + (event.intensity / 10) * 0.056; // Reduced from 0.0375/0.075
  
  // Create a texture for the glow effect - creating the canvas element first
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
  }
  // Now create the texture from the canvas
  const glowTexture = new THREE.CanvasTexture(canvas);
  
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
          opacity={0.9}
          emissive={eventColor}
          emissiveIntensity={1.1} // Reduced from 1.5
          depthWrite={false} // Prevent depth writing to avoid black shadow
        />
      </mesh>
      
      {/* Glow effect for one-time events */}
      <sprite ref={glowRef} scale={[0.34 + event.intensity * 0.045, 0.34 + event.intensity * 0.045, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={eventColor} 
          transparent 
          opacity={0.6} // Reduced from 0.7
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
          depthWrite={false}
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
          depthWrite={false}
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
