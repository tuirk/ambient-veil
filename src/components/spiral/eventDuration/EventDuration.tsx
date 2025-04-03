
import React, { useMemo } from "react";
import * as THREE from "three";
import { TimeEvent } from "@/types/event";
import { calculateSpiralSegment } from "@/utils/spiralUtils";
import { isSeasonalEvent } from "@/utils/seasonalUtils";
import { useParticleTextures } from "./ParticleTextures";
import { generateParticles } from "./ParticleGenerator";
import { ParticleSystemGroup } from "./ParticleSystems";
import { PathLine } from "./PathLine";

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
  
  // Calculate the span length in days for density calculations
  const spanLengthInDays = isMinimalDuration ? 1 : 
    Math.max(1, Math.floor((endEvent.startDate.getTime() - startEvent.startDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Generate points for a smooth curve between the two events
  // More points for longer spans to ensure smooth curves
  const points = calculateSpiralSegment(
    startEvent, 
    endEvent, 
    startYear, 
    // Ensure we have more points for longer spans
    isMinimalDuration ? 100 : 200 + Math.min(300, spanLengthInDays),
    5 * zoom, 
    1.5 * zoom
  );
  
  // Use the color of the start event for the particles
  const colorObj = new THREE.Color(startEvent.color);
  
  // Check if this is a seasonal rough date
  const isRoughDate = isSeasonalEvent(startEvent);

  // Load high-quality textures
  const { particleTexture, glowTexture } = useParticleTextures();
  
  // Number of particles based on event intensity and span length - ENHANCED VALUES
  const particleCount = useMemo(() => {
    // Base count depends on intensity (1-10 scale)
    // Intensity 1 → 400× spanLength (increased from 200)
    // Intensity 5 → 600× spanLength (increased from 400)
    // Intensity 10 → 800× spanLength (increased from 600)
    const intensityFactor = 2 + startEvent.intensity * 0.4; // Increased for better visibility
    const baseMultiplier = 400; // Doubled from 200
    
    // For minimal duration, use a fixed count to ensure visibility
    if (isMinimalDuration) {
      return Math.floor(baseMultiplier * intensityFactor);
    }
    
    // For actual spans, scale by length but cap for performance
    const lengthFactor = Math.min(1.2, Math.log10(spanLengthInDays) / 3 + 0.6);
    return Math.floor(baseMultiplier * intensityFactor * lengthFactor);
  }, [startEvent.intensity, isMinimalDuration, spanLengthInDays]);
  
  // Additional background particles for more volume
  const backgroundParticleCount = Math.floor(particleCount * 0.8);
  const tertiaryParticleCount = Math.floor(particleCount * 0.5);
  
  // Generate all particle data
  const particleData = useMemo(() => generateParticles({
    points,
    particleCount,
    backgroundParticleCount,
    tertiaryParticleCount,
    startEvent,
    isRoughDate,
    isMinimalDuration
  }), [points, particleCount, backgroundParticleCount, tertiaryParticleCount, startEvent, isRoughDate, isMinimalDuration]);
  
  // For all durations, show layered particle systems
  return (
    <group>
      {/* Base path line - very subtle guide, only visible for non-minimal durations */}
      {!isMinimalDuration && (
        <PathLine 
          points={points} 
          color={colorObj} 
          intensity={startEvent.intensity}
          isRoughDate={isRoughDate}
        />
      )}
      
      {/* All particle systems */}
      <ParticleSystemGroup 
        data={particleData}
        textures={{ particleTexture, glowTexture }}
        intensity={startEvent.intensity}
      />
    </group>
  );
};
