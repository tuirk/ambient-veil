
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, CalendarRange } from "lucide-react";

interface ViewToggleProps {
  view: "year" | "near-future";
  onViewChange: (view: "year" | "near-future") => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="bg-background/30 backdrop-blur-sm p-2 rounded-lg border border-white/10 shadow-lg">
      <ToggleGroup type="single" value={view} onValueChange={(value) => value && onViewChange(value as "year" | "near-future")}>
        <ToggleGroupItem value="year" aria-label="Year view">
          <Calendar className="mr-1 h-4 w-4" />
          <span>Year</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="near-future" aria-label="Near future view">
          <CalendarRange className="mr-1 h-4 w-4" />
          <span>Near Future</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ViewToggle;
