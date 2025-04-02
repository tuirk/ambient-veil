
import React from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";
import { FutureEvent } from "./effects/FutureEvent";
import { isOneTimeEvent } from "@/utils/eventUtils";

interface EventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const EventVisualizations: React.FC<EventVisualizationsProps> = ({
  events,
  config,
  onEventClick
}) => {
  return (
    <>
      {events.map((event) => {
        // Future events render as scattered objects
        if (event.startDate.getFullYear() > config.currentYear) {
          return (
            <FutureEvent 
              key={event.id}
              event={event}
              onEventClick={onEventClick}
            />
          );
        }
        
        // Determine if this should be visualized as a one-time or process event
        const actuallyOneTimeEvent = isOneTimeEvent(event);
        
        return (
          <React.Fragment key={event.id}>
            {/* ONLY add cosmic effect for actual one-time events */}
            {actuallyOneTimeEvent && (
              <CosmicEventEffect
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                isProcessEvent={false}
              />
            )}
            
            {/* For one-time events: render cosmic burst at a single point */}
            {actuallyOneTimeEvent && (
              <EventPoint
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                onClick={() => {
                  const year = event.startDate.getFullYear();
                  const month = event.startDate.getMonth();
                  onEventClick(year, month, 0, 0);
                }}
              />
            )}
            
            {/* For process events with end date: render nebula dust trail along spiral */}
            {!actuallyOneTimeEvent && event.endDate && (
              <EventDuration
                startEvent={event}
                endEvent={{...event, startDate: event.endDate}}
                startYear={config.startYear}
                zoom={config.zoom}
              />
            )}
            
            {/* For process events with no end date but aren't one-time: render minimal dust */}
            {!actuallyOneTimeEvent && !event.endDate && (
              <EventDuration
                startEvent={event}
                endEvent={event} // Same start and end point for minimal duration
                startYear={config.startYear}
                zoom={config.zoom}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
