import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";

interface EventDurationProps {
  startEvent: TimeEvent;
  endEvent: TimeEvent;
  startYear: number;
  zoom: number;
}

export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  // Calculate the segment of the spiral that this event covers
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    30,
    5 * zoom, 
    1.5 * zoom
  );
  
  // Parse the event color
  const eventColorObj = new THREE.Color(startEvent.color);
  
  // References for animation
  const particlesRef = useRef<THREE.Points>(null);
  const lineRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  
  // Generate particle texture for glow effect
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Generate dense particle cloud along the duration
  const { particlePositions, particleColors, particleSizes } = useMemo(() => {
    // Increased particle count for more visibility
    const particleCount = Math.min(800, 300 + Math.floor(startEvent.intensity * 80));
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const baseColor = new THREE.Color(startEvent.color);
    
    // Create particles distributed along the spiral segment
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Pick a random point along the line
      const pointIndex = Math.floor(Math.random() * points.length);
      const basePoint = points[pointIndex];
      
      // Add some randomness within a "cloud" around the path
      const spread = 0.6 + (startEvent.intensity / 10) * 0.7; // Scale with intensity
      const offsetX = (Math.random() - 0.5) * spread;
      const offsetY = (Math.random() - 0.5) * spread;
      const offsetZ = (Math.random() - 0.5) * spread;
      
      positions[i3] = basePoint.x + offsetX;
      positions[i3 + 1] = basePoint.y + offsetY;
      positions[i3 + 2] = basePoint.z + offsetZ;
      
      // All particles have the same base color but vary in brightness
      // Keep closer to event color with just minor variations for visual interest
      const brightness = 0.95 + Math.random() * 0.3;
      colors[i3] = baseColor.r * brightness;
      colors[i3 + 1] = baseColor.g * brightness;
      colors[i3 + 2] = baseColor.b * brightness;
      
      // Vary particle sizes based on intensity and random factor
      const sizeVariation = Math.random() * 0.8 + 0.7; // 0.7 to 1.5
      sizes[i] = (0.35 + (startEvent.intensity / 10) * 0.45) * sizeVariation;
    }
    
    return { particlePositions: positions, particleColors: colors, particleSizes: sizes };
  }, [points, startEvent.color, startEvent.intensity]);
  
  // Animate the particles
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Slight rotation to create movement in the dust cloud
      particlesRef.current.rotation.y += delta * 0.05;
      
      // Subtle pulsing effect
      const time = state.clock.getElapsedTime();
      const pulse = Math.sin(time * 0.7) * 0.1 + 1;
      particlesRef.current.scale.set(pulse, pulse, pulse);
    }
    
    if (glowRef.current && points.length > 0) {
      // Pulsate the glow intensity
      const time = state.clock.getElapsedTime();
      
      // Move glow along the path for longer events
      const index = Math.floor((time * 0.2) % points.length);
      const position = points[index];
      glowRef.current.position.set(position.x, position.y, position.z);
      
      // Pulse the intensity
      const pulseIntensity = (Math.sin(time * 1.2) * 0.3 + 0.8) * startEvent.intensity * 0.4;
      glowRef.current.intensity = pulseIntensity;
    }
  });

  return (
    <group>
      {/* Core line showing the path - replaced native line with drei's Line */}
      <Line
        points={points}
        color={eventColorObj}
        lineWidth={2 + startEvent.intensity * 0.5}
        opacity={0.9 + startEvent.intensity * 0.1}
        transparent
      />
      
      {/* Dense particle cloud around the line */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleColors.length / 3}
            array={particleColors}
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
          size={0.45}
          vertexColors
          transparent
          opacity={0.98}
          alphaMap={particleTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Moving glow effect along the line */}
      {points.length > 0 && (
        <pointLight
          ref={glowRef}
          color={eventColorObj}
          intensity={startEvent.intensity * 0.35}
          distance={4}
          position={points[0]}
        />
      )}
      
      {/* Core intense glow at the origin */}
      {points.length > 0 && (
        <mesh position={points[0]}>
          <sphereGeometry args={[0.2 + startEvent.intensity * 0.05, 8, 8]} />
          <meshBasicMaterial
            color={startEvent.color}
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
      
      {/* Add additional glow spots along the duration path */}
      {points.length > 5 && (
        <>
          <mesh position={points[Math.floor(points.length * 0.33)]}>
            <sphereGeometry args={[0.15 + startEvent.intensity * 0.04, 8, 8]} />
            <meshBasicMaterial
              color={startEvent.color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          <mesh position={points[Math.floor(points.length * 0.66)]}>
            <sphereGeometry args={[0.15 + startEvent.intensity * 0.04, 8, 8]} />
            <meshBasicMaterial
              color={startEvent.color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </>
      )}
    </group>
  );
};
