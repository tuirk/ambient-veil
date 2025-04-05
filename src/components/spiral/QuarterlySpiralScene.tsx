
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { QuarterlySpiralLine } from "./QuarterlySpiralLine";
import { QuarterlyMonthMarkers } from "./QuarterlyMonthMarkers";
import { EventVisualizations } from "./EventVisualizations";
import { EventPoint } from "./EventPoint";
import { EventDuration } from "./EventDuration";
import { CosmicEventEffect } from "./CosmicEventEffect";
import { getQuarterlyEventPosition } from "@/utils/quarterlyUtils";
import { getSeasonMiddleDate } from "@/utils/seasonalUtils";

interface QuarterlySpiralSceneProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onEventClick: (year: number, month: number, x: number, y: number) => void;
}

// Helper function to determine if an event is actually a one-time event
const isOneTimeEvent = (event: TimeEvent): boolean => {
  if (event.eventType === "one-time") return true;
  if (event.endDate) return false;
  if (event.isRoughDate) return false;
  const startDate = event.startDate;
  const hasSpecificDay = startDate && startDate.getDate() > 0;
  return hasSpecificDay;
}

// Helper function to get effective date for events
const getEffectiveEventDate = (event: TimeEvent): Date => {
  if (event.isRoughDate && event.roughDateSeason) {
    return getSeasonMiddleDate(event.roughDateSeason, event.roughDateYear || event.startDate.getFullYear());
  }
  return event.startDate;
};

export const QuarterlySpiralScene: React.FC<QuarterlySpiralSceneProps> = ({ 
  events, 
  config, 
  onEventClick 
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Update camera position based on zoom
  useEffect(() => {
    if (camera) {
      // Adjust camera position for quarterly view
      // Better positioning to view the quarterly spiral
      const distance = 15 / config.zoom;
      camera.position.set(distance, distance * 0.9, distance);
      camera.lookAt(0, -3, 0); // Look slightly lower for better quarterly view
    }
  }, [config.zoom, camera]);
  
  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        minDistance={5}
        maxDistance={30}
        target={[0, -3, 0]} // Consistent with camera lookAt
      />
      
      {/* Enhanced space background */}
      <color attach="background" args={["#010206"]} />
      
      {/* Stars in the background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={1} />
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.3} /> {/* Increased from 0.2 for better visibility */}
      <directionalLight position={[10, 10, 5]} intensity={0.5} /> {/* Increased from 0.4 */}
      
      {/* Render the quarterly spiral */}
      <QuarterlySpiralLine 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render month markers */}
      <QuarterlyMonthMarkers 
        startYear={config.startYear} 
        currentYear={config.currentYear}
        zoom={config.zoom}
      />
      
      {/* Render events with proper positioning for quarterly view */}
      {events.map((event) => {
        // Future events render as scattered objects
        if (getEffectiveEventDate(event).getFullYear() > config.currentYear) {
          // Create a future event visualization as floating debris
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
                const effectiveDate = getEffectiveEventDate(event);
                const year = effectiveDate.getFullYear();
                const month = effectiveDate.getMonth();
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
                isQuarterly={true}
              />
            )}
            
            {/* For one-time events: render cosmic burst at a single point */}
            {actuallyOneTimeEvent && (
              <EventPoint
                event={event}
                startYear={config.startYear}
                zoom={config.zoom}
                isQuarterly={true}
                onClick={() => {
                  const effectiveDate = getEffectiveEventDate(event);
                  const year = effectiveDate.getFullYear();
                  const month = effectiveDate.getMonth();
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
                useQuarterlyPositioning={true}
              />
            )}
            
            {/* For process events with no end date but aren't one-time: render minimal dust */}
            {!actuallyOneTimeEvent && !event.endDate && (
              <EventDuration
                startEvent={event}
                endEvent={event} // Same start and end point for minimal duration
                startYear={config.startYear}
                zoom={config.zoom}
                useQuarterlyPositioning={true}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
