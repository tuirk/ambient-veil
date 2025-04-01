
import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { v4 as uuidv4 } from "uuid";
import { TimeEvent } from "@/types/event";
import { useForm } from "react-hook-form";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  editEvent?: TimeEvent; // New prop for editing events
}

const EventForm: React.FC<EventFormProps> = ({
  open,
  onClose,
  onSave,
  preselectedYear,
  preselectedMonth,
  editEvent
}) => {
  const colorOptions = [
    "#FF5757", // Red
    "#FFBD59", // Orange
    "#FFE459", // Yellow
    "#70FF59", // Green
    "#59FFC8", // Teal
    "#59C7FF", // Light Blue
    "#5975FF", // Blue
    "#A359FF", // Purple
    "#FF59F9", // Pink
    "#FF5990", // Hot Pink
  ];
  
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);
  const [intensity, setIntensity] = useState(5);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Initialize form with existing event data if provided
  useEffect(() => {
    if (editEvent) {
      setTitle(editEvent.title);
      setSelectedColor(editEvent.color);
      setIntensity(editEvent.intensity);
      setStartDate(editEvent.startDate);
      
      if (editEvent.endDate) {
        setHasEndDate(true);
        setEndDate(editEvent.endDate);
      } else {
        setHasEndDate(false);
        setEndDate(undefined);
      }
    } else {
      // Handle creating a new event
      resetForm();
      
      if (preselectedYear && preselectedMonth !== undefined) {
        const newDate = new Date();
        newDate.setFullYear(preselectedYear);
        newDate.setMonth(preselectedMonth);
        setStartDate(newDate);
      }
    }
  }, [editEvent, preselectedYear, preselectedMonth, open]);
  
  const resetForm = () => {
    setTitle("");
    setSelectedColor(colorOptions[0]);
    setIntensity(5);
    setStartDate(new Date());
    setHasEndDate(false);
    setEndDate(undefined);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: TimeEvent = {
      id: editEvent ? editEvent.id : uuidv4(),
      title,
      color: selectedColor,
      intensity,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
    };
    
    onSave(eventData);
    resetForm();
  };
  
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const handleToggleEndDate = (checked: boolean) => {
    setHasEndDate(checked);
    if (checked && !endDate) {
      // Initialize end date to startDate + 1 month if not set
      const newEndDate = new Date(startDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      setEndDate(newEndDate);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-md text-white border-cosmic-nebula-purple/30">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editEvent ? "Edit Memory" : "Add a New Memory"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                placeholder="What happened?"
                className="bg-background/50 border-white/20 text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-6 h-6 rounded-full ${selectedColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-background/50" : ""}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Intensity ({intensity})</label>
              <Slider
                value={[intensity]}
                min={1}
                max={10}
                step={1}
                onValueChange={(values) => setIntensity(values[0])}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date</label>
              <Input
                type="date"
                className="bg-background/50 border-white/20 text-white"
                value={format(startDate, "yyyy-MM-dd")}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={hasEndDate} 
                onCheckedChange={handleToggleEndDate} 
                id="has-end-date" 
              />
              <label 
                htmlFor="has-end-date" 
                className="text-sm font-medium cursor-pointer"
              >
                This memory lasted for a period of time
              </label>
            </div>
            
            {hasEndDate && (
              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="date"
                  className="bg-background/50 border-white/20 text-white"
                  value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  required={hasEndDate}
                  min={format(startDate, "yyyy-MM-dd")} // Cannot be before start date
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {editEvent ? "Save Changes" : "Add Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
