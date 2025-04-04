
import React, { useState, useEffect } from "react";
import { QuarterlySpiralVisualization } from "@/components/spiral";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import SpiralContainer from "@/components/spiral/SpiralContainer";

const QuarterlySpiral: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear, // Start from January 1st of current year
    currentYear: currentYear, // End at current date
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });
  
  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
    
    const savedConfig = getConfig();
    
    // Set to current calendar year to current date
    const quarterlyConfig = {
      ...savedConfig,
      startYear: currentYear, // January 1st of current year
      currentYear: currentYear // Current date (today)
    };
    
    setConfig(quarterlyConfig);
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
  
  // Help items specific to the quarterly view
  const helpItems = [
    "Each coil represents 3 months (one quarter).",
    "The visualization starts from January 1st of the current year.",
    "Click anywhere on the spiral to add a memory at that time.",
    "Colored trails represent events in your life.",
    "Drag to rotate the view and scroll to zoom in/out."
  ];
  
  // Action button for navigating back to annual view
  const actionButton = (
    <Link to="/spiral">
      <Button 
        variant="outline" 
        className="border-white/20 text-white hover:bg-white/10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Annual View
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
      helpTitle="Quarterly Timeline View"
      helpDescription="This 3D spiral represents the current year, divided into quarters."
      helpItems={helpItems}
      startYear={currentYear}
      currentYear={currentYear}
    >
      <QuarterlySpiralVisualization events={events} config={config} />
    </SpiralContainer>
  );
};

export default QuarterlySpiral;
