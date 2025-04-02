
import React from "react";
import * as THREE from "three";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";

interface EventVisualizationsProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

// Helper function to determine if an event is actually a one-time event
const isOneTimeEvent = (event: TimeEvent): boolean => {
  // One-time events must have:
  // 1. A specific day (not just month/year or season)
  // 2. No end date
  
  // If explicitly typed as "one-time", trust that
  if (event.eventType === "one-time") return true;
  
  // Otherwise fallback to old logic for backward compatibility
  // If it has an end date, it's a process event
  if (event.endDate) return false;
  
  // If it's a rough date (seasonal), it's a process event
  if (event.isRoughDate) return false;
  
  // Check if the start date has a specific day (not just month/year)
  const startDate = event.startDate;
  const hasSpecificDay = startDate && startDate.getDate() > 0;
  
  // Only events with specific day + no end date are one-time
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
        // Future events render as scattered objects
        if (event.startDate.getFullYear() > config.currentYear) {
          // Create a more interesting future event visualization as floating debris
          const randomDistance = 15 + Math.random() * 20;
          const randomAngle = Math.random() * Math.PI * 2;
          const randomHeight = (Math.random() - 0.5) * 20;
          
          // For future events, let them hang from spiral but not exactly on it
          // Calculate the base spiral position first
          const year = event.startDate.getFullYear();
          const month = event.startDate.getMonth();
          const dayOfMonth = event.startDate.getDate() || 15; // Default to mid-month
          
          // Calculate year progress (0-1 through the year)
          const yearProgress = month / 12 + (dayOfMonth / 365);
          
          // Calculate rough spiral position (simplified)
          const yearOffset = year - config.startYear;
          const baseRadius = 5 * config.zoom + yearOffset * 0.5;
          const angleRad = -yearProgress * Math.PI * 2 + Math.PI/2;
          
          // Add semi-random offset to make future events float near the spiral
          const offsetDistance = 1 + Math.random() * 2;
          const offsetAngle = angleRad + (Math.random() * 0.6 - 0.3);
          const heightOffset = -0.5 + Math.random() * 1;
          
          const x = baseRadius * Math.cos(offsetAngle) * (1 + Math.random() * 0.2);
          const z = baseRadius * Math.sin(offsetAngle) * (1 + Math.random() * 0.2);
          const y = -yearOffset * 1.5 * config.zoom - yearProgress * 1.5 * config.zoom + heightOffset;
          
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
