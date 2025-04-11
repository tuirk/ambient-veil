
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SpanTypeSelectorProps {
  spanType: "SEASONAL" | "EXACT";
  setSpanType: (value: "SEASONAL" | "EXACT") => void;
}

const SpanTypeSelector: React.FC<SpanTypeSelectorProps> = ({ spanType, setSpanType }) => {
  return (
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
  );
};

export default SpanTypeSelector;
