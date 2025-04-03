
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HelpCircleIcon } from "lucide-react";

interface SpiralHelpButtonProps {
  currentYear: number;
}

export const SpiralHelpButton: React.FC<SpiralHelpButtonProps> = ({ currentYear }) => {
  const [showHelp, setShowHelp] = useState(false);
  const minYear = currentYear - 5;
  
  return (
    <>
      <Button 
        variant="outline" 
        size="icon"
        className="absolute top-4 left-4 bg-background/30 backdrop-blur-sm border-white/10 hover:bg-white/10"
        onClick={() => setShowHelp(true)}
      >
        <HelpCircleIcon className="h-5 w-5" />
      </Button>
      
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>About the Time Spiral</DialogTitle>
            <DialogDescription>
              <div className="space-y-4 mt-4">
                <p>
                  The Time Spiral visualizes your memories as a journey through time, 
                  spiraling from the past into the future.
                </p>
                <p>
                  <strong>Adding memories:</strong> Click anywhere on the spiral to add a memory 
                  at that point in time. You can only add memories between {minYear} and {currentYear + 1}.
                </p>
                <p>
                  <strong>Viewing memories:</strong> Click on any glowing point to see details about 
                  that memory. You can also view all memories by clicking "View Memories" in the menu.
                </p>
                <p>
                  <strong>Time perception:</strong> The spiral design represents how our perception of time
                  changes - more recent memories feel more spread out, while distant memories condense.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Created with ❤️ using React Three Fiber and cosmic inspiration.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
