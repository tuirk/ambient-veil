
import React from "react";
import { TimeEvent } from "@/types/event";
import { getEventPosition } from "@/utils/spiralUtils";
import { ParticleCloud } from "./effects/ParticleCloud";
import { GlowEffect } from "./effects/GlowEffect";
import { EventRing } from "./effects/EventRing";
import { EventLight } from "./effects/EventLight";
import { EventParticleCloud } from "./effects/EventParticleCloud";

interface CosmicEventEffectProps {
  event: TimeEvent;
  startYear: number;
  zoom: number;
  isProcessEvent?: boolean;
}

export const CosmicEventEffect: React.FC<CosmicEventEffectProps> = ({ 
  event, 
  startYear, 
  zoom,
  isProcessEvent = false
}) => {
  // Get the base position on the spiral
  const position = getEventPosition(event, startYear, 5 * zoom, 1.5 * zoom);
  
  // Use event's mood color if available
  const eventColor = event.mood?.color || event.color;
  
  return (
    <group position={position}>
      {/* Particle cloud for nebula effect */}
      <EventParticleCloud 
        color={eventColor} 
        intensity={event.intensity} 
        isProcessEvent={isProcessEvent} 
      />
      
      {/* Glow sprite for the central core */}
      <GlowEffect 
        color={eventColor} 
        intensity={event.intensity} 
        isProcessEvent={isProcessEvent} 
      />
      
      {/* Thin glowing ring */}
      <EventRing 
        color={eventColor} 
        isProcessEvent={isProcessEvent} 
      />
      
      {/* Point light for illumination */}
      <EventLight 
        color={eventColor} 
        intensity={event.intensity} 
        isProcessEvent={isProcessEvent} 
      />
    </group>
  );
};
