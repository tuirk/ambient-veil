import React from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { getWeeklyEventPosition, calculateWeeklySpiralSegment, getStartOfWeek } from "@/utils/weekly/weeklyUtils";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";

interface WeeklyEventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, day: number, x: number, y: number) => void;
}

export const WeeklyEventVisualizations: React.FC<WeeklyEventVisualizationsProps> = ({
  events,
  config,
  onEventClick
}) => {
  const now = new Date();
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  // Filter events to only show those in the current week and up to the current time
  const weeklyEvents = events.filter(event => {
    const eventStart = new Date(event.startDate);
    return eventStart >= startOfWeek && eventStart <= now && eventStart < endOfWeek;
  });
  
  return (
    <>
      {weeklyEvents.map((event) => {
        // Determine if this should be visualized as a one-time or process event
        const isOneTimeEvent = event.eventType === "one-time" || !event.endDate;
        
        // For one-time events: render cosmic burst at a single point
        if (isOneTimeEvent) {
          const position = getWeeklyEventPosition(
            event.startDate,
            config.zoom,
            1.5 * config.zoom
          );
          
          return (
            <React.Fragment key={event.id}>
              <CosmicEventEffect
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                isProcessEvent={false}
              />
              
              <EventPoint
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                onClick={() => {
                  const year = event.startDate.getFullYear();
                  const month = event.startDate.getMonth();
                  const day = event.startDate.getDate();
                  onEventClick(year, month, day, position.x, position.z);
                }}
              />
            </React.Fragment>
          );
        } 
        // For process events with end date: render duration along spiral
        else if (event.endDate) {
          // Make sure the end date is not in the future
          const clampedEndDate = new Date(Math.min(event.endDate.getTime(), now.getTime()));
          // Also make sure it's within the current week
          const weekEndClamped = new Date(Math.min(clampedEndDate.getTime(), endOfWeek.getTime()));
          
          const points = calculateWeeklySpiralSegment(
            event.startDate, 
            weekEndClamped,
            50,
            config.zoom,
            1.5 * config.zoom
          );
          
          // Only render if we have points to show
          if (points.length > 0) {
            const position = getWeeklyEventPosition(
              event.startDate,
              config.zoom,
              1.5 * config.zoom
            );
            
            return (
              <EventDuration
                key={event.id}
                startEvent={event}
                endEvent={{...event, startDate: weekEndClamped}}
                startYear={config.startYear}
                zoom={config.zoom}
              />
            );
          }
        }
        
        return null;
      })}
    </>
  );
};
