
import React, { useState, useEffect } from "react";
import { QuarterlySpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { ListIcon, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import MemoryListDialog from "@/components/MemoryListDialog";
import SpiralHelpPopover from "@/components/SpiralHelpPopover";

const QuarterlySpiral: React.FC = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear, // Start from January 1st of current year
    currentYear: currentYear, // End at current date
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [showMemoryList, setShowMemoryList] = useState(false);
  
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
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowEventForm(true);
  };
  
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
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <QuarterlySpiralVisualization 
        events={events} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
        <Button onClick={() => setShowEventForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          Add Memory
        </Button>
        <Button 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => setShowMemoryList(true)}
        >
          <ListIcon className="mr-2 h-4 w-4" />
          View Memories
        </Button>
        <Link to="/spiral">
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Annual View
          </Button>
        </Link>
      </div>
      
      {/* Help button */}
      <SpiralHelpPopover 
        title="Quarterly Timeline View"
        description="This 3D spiral represents the current year, divided into quarters."
        helpItems={helpItems}
      />
      
      {/* Memory List Dialog */}
      <MemoryListDialog
        open={showMemoryList}
        onOpenChange={setShowMemoryList}
        events={events}
        onDeleteEvent={handleDeleteEvent}
      />
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        startYear={currentYear} // Allow events from the start of current year
        currentYear={currentYear} // Allow events up to current year
      />
    </div>
  );
};

export default QuarterlySpiral;
