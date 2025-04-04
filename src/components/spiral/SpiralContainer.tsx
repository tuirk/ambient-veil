
import React, { useState } from "react";
import EventForm from "@/components/EventForm";
import { TimeEvent, SpiralConfig } from "@/types/event";
import { Button } from "@/components/ui/button";
import { ListIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MemoryListDialog from "@/components/MemoryListDialog";
import SpiralHelpPopover from "@/components/SpiralHelpPopover";

interface SpiralContainerProps {
  events: TimeEvent[];
  config: SpiralConfig;
  onSaveEvent: (newEvent: TimeEvent) => void;
  onDeleteEvent: (eventId: string) => void;
  children: React.ReactNode;
  actionButton: React.ReactNode;
  helpTitle: string;
  helpDescription: string;
  helpItems: string[];
  startYear: number;
  currentYear: number;
}

const SpiralContainer: React.FC<SpiralContainerProps> = ({
  events,
  config,
  onSaveEvent,
  onDeleteEvent,
  children,
  actionButton,
  helpTitle,
  helpDescription,
  helpItems,
  startYear,
  currentYear,
}) => {
  const { toast } = useToast();
  
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();
  const [showMemoryList, setShowMemoryList] = useState(false);
  
  const handleSpiralClick = (year: number, month: number, x: number, y: number) => {
    // Check if the click is within the allowed date range
    if (year < startYear || year > currentYear) {
      toast({
        title: "Outside Allowed Time Range",
        description: `You can only add memories between ${startYear} and ${currentYear}`,
        variant: "destructive"
      });
      return;
    }
    
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowEventForm(true);
  };
  
  return (
    <div className="w-full h-screen">
      {/* Pass the handleSpiralClick to the children */}
      {React.cloneElement(children as React.ReactElement, { onSpiralClick: handleSpiralClick })}
      
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
        {actionButton}
      </div>
      
      {/* Help button */}
      <SpiralHelpPopover 
        title={helpTitle}
        description={helpDescription}
        helpItems={helpItems}
      />
      
      {/* Memory List Dialog */}
      <MemoryListDialog
        open={showMemoryList}
        onOpenChange={setShowMemoryList}
        events={events}
        onDeleteEvent={onDeleteEvent}
      />
      
      {/* Add event form */}
      <EventForm
        open={showEventForm}
        onClose={() => setShowEventForm(false)}
        onSave={onSaveEvent}
        preselectedYear={selectedYear}
        preselectedMonth={selectedMonth}
        startYear={startYear}
        currentYear={currentYear}
      />
    </div>
  );
};

export default SpiralContainer;
