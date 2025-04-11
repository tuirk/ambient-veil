
import React from "react";
import { WeeklySpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/SpiralControls";
import { SpiralHelp } from "@/components/spiral/SpiralHelp";
import { MemoryList } from "@/components/spiral/MemoryList";
import { useWeeklySpiralEvents } from "@/hooks/useWeeklySpiralEvents";

const WeeklySpiral: React.FC = () => {
  const {
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
  } = useWeeklySpiralEvents();
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <WeeklySpiralVisualization 
        events={events} 
        config={config} 
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
        preselectedDay={selectedDay}
        startYear={currentYear - 5}
        currentYear={currentYear}
      />
    </div>
  );
};

export default WeeklySpiral;
