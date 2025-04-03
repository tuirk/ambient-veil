import React from "react";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./eventDuration/EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";

interface EventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

const isOneTimeEvent = (event: TimeEvent): boolean => {
  if (event.eventType === "one-time") return true;
  if (event.endDate) return false;
  if (event.isRoughDate) return false;
  const startDate = event.startDate;
  const hasSpecificDay = startDate && startDate.getDate() > 0;
  return hasSpecificDay;
};

export const EventVisualizations: React.FC<EventVisualizationsProps> = ({
  events,
  config,
  onEventClick
}) => {
  return (
    <>
      {events.map((event) => {
        if (event.startDate.getFullYear() > config.currentYear) {
          const year = event.startDate.getFullYear();
          const month = event.startDate.getMonth();
          const dayOfMonth = event.startDate.getDate() || 15;
          const yearProgress = month / 12 + (dayOfMonth / 365);
          const yearOffset = year - config.startYear;
          const baseRadius = 5 * config.zoom + yearOffset * 0.5;
          const baseHeight = -yearOffset * 1.5 * config.zoom - yearProgress * 1.5 * config.zoom;
          const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
          const intensityFactor = (10 - event.intensity) / 10;
          const offsetRadius = 0.5 + intensityFactor * 2.5 * Math.random();
          const offsetHeight = (Math.random() - 0.5) * 1.5;
          const offsetAngle = (Math.random() - 0.5) * 0.8;
          const finalAngle = angleRad + offsetAngle;
          const x = (baseRadius + offsetRadius) * Math.cos(finalAngle);
          const y = baseHeight + offsetHeight;
          const z = (baseRadius + offsetRadius) * Math.sin(finalAngle);
          const eventColor = event.mood?.color || event.color;
          return (
            <mesh 
              key={event.id} 
              position={[x, y, z]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
              onClick={() => {
                onEventClick(year, month, x, z);
              }}
            >
              {event.intensity > 7 ? (
                <octahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
              ) : event.intensity > 4 ? (
                <tetrahedronGeometry args={[0.2 + event.intensity * 0.03, 0]} />
              ) : (
                <dodecahedronGeometry args={[0.15 + event.intensity * 0.02, 0]} />
              )}
              <meshStandardMaterial 
                color={eventColor} 
                transparent 
                opacity={0.7} 
                emissive={eventColor}
                emissiveIntensity={0.5}
              />
            </mesh>
          );
        }
        
        const actuallyOneTimeEvent = isOneTimeEvent(event);
        
        return (
          <React.Fragment key={event.id}>
            {actuallyOneTimeEvent && (
              <CosmicEventEffect
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                isProcessEvent={false}
              />
            )}
            
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
            
            {!actuallyOneTimeEvent && event.endDate && (
              <EventDuration
                startEvent={event}
                endEvent={{...event, startDate: event.endDate}}
                startYear={config.startYear}
                zoom={config.zoom}
              />
            )}
            
            {!actuallyOneTimeEvent && !event.endDate && (
              <EventDuration
                startEvent={event}
                endEvent={event}
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
