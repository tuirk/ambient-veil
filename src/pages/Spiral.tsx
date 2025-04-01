
import React, { useState, useEffect } from "react";
import { SpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";

const Spiral: React.FC = () => {
  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: new Date().getFullYear() - 5,
    currentYear: new Date().getFullYear(),
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  
  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
    
    const savedConfig = getConfig();
    setConfig(prev => ({
      ...prev,
      startYear: savedConfig.startYear,
    }));
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
  
  const handleZoomChange = (value: number[]) => {
    setConfig(prev => ({
      ...prev,
      zoom: value[0],
    }));
  };
  
  const handleStartYearChange = (newStartYear: number) => {
    setConfig(prev => ({
      ...prev,
      startYear: newStartYear,
    }));
    saveConfig(newStartYear);
  };
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <SpiralVisualization 
        events={events} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Zoom:</label>
          <Slider
            value={[config.zoom]}
            min={0.5}
            max={2}
            step={0.1}
            onValueChange={handleZoomChange}
            className="w-32"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Start Year:</label>
          <input
            type="number"
            value={config.startYear}
            onChange={(e) => handleStartYearChange(Number(e.target.value))}
            className="w-20 bg-background/50 border border-white/20 rounded px-2 py-1 text-white"
          />
        </div>
        
        <Button onClick={() => setShowEventForm(true)} className="bg-indigo-600 hover:bg-indigo-700">
          Add Memory
        </Button>
      </div>
      
      {/* Help button */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-4 right-4 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50 border border-white/10"
          >
            <Info className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-background/80 backdrop-blur-md text-white border-cosmic-nebula-purple/30">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">About "You Are Here"</h3>
            <p className="text-sm text-gray-300">
              This 3D spiral represents your personal timeline. Each loop is a year,
              divided into 12 months.
            </p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
              <li>Click anywhere on the spiral to add a memory at that time.</li>
              <li>Colored trails represent events in your life.</li>
              <li>Adjust the start year and zoom to navigate your timeline.</li>
              <li>Drag to rotate the view and scroll to zoom in/out.</li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
      />
    </div>
  );
};

export default Spiral;
