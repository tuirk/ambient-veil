
import React from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { FutureEvent } from "./future-events/FutureEvent";

interface EventsLayerProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

export const EventsLayer: React.FC<EventsLayerProps> = ({
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
              onClick={onEventClick}
            />
          );
        }
        
        // Regular event with or without end date
        if (!event.endDate) {
          return (
            <EventPoint
              key={event.id}
              event={event}
              startYear={config.startYear}
              zoom={config.zoom}
              onClick={() => {
                const year = event.startDate.getFullYear();
                const month = event.startDate.getMonth();
                onEventClick(year, month, 0, 0);
              }}
            />
          );
        } else {
          return (
            <EventDuration
              key={event.id}
              startEvent={event}
              endEvent={{...event, startDate: event.endDate}}
              startYear={config.startYear}
              zoom={config.zoom}
            />
          );
        }
      })}
    </>
  );
};
