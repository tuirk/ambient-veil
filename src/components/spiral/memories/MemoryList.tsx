
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import { TimeEvent } from "@/types/event";
import { format } from "date-fns";

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
  onDeleteEvent
}) => {
  // Sort events chronologically, newest first
  const sortedEvents = [...events].sort((a, b) => 
    b.startDate.getTime() - a.startDate.getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Your Memories</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No memories yet. Click on the spiral to add your first memory.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div 
                  key={event.id}
                  className="p-4 border rounded-lg flex items-start gap-3"
                  style={{
                    borderColor: event.mood?.color || event.color,
                    backgroundColor: `${event.mood?.color || event.color}10`
                  }}
                >
                  <div className="flex-grow">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteEvent(event.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>
                        {format(event.startDate, "MMMM d, yyyy")}
                        {event.endDate && ` - ${format(event.endDate, "MMMM d, yyyy")}`}
                      </span>
                      
                      {event.mood && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: event.mood.color }} 
                          />
                          <span>{event.mood.name}</span>
                        </div>
                      )}
                    </div>
                    
                    {event.description && (
                      <p className="mt-2 text-sm">{event.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
