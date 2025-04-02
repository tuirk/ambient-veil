
import React from "react";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";
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
  return (
    <>
      {events.map((event) => {
        // Future events render as scattered objects
        if (event.startDate.getFullYear() > config.currentYear) {
          // Create a more interesting future event visualization as floating debris
          const randomDistance = 15 + Math.random() * 20;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomHeight = (Math.random() - 0.5) * 20;
          
          const x = randomDistance * Math.cos(randomAngle);
          const y = randomHeight;
          const z = randomDistance * Math.sin(randomAngle);
          
          // Create different geometry based on intensity
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
        
        // Is this a process/duration event (has end date or is seasonal)?
        const isProcessEvent = isSeasonalEvent(event) || !!event.endDate;
        
        // Add the cosmic effect and appropriate visualization based on event type
        return (
          <React.Fragment key={event.id}>
            {/* Add the cosmic effect - different sizes for one-time vs process events */}
            <CosmicEventEffect
              event={event}
              startYear={config.startYear}
              zoom={config.zoom}
              isProcessEvent={isProcessEvent}
            />
            
            {/* For process events: render dust trail along spiral */}
            {isProcessEvent && (
              <EventDuration
                startEvent={event}
                endEvent={{...event, startDate: event.endDate || event.startDate}}
                startYear={config.startYear}
                zoom={config.zoom}
              />
            )}
            
            {/* For one-time events: render cosmic burst at a single point */}
            {!isProcessEvent && (
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
          </React.Fragment>
        );
      })}
    </>
  );
};
