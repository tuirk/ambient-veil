
import React, { useMemo } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { getQuarterlyEventPosition, calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";
import { getEventPosition, calculateSpiralSegment } from "@/utils/spiralUtils";
import { CosmicEventEffect } from "./CosmicEventEffect";
import * as THREE from "three";

interface EventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const EventVisualizations: React.FC<EventVisualizationsProps> = ({
  events,
  config,
  onEventClick,
}) => {
  // Determine if we're in quarterly or annual view based on the spiral config
  const isQuarterly = config.currentYear === new Date().getFullYear() && 
                     config.startYear === config.currentYear;
  
  // Memoize filtered events to prevent recalculation on every render
  const filteredEvents = useMemo(() => {
    // Only show events within the visible time range
    return events.filter(event => 
      event.startDate.getFullYear() >= config.startYear && 
      event.startDate.getFullYear() <= config.currentYear
    ).sort((a, b) => a.startDate.getTime() - b.startDate.getTime()); // Sort by date for better optimization
  }, [events, config.startYear, config.currentYear]);
  
  // Pre-compute event positions to reduce calculations during rendering
  const eventPositions = useMemo(() => {
    const positions = new Map<string, THREE.Vector3>();
    
    filteredEvents.forEach(event => {
      if (!event.endDate) {
        const position = isQuarterly
          ? getQuarterlyEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom)
          : getEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom);
        
        positions.set(event.id, position);
      }
    });
    
    return positions;
  }, [filteredEvents, config.startYear, config.zoom, isQuarterly]);
  
  // Optimize event segments for duration events
  const eventSegments = useMemo(() => {
    const segments = new Map<string, THREE.Vector3[]>();
    
    filteredEvents.forEach(event => {
      if (event.endDate) {
        // Create a mock end event for the segment calculation
        const endEvent = {...event, startDate: event.endDate};
        
        const points = isQuarterly
          ? calculateQuarterlySpiralSegment(event, endEvent, config.startYear, 30, 5 * config.zoom, 1.5 * config.zoom)
          : calculateSpiralSegment(event, endEvent, config.startYear, 30, 5 * config.zoom, 1.5 * config.zoom);
        
        segments.set(event.id, points);
      }
    });
    
    return segments;
  }, [filteredEvents, config.startYear, config.zoom, isQuarterly]);
  
  // Memoize high-intensity events (used for cosmic effects)
  // Only render cosmic effects for high-intensity events to reduce GPU load
  const highIntensityEvents = useMemo(() => {
    // Limit the number of cosmic effects to prevent overloading the GPU
    return filteredEvents
      .filter(event => event.intensity >= 8)
      .slice(0, 5); // Limit to 5 cosmic effects at most
  }, [filteredEvents]);
  
  return (
    <>
      {/* Regular event points (no end date) */}
      {filteredEvents.map((event) => {
        if (!event.endDate) {
          const position = eventPositions.get(event.id);
          if (!position) return null; // Skip if position not found
          
          const eventYear = event.startDate.getFullYear();
          const eventMonth = event.startDate.getMonth();
          
          return (
            <EventPoint
              key={event.id}
              event={event}
              position={position}
              startYear={config.startYear}
              zoom={config.zoom}
              onClick={() => onEventClick(eventYear, eventMonth, position.x, position.z)}
            />
          );
        }
        return null;
      })}
      
      {/* Duration events (with end date) */}
      {filteredEvents.map((event) => {
        if (event.endDate) {
          const points = eventSegments.get(event.id);
          if (!points) return null; // Skip if points not found
          
          return (
            <EventDuration
              key={event.id}
              event={event}
              points={points}
              startYear={config.startYear}
              zoom={config.zoom}
            />
          );
        }
        return null;
      })}
      
      {/* Cosmic effects only for high-intensity events */}
      {highIntensityEvents.map(event => (
        <CosmicEventEffect
          key={`effect-${event.id}`}
          event={event}
          startYear={config.startYear}
          zoom={config.zoom}
          isProcessEvent={event.eventType === "process"}
        />
      ))}
    </>
  );
};
