
import React from "react";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { EventLabel } from "./EventLabel";
import { EventDustCloud } from "./EventDustCloud";
import { isSeasonalEvent } from "@/utils/seasonalUtils";

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
  if (!events || events.length === 0) {
    console.log("No events to display");
    return null;
  }

  return (
    <>
      {/* Render dust clouds first for all events */}
      {events.map((event) => {
        // Process all events for dust clouds - both past and future
        if (!event || !event.startDate) {
          console.log("Invalid event data:", event);
          return null;
        }
        
        // Generate dust cloud for the event
        return (
          <EventDustCloud
            key={`dust-${event.id}`}
            event={event}
            startYear={config.startYear}
            zoom={config.zoom}
          />
        );
      })}
      
      {/* Then render the event points and durations */}
      {events.map((event) => {
        if (!event || !event.startDate) {
          return null;
        }
        
        // Future events are now also rendered as dust clouds
        if (event.startDate.getFullYear() > config.currentYear) {
          return null; // Already handled above in the dust cloud section
        }
        
        // For point events (without duration), add a visible anchor point
        if (!event.endDate && !isSeasonalEvent(event)) {
          return (
            <React.Fragment key={`event-${event.id}`}>
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
              {/* Add label for significant one-time events */}
              {event.intensity > 7 && (
                <EventLabel
                  key={`label-${event.id}`}
                  event={event}
                  startYear={config.startYear}
                  zoom={config.zoom}
                />
              )}
            </React.Fragment>
          );
        } 
        
        // For duration events, we'll render a subtle path indicator
        // The dust cloud will do most of the visual work
        return (
          <EventDuration
            key={`duration-${event.id}`}
            startEvent={event}
            endEvent={{...event, startDate: event.endDate || event.startDate}}
            startYear={config.startYear}
            zoom={config.zoom}
          />
        );
      })}
    </>
  );
};
