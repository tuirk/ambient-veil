import React, { useState, useEffect } from "react";
import DailySpiralVisualization from "@/components/spiral/DailySpiralVisualization";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEvents } from "@/hooks/useSpiralEvents";

/**
 * Gets the most recent Monday before or equal to the given date
 */
const getMostRecentMonday = (date: Date): Date => {
  const result = new Date(date);
  const day = result.getDay();
  
  // If it's already Monday (1), return the date
  // Otherwise, go back to the most recent Monday
  if (day !== 1) {
    result.setDate(result.getDate() - (day === 0 ? 6 : day - 1));
  }
  
  // Set to beginning of day
  result.setHours(0, 0, 0, 0);
  return result;
};

const CurrentSpiral: React.FC = () => {
  // Get today's date
  const today = new Date();
  
  // Get the most recent Monday
  const startDate = getMostRecentMonday(today);
  
  // State for auto-refresh
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Set up auto-refresh every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      setEndDate(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, []);

  const {
    events,
    config,
    showEventForm,
    setShowEventForm,
    selectedYear,
    selectedMonth,
    selectedDay,  // Add this state for day selection
    showMemoryList,
    setShowMemoryList,
    handleSpiralClick,
    handleSaveEvent,
    handleDeleteEvent
  } = useSpiralEvents({
    initialConfig: {
      startYear: startDate.getFullYear(),
      currentYear: today.getFullYear(),
      zoom: 1
    },
    enforceYearConstraints: true
  });
  
  // Filter events to include only those within the current week (from start date to today)
  const visibleEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    
    // Events that occur within the current week
    if (eventDate >= startDate && eventDate <= today) {
      return true;
    }
    
    // Events that started earlier but continue into the current week
    const hasEndDate = !!event.endDate;
    if (eventDate < startDate && hasEndDate) {
      const eventEndDate = new Date(event.endDate);
      if (eventEndDate >= startDate) {
        return true;
      }
    }
    
    // Future events (within the visible spectrum)
    // Only show events up to 3 days into the future
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    if (eventDate > today && eventDate <= threeDaysFromNow) {
      return true;
    }
    
    return false;
  });
  
  // Custom click handler for the daily spiral
  const handleDailySpiralClick = (year: number, month: number, day: number, x: number, y: number) => {
    handleSpiralClick(year, month, day, x, y);
  };
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <DailySpiralVisualization 
        events={visibleEvents} 
        startDate={startDate}
        endDate={endDate}
        zoom={config.zoom}
        onSpiralClick={handleDailySpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls 
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
        viewType="current"
      />
      
      {/* Help button */}
      <SpiralHelp viewType="current" currentYear={today.getFullYear()} />
      
      {/* Memory List Dialog */}
      <MemoryList 
        events={events}
        open={showMemoryList}
        onOpenChange={setShowMemoryList}
        onDeleteEvent={handleDeleteEvent}
      />
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={handleSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        preselectedDay={selectedDay}
        startYear={startDate.getFullYear()}
        currentYear={today.getFullYear()}
      />
    </div>
  );
};

export default CurrentSpiral;
