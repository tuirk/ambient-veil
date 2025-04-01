
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
  return (
    <>
      {/* Render dust clouds first for all events for consistent visual effect */}
      {events.map((event) => {
        // Skip future events for dust clouds - they'll be handled differently
        if (event.startDate.getFullYear() > config.currentYear) {
          return null;
        }
        
        return (
          <EventDustCloud
            key={`dust-${event.id}`}
            event={event}
            startYear={config.startYear}
            zoom={config.zoom}
          />
        );
      })}
      
      {/* Then render the actual events */}
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
        
        // For point events (without duration), add a visible anchor point
        if (!event.endDate && !isSeasonalEvent(event)) {
          return (
            <>
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
              {/* Add label for significant one-time events */}
              {event.intensity > 6 && (
                <EventLabel
                  key={`label-${event.id}`}
                  event={event}
                  startYear={config.startYear}
                  zoom={config.zoom}
                />
              )}
            </>
          );
        } 
        
        // For duration events, we'll render a subtle path indicator
        // The dust cloud will do most of the visual work
        return (
          <EventDuration
            key={event.id}
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
