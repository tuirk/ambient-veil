import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TimeEvent } from "@/types/event";
import { v4 as uuidv4 } from "uuid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEASONS, getSeasonalDateRange } from "@/utils/seasonalUtils";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  startYear: number;
  currentYear: number;
}

const MOOD_COLORS = [
  "#9b87f5", // Purple
  "#D946EF", // Magenta
  "#F97316", // Orange
  "#0EA5E9", // Blue
  "#ea384c", // Red
  "#16a34a", // Green
];

const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const EventForm: React.FC<EventFormProps> = ({
  open,
  onClose,
  onSave,
  preselectedYear,
  preselectedMonth,
  startYear,
  currentYear,
}) => {
  const { toast } = useToast();
  
  const minYear = Math.min(startYear, currentYear - 5);
  const maxYear = currentYear + 1;
  
  const years = Array.from(
    { length: maxYear - minYear + 1 }, 
    (_, i) => minYear + i
  );
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(MOOD_COLORS[0]);
  const [intensity, setIntensity] = useState(5);
  
  const [selectedStartYear, setSelectedStartYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  const [startMonth, setStartMonth] = useState(preselectedMonth || 0);
  const [startDay, setStartDay] = useState(1);
  const [includeDay, setIncludeDay] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endYear, setEndYear] = useState(selectedStartYear);
  const [endMonth, setEndMonth] = useState(startMonth);
  const [endDay, setEndDay] = useState(1);
  
  const [useRoughDate, setUseRoughDate] = useState(false);
  const [roughSeason, setRoughSeason] = useState<string>("Spring");
  const [roughYear, setRoughYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );

  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableEndDays, setAvailableEndDays] = useState<number[]>([]);

  const [eventType, setEventType] = useState<"one-time" | "process">("one-time");

  useEffect(() => {
    if (preselectedYear) {
      const constrainedYear = Math.max(minYear, Math.min(maxYear, preselectedYear));
      setSelectedStartYear(constrainedYear);
      setEndYear(constrainedYear);
      setRoughYear(constrainedYear);
    }
    
    if (preselectedMonth !== undefined) {
      setStartMonth(preselectedMonth);
      setEndMonth(preselectedMonth);
    }
  }, [preselectedYear, preselectedMonth, minYear, maxYear]);

  useEffect(() => {
    const days = daysInMonth(startMonth, selectedStartYear);
    setAvailableDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (startDay > days) {
      setStartDay(1);
    }
  }, [startMonth, selectedStartYear]);

  useEffect(() => {
    const days = daysInMonth(endMonth, endYear);
    setAvailableEndDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (endDay > days) {
      setEndDay(1);
    }
  }, [endMonth, endYear]);

  useEffect(() => {
    if (useRoughDate || hasEndDate) {
      setEventType("process");
    }
  }, [useRoughDate, hasEndDate]);

  const handleSave = () => {
    if (!title) return;

    if (useRoughDate) {
      if (roughYear < minYear || roughYear > maxYear) {
        toast({
          title: "Invalid Date Range",
          description: `Year must be between ${minYear} and ${maxYear}`,
          variant: "destructive",
        });
        return;
      }
    } else {
      const startDate = new Date(selectedStartYear, startMonth, includeDay ? startDay : 1);
      const minDate = new Date(minYear, 0, 1); // Jan 1 of minYear
      const maxDate = new Date(maxYear, 11, 31); // Dec 31 of maxYear
      
      if (startDate < minDate || startDate > maxDate) {
        toast({
          title: "Invalid Date Range",
          description: `Start date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
          variant: "destructive",
        });
        return;
      }
      
      if (hasEndDate) {
        const endDate = new Date(endYear, endMonth, includeDay ? endDay : 1);
        if (endDate < minDate || endDate > maxDate) {
          toast({
            title: "Invalid Date Range",
            description: `End date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
            variant: "destructive",
          });
          return;
        }
        
        if (endDate < startDate) {
          toast({
            title: "Invalid Date Range",
            description: "End date cannot be before start date",
            variant: "destructive",
          });
          return;
        }
      }
    }

    let newEvent: TimeEvent;

    if (useRoughDate) {
      const { startDate, endDate } = getSeasonalDateRange(roughSeason, roughYear);
      
      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate,
        endDate,
        isRoughDate: true,
        roughDateSeason: roughSeason,
        roughDateYear: roughYear,
        eventType: "process"
      };
    } else {
      const startDate = new Date(selectedStartYear, startMonth, includeDay ? startDay : 1);
      const endDate = hasEndDate ? new Date(endYear, endMonth, includeDay ? endDay : 1) : undefined;

      const type = includeDay && !hasEndDate ? "one-time" : "process";

      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate,
        endDate,
        eventType: type
      };
    }

    onSave(newEvent);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setSelectedColor(MOOD_COLORS[0]);
    setIntensity(5);
    setHasEndDate(false);
    setUseRoughDate(false);
    setIncludeDay(false);
    setEventType("one-time");
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-sm border-cosmic-nebula-purple/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wider">New Memory</DialogTitle>
          <DialogDescription className="text-muted-foreground opacity-70">
            Capture a moment in your spiral
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium leading-none">
              Title
            </label>
            <Input
              id="title"
              placeholder="What would you call this moment?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">Emotional Tone</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {MOOD_COLORS.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color
                      ? "ring-2 ring-white scale-110"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium leading-none">
              Intensity: {intensity}
            </label>
            <Slider
              value={[intensity]}
              min={1}
              max={10}
              step={1}
              onValueChange={(value) => setIntensity(value[0])}
              className="mt-1"
            />
          </div>

          <div className="grid gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium leading-none">Choose Date Type:</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  !useRoughDate 
                    ? "border-primary bg-primary/20 shadow-md" 
                    : "border-muted bg-background/60 hover:bg-background/80"
                }`}
                onClick={() => setUseRoughDate(false)}
              >
                <h3 className="font-medium mb-1">Exact Date</h3>
                <p className="text-xs text-muted-foreground">Specific date for a single moment or period</p>
              </div>
              
              <div 
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  useRoughDate 
                    ? "border-primary bg-primary/20 shadow-md" 
                    : "border-muted bg-background/60 hover:bg-background/80"
                }`}
                onClick={() => setUseRoughDate(true)}
              >
                <h3 className="font-medium mb-1">Seasonal</h3>
                <p className="text-xs text-muted-foreground">A general season within a year</p>
              </div>
            </div>
          </div>

          {useRoughDate ? (
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none">Season & Year</label>
              <div className="grid grid-cols-2 gap-2">
                <Select 
                  value={roughSeason} 
                  onValueChange={(value) => setRoughSeason(value)}
                >
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {SEASONS.map((season) => (
                      <SelectItem key={season} value={season}>
                        {season}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <select
                  value={roughYear}
                  onChange={(e) => setRoughYear(Number(e.target.value))}
                  className="rounded-md border border-input bg-background/50 px-3 py-2"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">Event Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      eventType === "one-time"
                        ? "border-primary bg-primary/20 shadow-md" 
                        : "border-muted bg-background/60 hover:bg-background/80"
                    }`}
                    onClick={() => {
                      setEventType("one-time");
                      setHasEndDate(false);
                      setIncludeDay(true);
                    }}
                  >
                    <h3 className="font-medium text-sm">One-Time Event</h3>
                    <p className="text-xs text-muted-foreground">A single moment on a specific day</p>
                  </div>
                  
                  <div 
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      eventType === "process"
                        ? "border-primary bg-primary/20 shadow-md" 
                        : "border-muted bg-background/60 hover:bg-background/80"
                    }`}
                    onClick={() => {
                      setEventType("process");
                    }}
                  >
                    <h3 className="font-medium text-sm">Process/Period</h3>
                    <p className="text-xs text-muted-foreground">A period of time or month-level event</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium leading-none">
                  {eventType === "one-time" ? "When" : "Start Date"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={startMonth}
                    onChange={(e) => setStartMonth(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>
                        {month}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedStartYear}
                    onChange={(e) => setSelectedStartYear(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {eventType === "one-time" ? (
                <div className="grid gap-2">
                  <label className="text-sm font-medium leading-none">
                    Day
                  </label>
                  <select
                    value={startDay}
                    onChange={(e) => setStartDay(Number(e.target.value))}
                    className="rounded-md border border-input bg-background/50 px-3 py-2"
                  >
                    {availableDays.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeDay"
                      checked={includeDay}
                      onCheckedChange={(checked) => setIncludeDay(!!checked)}
                      className="border-input"
                    />
                    <Label htmlFor="includeDay" className="text-sm">
                      I want to specify the exact day
                    </Label>
                  </div>

                  {includeDay && (
                    <div className="grid gap-2 pl-6">
                      <label className="text-sm font-medium leading-none">
                        Start Day
                      </label>
                      <select
                        value={startDay}
                        onChange={(e) => setStartDay(Number(e.target.value))}
                        className="rounded-md border border-input bg-background/50 px-3 py-2"
                      >
                        {availableDays.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="hasEndDate"
                      checked={hasEndDate}
                      onCheckedChange={(checked) => setHasEndDate(!!checked)}
                      className="border-input"
                    />
                    <Label htmlFor="hasEndDate" className="text-sm">
                      This process has an end date
                    </Label>
                  </div>

                  {hasEndDate && (
                    <div className="grid gap-2 pl-6">
                      <label className="text-sm font-medium leading-none">
                        End Date
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={endMonth}
                          onChange={(e) => setEndMonth(Number(e.target.value))}
                          className="rounded-md border border-input bg-background/50 px-3 py-2"
                        >
                          {months.map((month, index) => (
                            <option key={month} value={index}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          value={endYear}
                          onChange={(e) => setEndYear(Number(e.target.value))}
                          className="rounded-md border border-input bg-background/50 px-3 py-2"
                        >
                          {years.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {includeDay && (
                        <div className="mt-2">
                          <label className="text-sm font-medium leading-none">
                            End Day
                          </label>
                          <select
                            value={endDay}
                            onChange={(e) => setEndDay(Number(e.target.value))}
                            className="rounded-md border border-input bg-background/50 px-3 py-2 w-full mt-1"
                          >
                            {availableEndDays.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title}>
            Add to Spiral
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
