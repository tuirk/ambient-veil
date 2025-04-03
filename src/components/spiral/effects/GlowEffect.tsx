
import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface GlowEffectProps {
  color: string;
  intensity: number;
  isProcessEvent?: boolean;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ 
  color, 
  intensity,
  isProcessEvent = false 
}) => {
  const glowRef = useRef<THREE.Sprite>(null);
  
  // Create a texture for the glow
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Animation for the glow
  useFrame((state) => {
    if (glowRef.current) {
      // Pulsate the glow - stronger for one-time events
      const time = state.clock.getElapsedTime();
      const pulseIntensity = isProcessEvent ? 0.1 : 0.2;
      const pulseSpeed = isProcessEvent ? 1.2 : 1.8;
      const pulseScale = 1 + Math.sin(time * pulseSpeed) * pulseIntensity;
      
      // One-time events: larger glow
      // Process events: more subdued glow
      const baseScale = isProcessEvent 
        ? 0.6 + intensity * 0.08
        : 0.9 + intensity * 0.12;
      
      glowRef.current.scale.set(
        baseScale * pulseScale, 
        baseScale * pulseScale, 
        1
      );
    }
  });
  
  return (
    <sprite ref={glowRef}>
      <spriteMaterial
        map={glowTexture}
        color={new THREE.Color(color)}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
};
