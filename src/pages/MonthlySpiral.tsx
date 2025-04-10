
import React from "react";
import { MonthlySpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEvents } from "@/hooks/useSpiralEvents";

const MonthlySpiral: React.FC = () => {
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
      startYear: currentYear - 1, // Show from one year ago
      currentYear: currentYear, // End at current date
    },
    enforceYearConstraints: false
  });
  
  // Filter events to include only those within the current year range
  const visibleEvents = events.filter(event => {
    const eventStartYear = event.startDate.getFullYear();
    
    // Events that start within the visible years
    if (eventStartYear >= config.startYear && eventStartYear <= config.currentYear) {
      return true;
    }
    
    // Events that started earlier but continue into the visible period
    const hasEndDate = !!event.endDate;
    if (eventStartYear < config.startYear && hasEndDate) {
      const eventEndYear = event.endDate.getFullYear();
      if (eventEndYear >= config.startYear) {
        return true;
      }
    }
    
    // Future events are still shown as floating objects
    if (eventStartYear > config.currentYear) {
      return true;
    }
    
    return false;
  });
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <MonthlySpiralVisualization 
        events={visibleEvents} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls 
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
        viewType="monthly"
      />
      
      {/* Help button */}
      <SpiralHelp viewType="monthly" currentYear={currentYear} />
      
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
        startYear={config.startYear}
        currentYear={currentYear + 1}
      />
    </div>
  );
};

export default MonthlySpiral;
