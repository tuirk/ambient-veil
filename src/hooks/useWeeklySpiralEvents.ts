
import { useState, useEffect } from "react";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { saveEvents, getEvents, saveConfig, getConfig, deleteEvent } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { getStartOfWeek } from "@/utils/weekly/weeklyUtils";

interface UseWeeklySpiralEventsProps {
  initialConfig?: Partial<SpiralConfig>;
}

export const useWeeklySpiralEvents = ({ 
  initialConfig = {}
}: UseWeeklySpiralEventsProps = {}) => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentDate = new Date().getDate();

  // Get start of the current week (Monday)
  const startOfWeek = getStartOfWeek(new Date());
  const now = new Date();

  const [events, setEvents] = useState<TimeEvent[]>([]);
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear,
    currentYear: currentYear,
    zoom: 2, // Higher zoom for better visibility of the week
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
    ...initialConfig,
  });
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [selectedDay, setSelectedDay] = useState<number | undefined>();
  const [showMemoryList, setShowMemoryList] = useState(false);

  // Load events and config from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    
    // Filter events to show only current week events up to current time
    const currentWeekEvents = savedEvents.filter(event => {
      const eventDate = new Date(event.startDate);
      const eventTime = eventDate.getTime();
      const weekEndTime = new Date(startOfWeek);
      weekEndTime.setDate(startOfWeek.getDate() + 7); // 7 days from start of week
      
      return eventTime >= startOfWeek.getTime() && 
             eventTime < weekEndTime.getTime() && 
             eventTime <= now.getTime(); // Only show events up to the current time
    });
    
    setEvents(currentWeekEvents);
    
    const savedConfig = getConfig();
    
    // Apply initial config with possible overrides
    const finalConfig = {
      ...savedConfig,
      ...initialConfig,
    };
    
    setConfig(finalConfig);
    
    // Save the config back if needed
    if (Object.keys(initialConfig).length > 0) {
      saveConfig(finalConfig);
    }
  }, []);
  
  // Function to handle spiral clicks
  const handleSpiralClick = (year: number, month: number, day: number, x: number, y: number) => {
    // For weekly view, we only care about events in the current week
    const clickedDate = new Date(year, month, day);
    const weekEndTime = new Date(startOfWeek);
    weekEndTime.setDate(startOfWeek.getDate() + 7);
    
    // Check if clicked date is in the future
    if (clickedDate > now) {
      toast({
        title: "Cannot Add Future Events",
        description: "You can only add memories up to the current time",
        variant: "destructive"
      });
      return;
    }
    
    // Check if clicked date is outside the current week
    if (clickedDate < startOfWeek || clickedDate >= weekEndTime) {
      toast({
        title: "Outside Current Week",
        description: "You can only add memories for the current week",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
    setShowEventForm(true);
  };
  
  // Function to save a new event
  const handleSaveEvent = (newEvent: TimeEvent) => {
    const allEvents = getEvents(); // Get all existing events
    const updatedAllEvents = [...allEvents, newEvent]; // Add the new event to all events
    saveEvents(updatedAllEvents); // Save all events
    
    // Only update state with events from current week up to current time
    const eventDate = new Date(newEvent.startDate);
    const weekEndTime = new Date(startOfWeek);
    weekEndTime.setDate(startOfWeek.getDate() + 7);
    
    if (eventDate >= startOfWeek && 
        eventDate < weekEndTime && 
        eventDate <= now) {
      setEvents([...events, newEvent]); // Only update UI with current week events
    }
    
    toast({
      title: "Memory Saved",
      description: `"${newEvent.title}" has been added to your timeline`,
    });
  };

  // Function to delete an event
  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
    
    // Update local state to reflect the deletion
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    
    toast({
      title: "Memory Deleted",
      description: "The memory has been removed from your timeline",
    });
  };
  
  return {
    events,
    config,
    showEventForm,
    setShowEventForm,
    selectedYear,
    selectedMonth,
    selectedDay,
    showMemoryList,
    setShowMemoryList,
    handleSpiralClick,
    handleSaveEvent,
    handleDeleteEvent,
    currentYear
  };
};
