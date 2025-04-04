import React from "react";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";
import { EventBurst } from "./EventBurst";

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
          const randomDistance = 15 + Math.random() * 20;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomHeight = (Math.random() - 0.5) * 20;
          
          const x = randomDistance * Math.cos(randomAngle);
          const y = randomHeight;
          const z = randomDistance * Math.sin(randomAngle);
          
          return (
            <mesh 
              key={event.id} 
              position={[x, y, z]}
              rotation={[Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]}
              onClick={() => {
                const year = event.startDate.getFullYear();
                const month = event.startDate.getMonth();
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
                color={event.color} 
                transparent 
                opacity={0.7} 
                emissive={event.color}
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
              <EventBurst
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
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
