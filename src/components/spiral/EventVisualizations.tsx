
import React from "react";
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
  const isQuarterly = config.currentYear === new Date().getFullYear();
  
  return (
    <>
      {events.map((event) => {
        const eventYear = event.startDate.getFullYear();
        const eventMonth = event.startDate.getMonth();
        
        // Skip events outside the visible range
        if (eventYear < config.startYear || eventYear > config.currentYear) {
          return null;
        }
        
        // For events without end date, show a point
        if (!event.endDate) {
          // Use quarterly or annual position calculation based on view
          const position = isQuarterly
            ? getQuarterlyEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom)
            : getEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom);
          
          // Create the event point visualization
          return (
            <EventPoint
              key={event.id}
              event={event}
              position={position}
              onClick={() => onEventClick(eventYear, eventMonth, position.x, position.z)}
            />
          );
        } 
        // For events with end date, show a duration line
        else {
          // Create a mock end event for the segment calculation
          const endEvent = {...event, startDate: event.endDate};
          
          // Calculate segment points based on view type
          const segmentPoints = isQuarterly
            ? calculateQuarterlySpiralSegment(event, endEvent, config.startYear, 100, 5 * config.zoom, 1.5 * config.zoom)
            : calculateSpiralSegment(event, endEvent, config.startYear, 100, 5 * config.zoom, 1.5 * config.zoom);
            
          // Create the event duration visualization
          return (
            <EventDuration
              key={event.id}
              event={event}
              points={segmentPoints}
            />
          );
        }
      })}
      
      {/* Add cosmic effect for high-intensity events */}
      {events
        .filter(event => event.intensity >= 8)
        .map(event => {
          const position = isQuarterly
            ? getQuarterlyEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom)
            : getEventPosition(event, config.startYear, 5 * config.zoom, 1.5 * config.zoom);
            
          return (
            <CosmicEventEffect
              key={`effect-${event.id}`}
              position={position}
              color={new THREE.Color(event.color)}
              intensity={event.intensity}
            />
          );
        })
      }
    </>
  );
};
