
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
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
  
  // References for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create a pulsing animation for the point
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      // More dynamic pulse effect based on time and event intensity
      const pulseScale = 1 + Math.sin(time * 2.5) * 0.15 * (event.intensity / 10);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    
    if (glowRef.current) {
      const time = state.clock.getElapsedTime();
      // Enhanced independent pulse for the glow
      const glowScale = 1 + Math.sin(time * 3.2) * 0.25;
      glowRef.current.scale.set(glowScale, glowScale, 1);
    }
    
    // Animated halo effect
    if (haloRef.current) {
      const time = state.clock.getElapsedTime();
      haloRef.current.rotation.z = time * 0.3;
      // Subtle breathing effect for the halo
      const haloScale = 1 + Math.sin(time * 1.5) * 0.08;
      haloRef.current.scale.set(haloScale, haloScale, haloScale);
    }
    
    // Animate particles if they exist
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.002;
      particlesRef.current.rotation.z += 0.001;
    }
  });
  
  // Calculate size based on event intensity (1-10)
  const size = 0.04 + (event.intensity / 10) * 0.08;
  
  // Create a texture for the glow effect - creating the canvas element first
  const glowTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(0.3, "rgba(255, 255, 255, 0.6)");
      gradient.addColorStop(0.6, "rgba(255, 255, 255, 0.3)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 128, 128);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Create particles around the event point
  const { particlePositions, particleSizes } = useMemo(() => {
    const count = 15 + Math.floor(event.intensity * 5);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const radius = 0.05 + Math.random() * 0.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      sizes[i] = 0.02 + Math.random() * 0.03;
    }
    
    return { particlePositions: positions, particleSizes: sizes };
  }, [event.intensity]);
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - brighter and more vibrant */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial 
          color={event.color} 
          emissive={event.color}
          emissiveIntensity={2.5}
          transparent 
          opacity={0.95}
        />
      </mesh>
      
      {/* Enhanced glow effect */}
      <sprite ref={glowRef} scale={[1.2 + event.intensity * 0.15, 1.2 + event.intensity * 0.15, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={event.color} 
          transparent 
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* Add a halo ring around intense events */}
      {event.intensity > 5 && (
        <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 3, size * 3.5, 32]} />
          <meshBasicMaterial 
            color={event.color} 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
      
      {/* Surrounding particles for enhanced nebula effect */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleSizes.length}
            array={particleSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color={event.color}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
          map={glowTexture}
        />
      </points>
      
      {/* Stronger point light to illuminate surroundings */}
      <pointLight 
        color={event.color} 
        intensity={0.8 + event.intensity * 0.3}
        distance={2 + event.intensity * 0.4}
        decay={2}
      />
    </group>
  );
};
