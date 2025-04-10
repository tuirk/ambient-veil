
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Clock, AlertCircle } from "lucide-react";
import { TimeEvent } from "@/types/event";
import { v4 as uuidv4 } from 'uuid';

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  preselectedDay?: number;
  startYear?: number;
  currentYear?: number;
}

const EventForm: React.FC<EventFormProps> = ({ 
  open, 
  onClose, 
  onSave,
  preselectedYear,
  preselectedMonth,
  preselectedDay,
  startYear,
  currentYear
}) => {
  // Current date as default
  const now = new Date();
  
  // Create a date from preselected values if they exist
  let preselectedDate: Date | undefined;
  if (preselectedYear !== undefined && preselectedMonth !== undefined) {
    preselectedDate = new Date();
    preselectedDate.setFullYear(preselectedYear);
    preselectedDate.setMonth(preselectedMonth);
    
    // If we have a preselected day, set it
    if (preselectedDay !== undefined) {
      preselectedDate.setDate(preselectedDay);
    }
  }
  
  // Define form state
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#6366F1"); // Default Indigo color
  const [intensity, setIntensity] = useState([5]); // Default middle intensity
  const [eventType, setEventType] = useState<"one-time" | "process">("one-time");
  const [startDate, setStartDate] = useState<Date | undefined>(preselectedDate || now);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isRoughDate, setIsRoughDate] = useState(false);
  const [roughDateSeason, setRoughDateSeason] = useState<string>("Spring");
  const [roughDateYear, setRoughDateYear] = useState<number>(now.getFullYear());
  
  // Validation state
  const [errors, setErrors] = useState<string[]>([]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors: string[] = [];
    
    if (!title.trim()) {
      validationErrors.push("Title is required");
    }
    
    if (!startDate && !isRoughDate) {
      validationErrors.push("Start date is required");
    }
    
    if (eventType === "process" && !endDate && !isRoughDate) {
      validationErrors.push("End date is required for process events");
    }
    
    if (isRoughDate && !roughDateSeason) {
      validationErrors.push("Season is required for rough dates");
    }
    
    // If there are validation errors, show them and don't proceed
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors([]);
    
    // Create the new event
    const newEvent: TimeEvent = {
      id: uuidv4(),
      title,
      color,
      intensity: intensity[0],
      startDate: startDate || new Date(), // Fallback shouldn't happen due to validation
      eventType,
      isRoughDate,
    };
    
    // Add optional properties based on event type and settings
    if (eventType === "process" && endDate) {
      newEvent.endDate = endDate;
    }
    
    if (isRoughDate) {
      newEvent.roughDateSeason = roughDateSeason;
      newEvent.roughDateYear = roughDateYear;
    }
    
    // Save the event
    onSave(newEvent);
    
    // Reset form and close
    resetForm();
    onClose();
  };
  
  // Reset form to defaults
  const resetForm = () => {
    setTitle("");
    setColor("#6366F1");
    setIntensity([5]);
    setEventType("one-time");
    setStartDate(now);
    setEndDate(undefined);
    setIsRoughDate(false);
    setRoughDateSeason("Spring");
    setRoughDateYear(now.getFullYear());
    setErrors([]);
  };
  
  // Close form and reset
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Generate year options for calendar
  const fromYear = startYear || now.getFullYear() - 5;
  const toYear = currentYear || now.getFullYear() + 1;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Memory</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input 
              id="title" 
              placeholder="Enter a title for this memory" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          {/* Memory type */}
          <div className="space-y-2">
            <Label>Memory Type</Label>
            <RadioGroup 
              value={eventType} 
              onValueChange={(value: "one-time" | "process") => setEventType(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">One-time Event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="process" id="process" />
                <Label htmlFor="process">Process/Period</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Date selection */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="rough-date" 
                checked={isRoughDate}
                onChange={() => setIsRoughDate(!isRoughDate)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="rough-date">This is a rough/seasonal date</Label>
            </div>
            
            {/* Specific date inputs */}
            {!isRoughDate && (
              <>
                {/* Start date */}
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        fromYear={fromYear}
                        toYear={toYear}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* End date (for process events) */}
                {eventType === "process" && (
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          fromYear={fromYear}
                          toYear={toYear}
                          disabled={(date) => 
                            startDate ? date < startDate : false
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </>
            )}
            
            {/* Rough date inputs */}
            {isRoughDate && (
              <>
                <div className="space-y-2">
                  <Label>Season</Label>
                  <select
                    value={roughDateSeason}
                    onChange={(e) => setRoughDateSeason(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                    <option value="Winter">Winter</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Year</Label>
                  <select
                    value={roughDateYear}
                    onChange={(e) => setRoughDateYear(Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 p-2"
                  >
                    {Array.from({ length: toYear - fromYear + 1 }, (_, i) => (
                      <option key={fromYear + i} value={fromYear + i}>
                        {fromYear + i}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
          
          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex space-x-2">
              <Input
                type="color"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          {/* Intensity */}
          <div className="space-y-2">
            <Label>Intensity (1-10)</Label>
            <div className="flex items-center space-x-4">
              <span>1</span>
              <Slider
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span>10</span>
            </div>
            <div className="text-center text-sm text-gray-500">
              {intensity[0]}
            </div>
          </div>
          
          {/* Validation errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
