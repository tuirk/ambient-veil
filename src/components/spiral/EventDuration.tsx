
import React, { useRef, useMemo } from "react";
import { Line, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { isSeasonalEvent } from "@/utils/seasonalUtils";

interface EventDurationProps {
  startEvent: TimeEvent;   // Event that marks the start of the duration
  endEvent: TimeEvent;     // Event that marks the end of the duration
  startYear: number;       // First year of the spiral (used for positioning)
  zoom: number;            // Current zoom level (affects visual scale)
}

/**
 * Renders a cosmic dust trail between two events on the spiral, representing a duration
 * Inspired by deep space nebula imagery
 */
export const EventDuration: React.FC<EventDurationProps> = ({ 
  startEvent, 
  endEvent, 
  startYear, 
  zoom 
}) => {
  // Calculate if this is a minimal duration (no end date or same as start date)
  const isMinimalDuration = !startEvent.endDate || 
    startEvent.startDate.getTime() === (startEvent.endDate?.getTime() || 0);
  
  // Generate points for a smooth curve between the two events
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    isMinimalDuration ? 50 : 300,  // More points for more detailed dust trail
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the particles
  const colorObj = new THREE.Color(startEvent.color);
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);

  // Generate particles for nebula effect
  const particlesRef = useRef<THREE.Points>(null);
  
  // Create texture for dust particles
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Number of particles based on event intensity and path length
  const particleCount = useMemo(() => {
    const baseCount = isMinimalDuration ? 50 : 200;
    return Math.floor(baseCount * (0.5 + startEvent.intensity * 0.1));
  }, [startEvent.intensity, isMinimalDuration]);
  
  // Generate particles distributed along the path
  const { particlePositions, particleSizes, particleOpacities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const opacities = new Float32Array(particleCount);
    
    // Path length for distribution calculation
    const pathLength = points.length;
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles along the path
      const pathIndex = Math.floor(Math.random() * (pathLength - 1));
      const point = points[pathIndex];
      
      // Add some random offset to create volume around the line
      const spreadFactor = isRoughDate ? 0.35 : 0.25; // More spread for seasonal events
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * spreadFactor,
        (Math.random() - 0.5) * spreadFactor,
        (Math.random() - 0.5) * spreadFactor
      );
      
      const i3 = i * 3;
      positions[i3] = point.x + randomOffset.x;
      positions[i3 + 1] = point.y + randomOffset.y;
      positions[i3 + 2] = point.z + randomOffset.z;
      
      // Vary the size of particles
      sizes[i] = (0.05 + Math.random() * 0.15) * (0.5 + startEvent.intensity * 0.05);
      
      // Vary opacity based on position in the trail
      const pathProgress = pathIndex / pathLength;
      const baseOpacity = isRoughDate ? 0.3 : 0.5; // Lower opacity for seasonal events
      opacities[i] = baseOpacity * (0.2 + Math.random() * 0.8) * (0.5 + startEvent.intensity * 0.05);
    }
    
    return { particlePositions: positions, particleSizes: sizes, particleOpacities: opacities };
  }, [points, particleCount, isRoughDate, startEvent.intensity]);
  
  // Subtle animation for the dust trail
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Very slow subtle drift
      particlesRef.current.rotation.y += delta * 0.002;
      
      // Pulsate very subtly
      const time = state.clock.getElapsedTime();
      const pulseScale = 1 + Math.sin(time * 0.2) * 0.01;
      particlesRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });
  
  // For minimal durations (no end date or when it's the same as start date)
  // we'll still show some particle dust to represent the event's presence
  if (isMinimalDuration) {
    return (
      <group>
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={particlePositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={particleCount}
              array={particleSizes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.1}
            color={colorObj}
            transparent
            opacity={0.6}
            depthWrite={false}
            map={particleTexture}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    );
  }
  
  // For normal duration events, show both line and particles
  return (
    <group>
      {/* Base path line - very subtle */}
      <Line
        points={points}
        color={colorObj}
        lineWidth={0.5 + startEvent.intensity * 0.1}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        dashed={isRoughDate}
        dashSize={isRoughDate ? 0.1 : 0}
        dashOffset={isRoughDate ? 0.1 : 0}
        dashScale={isRoughDate ? 10 : 0}
      />
      
      {/* Particle dust cloud along the path */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={particleSizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color={colorObj}
          transparent
          opacity={0.5 + startEvent.intensity * 0.05}
          depthWrite={false}
          map={particleTexture}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};
