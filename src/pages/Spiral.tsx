
import React, { useState, useEffect } from "react";
import DeepSpaceBackground from "@/components/DeepSpaceBackground";
import SpiralVisualization from "@/components/SpiralVisualization";
import EventForm from "@/components/EventForm";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Info, ZoomIn, ZoomOut } from "lucide-react";

const Spiral: React.FC = () => {
  const [events, setEvents] = useState<TimeEvent[]>([]);
  const currentSystemYear = new Date().getFullYear();
  
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentSystemYear - 5,
    currentYear: currentSystemYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    yearDepth: 3,
  });
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  
  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
    
    const savedConfig = getConfig();
    // Ensure startYear is within 10 years of current year
    const validStartYear = Math.max(savedConfig.startYear, currentSystemYear - 10);
    
    setConfig(prev => ({
      ...prev,
      startYear: validStartYear,
    }));
  }, [currentSystemYear]);
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowEventForm(true);
  };
  
  const handleSaveEvent = (newEvent: TimeEvent) => {
    // Check if it's a future event
    if (newEvent.startDate.getFullYear() > currentSystemYear) {
      newEvent.isFutureEvent = true;
    }
    
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setShowEventForm(false);
  };
  
  const handleZoomChange = (value: number[]) => {
    setConfig(prev => ({
      ...prev,
      zoom: value[0],
      yearDepth: Math.min(3, Math.ceil(value[0])),
    }));
  };
  
  const handleStartYearChange = (newStartYear: number) => {
    // Enforce limit: startYear must be within 10 years of current year
    const validStartYear = Math.max(newStartYear, currentSystemYear - 10);
    
    setConfig(prev => ({
      ...prev,
      startYear: validStartYear,
    }));
    saveConfig({
      startYear: validStartYear,
      zoom: config.zoom
    });
  };
  
  const handleZoomIn = () => {
    setConfig(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.2, 3),
    }));
  };
  
  const handleZoomOut = () => {
    setConfig(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.2, 0.5),
    }));
  };
  
  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      <DeepSpaceBackground />
      
      {/* Main content */}
      <div className="relative z-10 w-full h-screen">
        {/* Spiral visualization */}
        <SpiralVisualization 
          events={events} 
          config={config} 
          onSpiralClick={handleSpiralClick} 
        />
        
        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/20 backdrop-blur-sm p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Zoom:</label>
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-background/30 hover:bg-background/50"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Slider
              value={[config.zoom]}
              min={0.5}
              max={3}
              step={0.1}
              onValueChange={handleZoomChange}
              className="w-32"
            />
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-background/30 hover:bg-background/50"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Start Year:</label>
            <input
              type="number"
              value={config.startYear}
              onChange={(e) => handleStartYearChange(Number(e.target.value))}
              className="w-20 bg-background/50 border border-white/20 rounded px-2 py-1 text-white"
              min={currentSystemYear - 10}
              max={currentSystemYear}
            />
            <span className="text-white/50 text-xs">
              (min: {currentSystemYear - 10})
            </span>
          </div>
          
          <Button onClick={() => setShowEventForm(true)}>
            Add Memory
          </Button>
        </div>
        
        {/* Help button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-4 right-4 rounded-full bg-background/30 backdrop-blur-sm hover:bg-background/50"
            >
              <Info className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-background/80 backdrop-blur-md text-white border-cosmic-nebula-purple/30">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">About "You Are Here"</h3>
              <p className="text-sm text-gray-300">
                This spiral represents your personal timeline. Each loop is a year,
                arranged like a clock (January at 12 o'clock).
              </p>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                <li>Click anywhere on the spiral to add a memory at that time.</li>
                <li>Colored trails represent events in your life.</li>
                <li>Zoom to move deeper into your timeline's past.</li>
                <li>Future events appear as floating debris in space.</li>
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
    </div>
  );
};

export default Spiral;
