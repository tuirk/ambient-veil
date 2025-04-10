
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getMonthlyEventPosition } from "@/utils/monthlyUtils";
import { getWeeklyEventPosition } from "@/utils/weeklyUtils";
import { getSeasonMiddleDate } from "@/utils/seasonalUtils";

interface EventPointProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  viewType?: "annual" | "quarterly" | "monthly" | "weekly";
  startDate?: Date;
  onClick?: () => void;
}

export const EventPoint: React.FC<EventPointProps> = ({ 
  event, 
  startYear, 
  zoom, 
  viewType = "annual",
  startDate,
  onClick 
}) => {
  // Get position on the spiral based on view type
  const position = useMemo(() => {
    if (viewType === "quarterly") {
      return getQuarterlyEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
    } else if (viewType === "monthly") {
      return getMonthlyEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
    } else if (viewType === "weekly" && startDate) {
      // Handle seasonal rough dates for weekly view
      let effectiveEvent = {...event};
      if (event.isRoughDate && event.roughDateSeason && event.roughDateYear) {
        effectiveEvent = {
          ...event,
          startDate: getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear)
        };
      }
      return getWeeklyEventPosition(effectiveEvent, startDate, 5 * zoom, 0.7 * zoom);
    } else {
      // Default to annual view
      return getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
    }
  }, [event, startYear, zoom, viewType, startDate]);
  
  // Reference for animation
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Sprite>(null);
  
  // Create a texture for the glow effect using useMemo to prevent recreation on every render
  const glowTexture = useMemo(() => {
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
    return new THREE.CanvasTexture(canvas);
  }, []);
  
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
  });
  
  // Calculate size based on event intensity (1-10) and view type
  // Adjust size for different view types
  const getEventSize = () => {
    const baseSize = 0.0375 + (event.intensity / 10) * 0.075;
    
    if (viewType === "weekly") {
      return baseSize * 0.7; // Smaller for weekly view
    } else if (viewType === "monthly") {
      return baseSize * 0.85; // Slightly smaller for monthly view
    } else if (viewType === "quarterly") {
      return baseSize * 0.95; // Very slightly smaller for quarterly view
    }
    
    return baseSize; // Default size for annual view
  };
  
  const size = getEventSize();
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core particle - small but visible */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial 
          color={event.color} 
          transparent 
          opacity={0.9}
          emissive={event.color}
          emissiveIntensity={1.5}
        />
      </mesh>
      
      {/* Glow effect for one-time events */}
      <sprite ref={glowRef} scale={[0.45 + event.intensity * 0.06, 0.45 + event.intensity * 0.06, 1]}>
        <spriteMaterial 
          map={glowTexture} 
          color={event.color} 
          transparent 
          opacity={0.7}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
};
