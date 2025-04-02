
import { useState, useEffect } from "react";
import { TimeEvent } from "@/types/event";
import { saveEvents, getEvents } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage events state and operations
 */
export function useSpiralEvents() {
  const [events, setEvents] = useState<TimeEvent[]>([]);
  const { toast } = useToast();

  // Load events from localStorage
  useEffect(() => {
    const savedEvents = getEvents();
    setEvents(savedEvents);
  }, []);

  // Save a new event
  const handleSaveEvent = (newEvent: TimeEvent) => {
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  // Delete an existing event
  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    
    toast({
      title: "Event Deleted",
      description: "Your memory has been removed",
    });
  };

  return {
    events,
    setEvents,
    handleSaveEvent,
    handleDeleteEvent
  };
}
