
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, CalendarDays } from "lucide-react";

interface ViewToggleProps {
  view: "month" | "year";
  onViewChange: (view: "month" | "year") => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onViewChange }) => {
  return (
    <div className="bg-background/30 backdrop-blur-sm p-2 rounded-lg border border-white/10 shadow-lg">
      <ToggleGroup type="single" value={view} onValueChange={(value) => value && onViewChange(value as "month" | "year")}>
        <ToggleGroupItem value="month" aria-label="Month view">
          <Calendar className="mr-1 h-4 w-4" />
          <span>Month</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="year" aria-label="Year view">
          <CalendarDays className="mr-1 h-4 w-4" />
          <span>Year</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ViewToggle;
