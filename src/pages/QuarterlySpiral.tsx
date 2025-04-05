
import React from "react";
import { QuarterlySpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEvents } from "@/hooks/useSpiralEvents";

const QuarterlySpiral: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const {
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
    handleDeleteEvent
  } = useSpiralEvents({
    initialConfig: {
      startYear: currentYear, // Start from January 1st of current year
      currentYear: currentYear, // End at current date
    },
    enforceYearConstraints: false // The quarterly view only shows current year anyway
  });
  
  // Filter events to include those that:
  // 1. Start within the current year, OR
  // 2. Started earlier but continue into the current year (have an end date in or after the current year), OR
  // 3. Are future events (for floating visualization)
  const visibleEvents = events.filter(event => {
    const eventStartYear = event.startDate.getFullYear();
    const eventStartsInCurrentYear = eventStartYear === currentYear;
    
    // Events that start within the current year
    if (eventStartsInCurrentYear) {
      return true;
    }
    
    // Events that started earlier but continue into the current year
    const hasEndDate = !!event.endDate;
    if (eventStartYear < currentYear && hasEndDate) {
      const eventEndYear = event.endDate.getFullYear();
      if (eventEndYear >= currentYear) {
        return true;
      }
    }
    
    // Future events are still shown as floating objects
    if (eventStartYear > currentYear) {
      return true;
    }
    
    return false;
  });
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <QuarterlySpiralVisualization 
        events={visibleEvents} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls 
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
        viewType="quarterly"
      />
      
      {/* Help button */}
      <SpiralHelp viewType="quarterly" currentYear={currentYear} />
      
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
        startYear={currentYear} // Allow events from the start of current year
        currentYear={currentYear} // Allow events up to current year
      />
    </div>
  );
};

export default QuarterlySpiral;
