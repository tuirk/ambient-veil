
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { TimeEvent } from "@/types/event";
import EventForm from "@/components/EventForm";

interface EventManagerProps {
  events: TimeEvent[];
  onEdit: (updatedEvent: TimeEvent) => void;
  onDelete: (eventId: string) => void;
}

const EventManager: React.FC<EventManagerProps> = ({ 
  events, 
  onEdit, 
  onDelete 
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimeEvent | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  
  const handleEdit = (event: TimeEvent) => {
    setSelectedEvent(event);
    setIsEditFormOpen(true);
  };
  
  const handleDelete = (eventId: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      onDelete(eventId);
    }
  };
  
  const handleSaveEdit = (updatedEvent: TimeEvent) => {
    onEdit(updatedEvent);
    setIsEditFormOpen(false);
    setSelectedEvent(null);
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-background/30 backdrop-blur-sm text-white hover:bg-background/50 border border-white/10">
            Manage Memories
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] bg-background/80 backdrop-blur-md text-white border-cosmic-nebula-purple/30">
          <DialogHeader>
            <DialogTitle className="text-xl">Your Memories</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No memories yet. Start creating your timeline by clicking on the spiral.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white">Title</TableHead>
                    <TableHead className="text-white">Date</TableHead>
                    <TableHead className="text-white">Intensity</TableHead>
                    <TableHead className="text-white">Duration</TableHead>
                    <TableHead className="text-white w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map(event => (
                    <TableRow key={event.id} className="border-white/10">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: event.color }}
                          ></div>
                          {event.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(event.startDate, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{event.intensity}/10</TableCell>
                      <TableCell>
                        {event.endDate 
                          ? `Until ${format(event.endDate, "MMM d, yyyy")}` 
                          : "Single day"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background/90 border-white/10">
                            <DropdownMenuItem 
                              onClick={() => handleEdit(event)}
                              className="cursor-pointer flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(event.id)}
                              className="cursor-pointer flex items-center gap-2 text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit event dialog */}
      {selectedEvent && (
        <EventForm
          open={isEditFormOpen}
          onClose={() => setIsEditFormOpen(false)}
          onSave={handleSaveEdit}
          preselectedYear={selectedEvent.startDate.getFullYear()}
          preselectedMonth={selectedEvent.startDate.getMonth()}
          editEvent={selectedEvent}
        />
      )}
    </>
  );
};

export default EventManager;
