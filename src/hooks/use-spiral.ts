
import { useState, useEffect } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function useSpiral() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear - 5, // Fixed to current year - 5
    currentYear: currentYear,
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
    
    // Always set startYear to 5 years before current year
    const fixedConfig = {
      ...savedConfig,
      startYear: currentYear - 5
    };
    
    setConfig(fixedConfig);
    saveConfig(fixedConfig); // Save the fixed config
  }, []);
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    // Only allow clicks within the allowed date range
    const maxYear = currentYear + 1;
    const minYear = currentYear - 5; // Limited to 5 years before current year
    
    if (year < minYear || year > maxYear) {
      toast({
        title: "Outside Allowed Time Range",
        description: `You can only add memories between ${minYear} and ${maxYear}`,
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
  
  return {
    events,
    config,
    showEventForm,
    setShowEventForm,
    selectedYear,
    selectedMonth,
    showMemoryList,
    setShowMemoryList,
    handleSpiralClick,
    handleSaveEvent,
    handleDeleteEvent,
    currentYear
  };
}
