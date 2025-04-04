
import React, { useMemo } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { getQuarterlyEventPosition, calculateQuarterlySpiralSegment } from "@/utils/quarterlyUtils";
import { getEventPosition, calculateSpiralSegment } from "@/utils/spiralUtils";
import { CosmicEventEffect } from "./CosmicEventEffect";

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
  
  // Use useMemo to optimize rendering and avoid unnecessary recalculations
  const filteredEvents = useMemo(() => {
    return events.filter(event => 
      event.startDate.getFullYear() >= config.startYear && 
      event.startDate.getFullYear() <= config.currentYear
    );
  }, [events, config.startYear, config.currentYear]);
  
  // Memoize high-intensity events to improve performance
  const highIntensityEvents = useMemo(() => {
    return filteredEvents.filter(event => event.intensity >= 8);
  }, [filteredEvents]);
  
  return (
    <>
      {filteredEvents.map((event) => {
        const eventYear = event.startDate.getFullYear();
        const eventMonth = event.startDate.getMonth();
        
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
              startYear={config.startYear}
              zoom={config.zoom}
              onClick={() => onEventClick(eventYear, eventMonth, position.x, position.z)}
            />
          );
        } 
        // For events with end date, show a duration line
        else {
          // Create a mock end event for the segment calculation
          const endEvent = {...event, startDate: event.endDate};
          
          return (
            <EventDuration
              key={event.id}
              startEvent={event}
              endEvent={endEvent}
              startYear={config.startYear}
              zoom={config.zoom}
            />
          );
        }
      })}
      
      {/* Add cosmic effect only for high-intensity events (optimized with useMemo) */}
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
