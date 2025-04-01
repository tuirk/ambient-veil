
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

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: TimeEvent) => void;
  preselectedYear?: number;
  preselectedMonth?: number;
}

const MOOD_COLORS = [
  "#9b87f5", // Purple
  "#D946EF", // Magenta
  "#F97316", // Orange
  "#0EA5E9", // Blue
  "#ea384c", // Red
  "#16a34a", // Green
];

const EventForm: React.FC<EventFormProps> = ({
  open,
  onClose,
  onSave,
  preselectedYear,
  preselectedMonth,
}) => {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  
  // Calculate allowed date range
  const minYear = currentYear - 5;
  const maxYear = currentYear + 1;
  
  // Generate available years for selection (from minYear to maxYear)
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
  
  // Exact date states
  const [startYear, setStartYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  const [startMonth, setStartMonth] = useState(preselectedMonth || 0);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endYear, setEndYear] = useState(startYear);
  const [endMonth, setEndMonth] = useState(startMonth);
  
  // Rough date states
  const [useRoughDate, setUseRoughDate] = useState(false);
  const [roughSeason, setRoughSeason] = useState<string>("Spring");
  const [roughYear, setRoughYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );

  // When preselected values change, update form state
  useEffect(() => {
    if (preselectedYear) {
      const constrainedYear = Math.max(minYear, Math.min(maxYear, preselectedYear));
      setStartYear(constrainedYear);
      setEndYear(constrainedYear);
      setRoughYear(constrainedYear);
    }
    
    if (preselectedMonth !== undefined) {
      setStartMonth(preselectedMonth);
      setEndMonth(preselectedMonth);
    }
  }, [preselectedYear, preselectedMonth, minYear, maxYear]);

  const handleSave = () => {
    if (!title) return;

    // Validate date ranges
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
      const startDate = new Date(startYear, startMonth);
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
        const endDate = new Date(endYear, endMonth);
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
      // Create event with rough date
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
        roughDateYear: roughYear
      };
    } else {
      // Create event with exact date
      const startDate = new Date(startYear, startMonth);
      const endDate = hasEndDate ? new Date(endYear, endMonth) : undefined;

      newEvent = {
        id: uuidv4(),
        title,
        color: selectedColor,
        intensity,
        startDate,
        endDate,
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useRoughDate"
              checked={useRoughDate}
              onChange={(e) => {
                setUseRoughDate(e.target.checked);
                if (e.target.checked) {
                  setHasEndDate(false); // Disable end date if rough date is selected
                }
              }}
              className="rounded border-input"
            />
            <label htmlFor="useRoughDate" className="text-sm">
              I only remember the season
            </label>
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
                <label className="text-sm font-medium leading-none">When</label>
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
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasEndDate"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="rounded border-input"
                  disabled={useRoughDate}
                />
                <label htmlFor="hasEndDate" className="text-sm">
                  This spans a period of time
                </label>
              </div>

              {hasEndDate && (
                <div className="grid gap-2 pl-6">
                  <label className="text-sm font-medium leading-none">
                    Ends
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
                </div>
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
