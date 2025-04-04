
import React, { useState, useEffect } from "react";
import { SpiralVisualization } from "@/components/spiral";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { getEvents, getConfig } from "@/utils/storage";

const MinimalSpiral: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear - 5,
    currentYear: currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });
  
  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
    
    const savedConfig = getConfig();
    
    // Always set startYear to 5 years before current year
    const fixedConfig = {
      ...savedConfig,
      startYear: currentYear - 5
    };
    
    setConfig(fixedConfig);
  }, []);
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    // This is a minimal version, so clicks don't do anything
    console.log(`Clicked on: Year ${year}, Month ${month}`);
  };
  
  return (
    <div className="w-full h-screen">
      {/* Just the spiral visualization, nothing else */}
      <SpiralVisualization 
        events={events} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
    </div>
  );
};

export default MinimalSpiral;
