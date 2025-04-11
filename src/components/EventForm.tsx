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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
  preselectedDay?: number;
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
  preselectedDay,
  startYear: minStartYear,
  currentYear,
}) => {
  const { toast } = useToast();
  
  const minYear = Math.min(minStartYear, currentYear - 5);
  const maxYear = currentYear + 1;
  
  const years = Array.from(
    { length: maxYear - minYear + 1 }, 
    (_, i) => minYear + i
  );
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  // Basic event details
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(MOOD_COLORS[0]);
  const [intensity, setIntensity] = useState(5);
  
  // Date selection logic
  const [dateLength, setDateLength] = useState<"ONE_DAY" | "SPAN">("ONE_DAY");
  const [spanType, setSpanType] = useState<"SEASONAL" | "EXACT">("EXACT");
  
  // One-day event
  const [singleDay, setSingleDay] = useState(1);
  const [singleMonth, setSingleMonth] = useState(preselectedMonth || 0);
  const [singleYear, setSingleYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  
  // Span - Exact dates
  const [startDay, setStartDay] = useState(1);
  const [startMonth, setStartMonth] = useState(preselectedMonth || 0);
  const [spanStartYear, setSpanStartYear] = useState( // Renamed from startYear to spanStartYear
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  const [specifyDays, setSpecifyDays] = useState(false);
  const [endDay, setEndDay] = useState(1);
  const [endMonth, setEndMonth] = useState(startMonth);
  const [endYear, setEndYear] = useState(spanStartYear); // Updated to use spanStartYear
  
  // Span - Seasonal
  const [season, setSeason] = useState<string>("Spring");
  const [seasonYear, setSeasonYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );

  // Available days for each month
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableEndDays, setAvailableEndDays] = useState<number[]>([]);
  const [availableSingleDays, setAvailableSingleDays] = useState<number[]>([]);

  // Initialize with preselected values if available
  useEffect(() => {
    if (preselectedYear) {
      const constrainedYear = Math.max(minYear, Math.min(maxYear, preselectedYear));
      setSingleYear(constrainedYear);
      setSpanStartYear(constrainedYear);
      setEndYear(constrainedYear);
      setSeasonYear(constrainedYear);
    }
    
    if (preselectedMonth !== undefined) {
      setSingleMonth(preselectedMonth);
      setStartMonth(preselectedMonth);
      setEndMonth(preselectedMonth);
    }

    if (preselectedDay !== undefined) {
      setSingleDay(preselectedDay);
      setStartDay(preselectedDay);
      setEndDay(preselectedDay);
    }
  }, [preselectedYear, preselectedMonth, preselectedDay, minYear, maxYear]);

  // Update available days when months/years change
  useEffect(() => {
    const days = daysInMonth(startMonth, spanStartYear); // Updated to use spanStartYear
    setAvailableDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (startDay > days) {
      setStartDay(1);
    }
  }, [startMonth, spanStartYear]); // Updated to use spanStartYear

  useEffect(() => {
    const days = daysInMonth(endMonth, endYear);
    setAvailableEndDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (endDay > days) {
      setEndDay(1);
    }
  }, [endMonth, endYear]);
  
  useEffect(() => {
    const days = daysInMonth(singleMonth, singleYear);
    setAvailableSingleDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (singleDay > days) {
      setSingleDay(1);
    }
  }, [singleMonth, singleYear]);

  const handleSave = () => {
    if (!title) return;

    // Validate date ranges
    if (dateLength === "ONE_DAY") {
      const eventDate = new Date(singleYear, singleMonth, singleDay);
      const minDate = new Date(minYear, 0, 1);
      const maxDate = new Date(maxYear, 11, 31);
      
      if (eventDate < minDate || eventDate > maxDate) {
        toast({
          title: "Invalid Date",
          description: `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
          variant: "destructive",
        });
        return;
      }
    } else if (dateLength === "SPAN") {
      if (spanType === "SEASONAL") {
        if (seasonYear < minYear || seasonYear > maxYear) {
          toast({
            title: "Invalid Year",
            description: `Year must be between ${minYear} and ${maxYear}`,
            variant: "destructive",
          });
          return;
        }
      } else {
        // Validate exact span dates
        const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1); // Updated to use spanStartYear
        const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
        const minDate = new Date(minYear, 0, 1);
        const maxDate = new Date(maxYear, 11, 31);
        
        if (startDate < minDate || startDate > maxDate || endDate < minDate || endDate > maxDate) {
          toast({
            title: "Invalid Date Range",
            description: `Dates must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
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

    if (dateLength === "ONE_DAY") {
      // Create a one-time event with a specific day
      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate: new Date(singleYear, singleMonth, singleDay),
        eventType: "one-time"
      };
    } else if (dateLength === "SPAN") {
      if (spanType === "SEASONAL") {
        // Create a seasonal event
        const { startDate, endDate } = getSeasonalDateRange(season, seasonYear);
        
        newEvent = {
          id: uuidv4(),
          title,
          color: selectedColor,
          intensity,
          startDate,
          endDate,
          isRoughDate: true,
          roughDateSeason: season,
          roughDateYear: seasonYear,
          eventType: "process"
        };
      } else {
        // Create an exact process event
        const startDate = new Date(spanStartYear, startMonth, specifyDays ? startDay : 1); // Updated to use spanStartYear
        const endDate = new Date(endYear, endMonth, specifyDays ? endDay : daysInMonth(endMonth, endYear));
        
        newEvent = {
          id: uuidv4(),
          title,
          color: selectedColor,
          intensity,
          startDate,
          endDate,
          eventType: "process"
        };
      }
    }

    onSave(newEvent);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setSelectedColor(MOOD_COLORS[0]);
    setIntensity(5);
    setDateLength("ONE_DAY");
    setSpanType("EXACT");
    setSpecifyDays(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-background/90 backdrop-blur-sm border-cosmic-nebula-purple/20 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light tracking-wider">New Memory</DialogTitle>
          <DialogDescription className="text-muted-foreground opacity-70">
            Capture a moment in your spiral
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Title field */}
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

          {/* Color selection */}
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

          {/* Intensity slider */}
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

          {/* Date Length Selection */}
          <div className="grid gap-3 pt-2">
            <label className="text-sm font-medium leading-none">How long did this event last?</label>
            
            <RadioGroup
              value={dateLength}
              onValueChange={(value: "ONE_DAY" | "SPAN") => setDateLength(value)}
              className="grid grid-cols-2 gap-4 mt-1"
            >
              <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                dateLength === "ONE_DAY" ? "border-primary bg-primary/10" : "border-muted"
              }`}>
                <RadioGroupItem value="ONE_DAY" id="date-one-day" className="sr-only" />
                <Label htmlFor="date-one-day" className="flex flex-col cursor-pointer">
                  <span className="font-medium">Just one day</span>
                  <span className="text-xs text-muted-foreground mt-1">A specific date</span>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                dateLength === "SPAN" ? "border-primary bg-primary/10" : "border-muted"
              }`}>
                <RadioGroupItem value="SPAN" id="date-span" className="sr-only" />
                <Label htmlFor="date-span" className="flex flex-col cursor-pointer">
                  <span className="font-medium">Over a span</span>
                  <span className="text-xs text-muted-foreground mt-1">A period of time</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Fields - One Day Event */}
          {dateLength === "ONE_DAY" && (
            <div className="grid gap-3">
              <label className="text-sm font-medium leading-none">Date</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={singleDay}
                  onChange={(e) => setSingleDay(Number(e.target.value))}
                  className="rounded-md border border-input bg-background/50 px-3 py-2"
                >
                  {availableSingleDays.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <select
                  value={singleMonth}
                  onChange={(e) => setSingleMonth(Number(e.target.value))}
                  className="rounded-md border border-input bg-background/50 px-3 py-2"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={singleYear}
                  onChange={(e) => setSingleYear(Number(e.target.value))}
                  className="rounded-md border border-input bg-background/50 px-3 py-2"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Date Fields - Span Event */}
          {dateLength === "SPAN" && (
            <>
              {/* Span Type Selection */}
              <div className="grid gap-3">
                <label className="text-sm font-medium leading-none">How would you define this period?</label>
                
                <RadioGroup
                  value={spanType}
                  onValueChange={(value: "SEASONAL" | "EXACT") => setSpanType(value)}
                  className="grid grid-cols-2 gap-4 mt-1"
                >
                  <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                    spanType === "SEASONAL" ? "border-primary bg-primary/10" : "border-muted"
                  }`}>
                    <RadioGroupItem value="SEASONAL" id="span-seasonal" className="sr-only" />
                    <Label htmlFor="span-seasonal" className="flex flex-col cursor-pointer">
                      <span className="font-medium">Seasonal</span>
                      <span className="text-xs text-muted-foreground mt-1">Spring, Summer, etc.</span>
                    </Label>
                  </div>
                  
                  <div className={`flex items-center space-x-2 rounded-lg border p-4 cursor-pointer transition-all ${
                    spanType === "EXACT" ? "border-primary bg-primary/10" : "border-muted"
                  }`}>
                    <RadioGroupItem value="EXACT" id="span-exact" className="sr-only" />
                    <Label htmlFor="span-exact" className="flex flex-col cursor-pointer">
                      <span className="font-medium">Exact dates</span>
                      <span className="text-xs text-muted-foreground mt-1">Specific start & end</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Seasonal */}
              {spanType === "SEASONAL" && (
                <div className="grid gap-3">
                  <label className="text-sm font-medium leading-none">Season & Year</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select 
                      value={season} 
                      onValueChange={(value) => setSeason(value)}
                    >
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEASONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <select
                      value={seasonYear}
                      onChange={(e) => setSeasonYear(Number(e.target.value))}
                      className="rounded-md border border-input bg-background/50 px-3 py-2"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Exact Dates */}
              {spanType === "EXACT" && (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="specifyDays"
                      checked={specifyDays}
                      onCheckedChange={(checked) => setSpecifyDays(!!checked)}
                      className="border-input"
                    />
                    <Label htmlFor="specifyDays" className="text-sm">
                      I want to specify exact days (not just months)
                    </Label>
                  </div>

                  {/* Start Date */}
                  <div className="grid gap-3">
                    <label className="text-sm font-medium leading-none">Start Date</label>
                    <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                      {specifyDays && (
                        <select
                          value={startDay}
                          onChange={(e) => setStartDay(Number(e.target.value))}
                          className="rounded-md border border-input bg-background/50 px-3 py-2"
                        >
                          {availableDays.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      )}
                      <select
                        value={startMonth}
                        onChange={(e) => setStartMonth(Number(e.target.value))}
                        className="rounded-md border border-input bg-background/50 px-3 py-2"
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={spanStartYear} // Updated to use spanStartYear
                        onChange={(e) => setSpanStartYear(Number(e.target.value))} // Updated to use spanStartYear
                        className="rounded-md border border-input bg-background/50 px-3 py-2"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="grid gap-3">
                    <label className="text-sm font-medium leading-none">End Date</label>
                    <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                      {specifyDays && (
                        <select
                          value={endDay}
                          onChange={(e) => setEndDay(Number(e.target.value))}
                          className="rounded-md border border-input bg-background/50 px-3 py-2"
                        >
                          {availableEndDays.map((day) => (
                            <option key={day} value={day}>{day}</option>
                          ))}
                        </select>
                      )}
                      <select
                        value={endMonth}
                        onChange={(e) => setEndMonth(Number(e.target.value))}
                        className="rounded-md border border-input bg-background/50 px-3 py-2"
                      >
                        {months.map((month, index) => (
                          <option key={month} value={index}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(Number(e.target.value))}
                        className="rounded-md border border-input bg-background/50 px-3 py-2"
                      >
                        {years.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>
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
