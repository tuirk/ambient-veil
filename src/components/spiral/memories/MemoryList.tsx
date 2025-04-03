
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TimeEvent } from "@/types/event";
import { formatDate } from "date-fns";

interface MemoryListProps {
  events: TimeEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteEvent: (id: string) => void;
}

export const MemoryList: React.FC<MemoryListProps> = ({
  events,
  open,
  onOpenChange,
  onDeleteEvent,
}) => {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    b.startDate.getTime() - a.startDate.getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Your Memories</DialogTitle>
        </DialogHeader>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            You haven't added any memories yet.
          </div>
        ) : (
          <ScrollArea className="flex-grow pr-4">
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">{event.title}</h3>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.mood?.color || event.color }}
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatDate(event.startDate, "MMMM d, yyyy")}
                    {event.endDate && ` - ${formatDate(event.endDate, "MMMM d, yyyy")}`}
                  </div>
                  
                  {/* Only render description if it exists */}
                  {event.description && (
                    <p className="mt-2 text-sm">{event.description}</p>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onDeleteEvent(event.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
