
import React, { useState, useMemo } from "react";
import { WeeklySpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useSpiralEvents } from "@/hooks/useSpiralEvents";
import { addDays } from "date-fns";

const WeeklySpiral: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  
  // Default to showing last 30 days
  const [startDate] = useState<Date>(() => addDays(today, -30));
  const [endDate] = useState<Date>(() => new Date(today));

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
      startYear: startDate.getFullYear(),
      currentYear: currentYear,
    },
    enforceYearConstraints: false
  });
  
  // Filter events to include only those within the date range or near it
  const visibleEvents = useMemo(() => {
    return events.filter(event => {
      const eventStartTime = event.startDate.getTime();
      
      // Events that start within the visible period
      if (eventStartTime >= startDate.getTime() && eventStartTime <= endDate.getTime()) {
        return true;
      }
      
      // Events that started earlier but continue into the visible period
      const hasEndDate = !!event.endDate;
      if (eventStartTime < startDate.getTime() && hasEndDate) {
        const eventEndTime = event.endDate.getTime();
        if (eventEndTime >= startDate.getTime()) {
          return true;
        }
      }
      
      // Future events are still shown as floating objects (within reasonable timeframe)
      if (eventStartTime > endDate.getTime() && 
          eventStartTime < addDays(endDate, 30).getTime()) {
        return true;
      }
      
      return false;
    });
  }, [events, startDate, endDate]);
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <WeeklySpiralVisualization 
        events={visibleEvents} 
        config={config}
        startDate={startDate}
        endDate={endDate}
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls 
        onAddMemoryClick={() => setShowEventForm(true)}
        onViewMemoriesClick={() => setShowMemoryList(true)}
        viewType="weekly"
      />
      
      {/* Help button */}
      <SpiralHelp viewType="weekly" currentYear={currentYear} />
      
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
        startYear={startDate.getFullYear()}
        currentYear={currentYear + 1}
      />
    </div>
  );
};

export default WeeklySpiral;
