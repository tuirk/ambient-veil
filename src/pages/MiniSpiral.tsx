
import React, { useState, useEffect } from "react";
import { MiniSpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, ListIcon, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const MiniSpiral: React.FC = () => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear, // Fixed to January 1st of current year
    currentYear: currentYear, // Current date (today)
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
    
    // Always set startYear to January 1st of current year
    const miniConfig = {
      ...savedConfig,
      startYear: currentYear, // January 1st of current year
      currentYear: currentYear // Current date (today)
    };
    
    setConfig(miniConfig);
  }, []);
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    // Only allow clicks within the current year
    if (year !== currentYear) {
      toast({
        title: "Outside Allowed Time Range",
        description: `You can only add memories in ${currentYear}`,
        variant: "destructive"
      });
      return;
    }
    
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
  
  return (
    <div className="w-full h-screen">
      {/* Mini Spiral visualization */}
      <MiniSpiralVisualization 
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
            <Calendar className="mr-2 h-4 w-4" />
            Annual View
          </Button>
        </Link>
        <Link to="/quarterly">
          <Button 
            variant="outline" 
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Quarterly View
          </Button>
        </Link>
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
            <h3 className="font-medium text-lg">Mini Spiral View</h3>
            <p className="text-sm text-gray-300">
              This 3D spiral represents the current year ({currentYear}) in a more detailed view.
            </p>
            <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
              <li>Each coil represents 2 months.</li>
              <li>The visualization starts from January 1st, {currentYear}.</li>
              <li>6 coils complete a full year.</li>
              <li>The spiral grows each day to show the current date.</li>
              <li>Click anywhere on the spiral to add a memory at that time.</li>
              <li>Drag to rotate the view and scroll to zoom in/out.</li>
            </ul>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Memory List Dialog */}
      <Dialog open={showMemoryList} onOpenChange={setShowMemoryList}>
        <DialogContent className="bg-background/90 backdrop-blur-md text-white border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Your Memories ({currentYear})</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto p-1">
            {events.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No memories yet. Click anywhere on the spiral to add one.</p>
            ) : (
              <div className="space-y-4">
                {events
                  .filter(event => event.startDate.getFullYear() === currentYear)
                  .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())
                  .map(event => (
                    <div 
                      key={event.id} 
                      className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: event.color }}
                          />
                          <h3 className="font-medium">{event.title}</h3>
                        </div>
                        <div className="text-sm text-gray-400">
                          {event.isRoughDate 
                            ? `${event.roughDateSeason} ${event.roughDateYear}`
                            : event.startDate.toLocaleDateString() + (event.endDate ? ` - ${event.endDate.toLocaleDateString()}` : "")
                          }
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10">
                            Intensity: {event.intensity}
                          </span>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="h-8 bg-red-900/50 hover:bg-red-800"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        startYear={currentYear} // Only allow events in the current year
        currentYear={currentYear} // Only allow events in the current year
      />
    </div>
  );
};

export default MiniSpiral;
