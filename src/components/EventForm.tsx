import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TimeEvent } from "@/types/event";
import { useToast } from "@/hooks/use-toast";
import { SEASONS } from "@/utils/seasonalUtils";
import { MOOD_COLORS, MONTHS, daysInMonth } from "./event-form/constants";
import ColorSelector from "./event-form/ColorSelector";
import IntensitySlider from "./event-form/IntensitySlider";
import DateTypeSelector from "./event-form/DateTypeSelector";
import SingleDayPicker from "./event-form/SingleDayPicker";
import SpanTypeSelector from "./event-form/SpanTypeSelector";
import SeasonPicker from "./event-form/SeasonPicker";
import DateRangePicker from "./event-form/DateRangePicker";

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

  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(MOOD_COLORS[0]);
  const [intensity, setIntensity] = useState(5);
  
  const [dateLength, setDateLength] = useState<"ONE_DAY" | "SPAN">("ONE_DAY");
  const [spanType, setSpanType] = useState<"SEASONAL" | "EXACT">("EXACT");
  
  const [singleDay, setSingleDay] = useState(preselectedDay || 1);
  const [singleMonth, setSingleMonth] = useState(preselectedMonth || 0);
  const [singleYear, setSingleYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  
  const [startDay, setStartDay] = useState(preselectedDay || 1);
  const [startMonth, setStartMonth] = useState(preselectedMonth || 0);
  const [spanStartYear, setSpanStartYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );
  const [specifyDays, setSpecifyDays] = useState(false);
  const [endDay, setEndDay] = useState(1);
  const [endMonth, setEndMonth] = useState(startMonth);
  const [endYear, setEndYear] = useState(spanStartYear);
  
  const [season, setSeason] = useState<string>("Spring");
  const [seasonYear, setSeasonYear] = useState(
    preselectedYear ? 
      Math.max(minYear, Math.min(maxYear, preselectedYear)) : 
      currentYear
  );

  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [availableEndDays, setAvailableEndDays] = useState<number[]>([]);
  const [availableSingleDays, setAvailableSingleDays] = useState<number[]>([]);

  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");

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

  useEffect(() => {
    const days = daysInMonth(startMonth, spanStartYear);
    setAvailableDays(Array.from({ length: days }, (_, i) => i + 1));
    
    if (startDay > days) {
      setStartDay(1);
    }
  }, [startMonth, spanStartYear]);

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

    const validation = validateDateRanges(
      dateLength, 
      spanType, 
      singleYear, 
      singleMonth, 
      singleDay,
      seasonYear,
      spanStartYear,
      startMonth,
      startDay,
      endYear,
      endMonth,
      endDay,
      specifyDays,
      minYear,
      maxYear
    );
    
    if (!validation.isValid) {
      toast({
        title: validation.errorTitle,
        description: validation.errorDescription,
        variant: "destructive",
      });
      return;
    }

    const newEvent = {
      ...createEventObject(
        dateLength,
        spanType,
        title,
        selectedColor,
        intensity,
        singleYear,
        singleMonth,
        singleDay,
        seasonYear,
        season,
        spanStartYear,
        startMonth,
        startDay,
        endYear,
        endMonth,
        endDay,
        specifyDays
      ),
      description: description || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : undefined
    };

    onSave(newEvent);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags("");
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
            <label htmlFor="description" className="text-sm font-medium leading-none">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Tell me more about this memory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 min-h-[100px]"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="tags" className="text-sm font-medium leading-none">
              Tags (comma separated)
            </label>
            <Input
              id="tags"
              placeholder="family, vacation, milestone..."
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="bg-background/50"
            />
          </div>

          <ColorSelector 
            selectedColor={selectedColor} 
            setSelectedColor={setSelectedColor}
            colors={MOOD_COLORS}
          />

          <IntensitySlider 
            intensity={intensity} 
            setIntensity={setIntensity} 
          />

          <DateTypeSelector 
            dateLength={dateLength} 
            setDateLength={setDateLength} 
          />

          {dateLength === "ONE_DAY" && (
            <SingleDayPicker
              singleDay={singleDay}
              setSingleDay={setSingleDay}
              singleMonth={singleMonth}
              setSingleMonth={setSingleMonth}
              singleYear={singleYear}
              setSingleYear={setSingleYear}
              availableDays={availableSingleDays}
              months={MONTHS}
              years={years}
            />
          )}

          {dateLength === "SPAN" && (
            <>
              <SpanTypeSelector 
                spanType={spanType} 
                setSpanType={setSpanType} 
              />

              {spanType === "SEASONAL" && (
                <SeasonPicker
                  season={season}
                  setSeason={setSeason}
                  seasonYear={seasonYear}
                  setSeasonYear={setSeasonYear}
                  seasons={SEASONS}
                  years={years}
                />
              )}

              {spanType === "EXACT" && (
                <DateRangePicker
                  specifyDays={specifyDays}
                  setSpecifyDays={setSpecifyDays}
                  startDay={startDay}
                  setStartDay={setStartDay}
                  startMonth={startMonth}
                  setStartMonth={setStartMonth}
                  spanStartYear={spanStartYear}
                  setSpanStartYear={setSpanStartYear}
                  endDay={endDay}
                  setEndDay={setEndDay}
                  endMonth={endMonth}
                  setEndMonth={setEndMonth}
                  endYear={endYear}
                  setEndYear={setEndYear}
                  availableDays={availableDays}
                  availableEndDays={availableEndDays}
                  months={MONTHS}
                  years={years}
                />
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
