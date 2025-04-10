
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListIcon, Calendar, Clock, CalendarDays, CalendarCheck, ArrowLeft } from "lucide-react";

interface SpiralControlsProps {
  onAddMemoryClick: () => void;
  onViewMemoriesClick: () => void;
  viewType: "annual" | "quarterly" | "monthly" | "weekly";
}

export const SpiralControls: React.FC<SpiralControlsProps> = ({
  onAddMemoryClick,
  onViewMemoriesClick,
  viewType,
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
      <Button onClick={onAddMemoryClick} className="bg-indigo-600 hover:bg-indigo-700">
        Add Memory
      </Button>
      <Button 
        variant="outline" 
        className="border-white/20 text-white hover:bg-white/10"
        onClick={onViewMemoriesClick}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        View Memories
      </Button>
      
      {/* Navigation Links */}
      <div className="flex flex-col gap-2 w-full">
        {viewType !== "annual" && (
          <Link to="/spiral">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 w-full"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Annual View
            </Button>
          </Link>
        )}
        
        {viewType !== "quarterly" && (
          <Link to="/quarterly">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 w-full"
            >
              <CalendarCheck className="mr-2 h-4 w-4" />
              Quarterly View
            </Button>
          </Link>
        )}
        
        {viewType !== "monthly" && (
          <Link to="/monthly">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 w-full"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Monthly View
            </Button>
          </Link>
        )}
        
        {viewType !== "weekly" && (
          <Link to="/weekly">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10 w-full"
            >
              <Clock className="mr-2 h-4 w-4" />
              Weekly View
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
