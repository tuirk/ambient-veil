
import React from "react";
import { Button } from "@/components/ui/button";
import { ListIcon } from "lucide-react";

interface SpiralControlsProps {
  onAddMemory: () => void;
  onViewMemories: () => void;
}

export const SpiralControls: React.FC<SpiralControlsProps> = ({
  onAddMemory,
  onViewMemories
}) => {
  return (
    <div className="absolute top-4 right-4 flex flex-col items-end gap-4 bg-background/30 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-lg">
      <Button onClick={onAddMemory} className="bg-indigo-600 hover:bg-indigo-700">
        Add Memory
      </Button>
      <Button 
        variant="outline" 
        className="border-white/20 text-white hover:bg-white/10"
        onClick={onViewMemories}
      >
        <ListIcon className="mr-2 h-4 w-4" />
        View Memories
      </Button>
    </div>
  );
};
