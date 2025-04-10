
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ListIcon, Calendar, ArrowLeft, Clock } from "lucide-react";

interface SpiralControlsProps {
  onAddMemoryClick: () => void;
  onViewMemoriesClick: () => void;
  viewType: "annual" | "quarterly" | "current";
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
      
      {/* Navigation buttons based on current view */}
      {viewType === "annual" && (
        <>
          <Link to="/quarterly">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Quarterly View
            </Button>
          </Link>
          <Link to="/current">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Clock className="mr-2 h-4 w-4" />
              Current Week
            </Button>
          </Link>
        </>
      )}
      
      {viewType === "quarterly" && (
        <>
          <Link to="/spiral">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annual View
            </Button>
          </Link>
          <Link to="/current">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Clock className="mr-2 h-4 w-4" />
              Current Week
            </Button>
          </Link>
        </>
      )}
      
      {viewType === "current" && (
        <>
          <Link to="/spiral">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Annual View
            </Button>
          </Link>
          <Link to="/quarterly">
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Quarterly View
            </Button>
          </Link>
        </>
      )}
    </div>
  );
};
