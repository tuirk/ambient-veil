
import React from "react";
import { SpiralVisualization } from "@/components/spiral";
import EventForm from "@/components/EventForm";
import { SpiralControls } from "@/components/spiral/controls/SpiralControls";
import { SpiralHelpButton } from "@/components/spiral/controls/SpiralHelpButton";
import { MemoryList } from "@/components/spiral/memories/MemoryList";
import { useSpiral } from "@/hooks/use-spiral";
import { SpaceBackground } from "@/components/spiral/SpaceBackground";

const Spiral: React.FC = () => {
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
    handleDeleteEvent,
    currentYear
  } = useSpiral();
  
  return (
    <div className="w-full h-screen">
      {/* Spiral visualization */}
      <SpiralVisualization 
        events={events} 
        config={config} 
        onSpiralClick={handleSpiralClick} 
      />
      
      {/* Controls */}
      <SpiralControls
        onAddMemory={() => setShowEventForm(true)}
        onViewMemories={() => setShowMemoryList(true)}
      />
      
      {/* Help button */}
      <SpiralHelpButton currentYear={currentYear} />
      
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
        startYear={currentYear - 5} // Always limit to 5 years before current year
        currentYear={currentYear}
      />
    </div>
  );
};

export default Spiral;
