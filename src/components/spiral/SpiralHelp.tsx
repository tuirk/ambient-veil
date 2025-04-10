
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface SpiralHelpProps {
  viewType: "annual" | "quarterly" | "current";
  currentYear: number;
}

export const SpiralHelp: React.FC<SpiralHelpProps> = ({ viewType, currentYear }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-4 left-4 bg-gray-800/50 hover:bg-gray-800/70 text-white rounded-full"
        onClick={() => setOpen(true)}
      >
        <HelpCircle />
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>How to Use the {viewType === 'annual' ? 'Annual' : viewType === 'quarterly' ? 'Quarterly' : 'Current Week'} Spiral</DialogTitle>
            <DialogDescription>
              {viewType === 'annual' && (
                <div className="space-y-4 py-4">
                  <p>The Annual Spiral visualizes your memories across multiple years:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Each complete spiral loop represents one year</li>
                    <li>The current year is {currentYear}</li>
                    <li>Vibrant points represent one-time events</li>
                    <li>Glowing trails represent ongoing processes or periods</li>
                    <li>Future events appear as floating objects in space</li>
                    <li>Click anywhere on the spiral to add a memory at that point in time</li>
                    <li>Use your mouse to rotate, zoom, and explore the spiral</li>
                  </ul>
                </div>
              )}
              
              {viewType === 'quarterly' && (
                <div className="space-y-4 py-4">
                  <p>The Quarterly Spiral visualizes your memories in more detail:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Each complete spiral loop represents one quarter (3 months)</li>
                    <li>Focusing on the current year ({currentYear})</li>
                    <li>Different colors represent different quarters/seasons</li>
                    <li>More detailed time positioning for precise memory placement</li>
                    <li>Click anywhere on the spiral to add a memory at that point in time</li>
                    <li>Use your mouse to rotate, zoom, and explore the spiral</li>
                  </ul>
                </div>
              )}
              
              {viewType === 'current' && (
                <div className="space-y-4 py-4">
                  <p>The Current Week Spiral visualizes your most recent memories:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Each complete spiral loop represents one day</li>
                    <li>Shows the current week, starting from the most recent Monday</li>
                    <li>Different colors represent different days of the week</li>
                    <li>The spiral grows in real-time as the week progresses</li>
                    <li>Click anywhere on the spiral to add a memory at that point in time</li>
                    <li>Use your mouse to rotate, zoom, and explore the spiral</li>
                    <li>The view automatically refreshes to show the latest events</li>
                  </ul>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
};
