
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface DateTypeSelectorProps {
  dateLength: "ONE_DAY" | "SPAN";
  setDateLength: (value: "ONE_DAY" | "SPAN") => void;
}

const DateTypeSelector: React.FC<DateTypeSelectorProps> = ({ dateLength, setDateLength }) => {
  return (
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
  );
};

export default DateTypeSelector;
