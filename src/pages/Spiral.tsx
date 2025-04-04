
import React, { useState, useEffect } from "react";
import { SpiralVisualization } from "@/components/spiral";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import SpiralContainer from "@/components/spiral/SpiralContainer";

const Spiral: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear - 5, // Fixed to current year - 5
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
    saveConfig(fixedConfig); // Save the fixed config
  }, []);
  
  const handleSaveEvent = (newEvent: TimeEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };
  
  // Setup help items for the annual view
  const helpItems = [
    "Each loop represents a year, divided into 12 months.",
    `You can add memories from ${currentYear - 5} to ${currentYear + 1}.`,
    "Click anywhere on the spiral to add a memory at that time.",
    "Colored trails represent events in your life.",
    "Drag to rotate the view and scroll to zoom in/out."
  ];
  
  // Action button for navigating to quarterly view
  const actionButton = (
    <Link to="/quarterly">
      <Button 
        variant="outline" 
        className="border-white/20 text-white hover:bg-white/10"
      >
        <Calendar className="mr-2 h-4 w-4" />
        Quarterly View
      </Button>
    </Link>
  );
  
  return (
    <SpiralContainer
      events={events}
      config={config}
      onSaveEvent={handleSaveEvent}
      onDeleteEvent={handleDeleteEvent}
      actionButton={actionButton}
      helpTitle="About 'You Are Here'"
      helpDescription="This 3D spiral represents your personal timeline. Each loop is a year, divided into 12 months."
      helpItems={helpItems}
      startYear={currentYear - 5}
      currentYear={currentYear}
    >
      <SpiralVisualization events={events} config={config} />
    </SpiralContainer>
  );
};

export default Spiral;
