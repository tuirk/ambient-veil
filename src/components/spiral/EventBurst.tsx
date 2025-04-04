
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";

interface EventBurstProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
}

export const EventBurst: React.FC<EventBurstProps> = ({ 
  event, 
  startYear, 
  zoom 
}) => {
  // Get position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // References for animation
  const burstRef = useRef<THREE.Group>(null);
  
  // Create burst rays - rays of light emanating from the event point
  const rayCount = 12 + Math.floor(event.intensity / 2); // More rays for more intense events
  const innerRadius = 0.05 + (event.intensity / 20); // Core radius
  const outerRadius = 0.15 + (event.intensity / 10); // Ray length
  
  // Setup burst ray geometry
  const rays = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    // Alternate ray lengths for more dynamic look
    const rayLength = outerRadius * (0.7 + 0.3 * Math.sin(i * 3));
    
    // Calculate ray vertices
    const x1 = Math.cos(angle) * innerRadius;
    const y1 = Math.sin(angle) * innerRadius;
    const x2 = Math.cos(angle) * rayLength;
    const y2 = Math.sin(angle) * rayLength;
    
    rays.push(
      <mesh key={i} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([x1, y1, 0, x2, y2, 0])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={event.color}
          transparent
          opacity={0.7}
          linewidth={1}
        />
      </mesh>
    );
  }
  
  // Animate the burst
  useFrame((state) => {
    if (burstRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Rotate the burst slowly
      burstRef.current.rotation.z = time * 0.2;
      
      // Pulse the scale for more dynamic effect
      const pulseScale = 1 + 0.1 * Math.sin(time * 2);
      burstRef.current.scale.set(pulseScale, pulseScale, 1);
    }
  });
  
  return (
    <group position={position}>
      {/* Burst rays */}
      <group ref={burstRef}>
        {rays}
      </group>
      
      {/* Central glow for the burst */}
      <sprite scale={[0.3 + event.intensity * 0.05, 0.3 + event.intensity * 0.05, 1]}>
        <spriteMaterial
          map={new THREE.CanvasTexture((() => {
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
            return canvas;
          })())}
          color={event.color}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};
