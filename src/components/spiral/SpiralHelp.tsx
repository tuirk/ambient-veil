
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

interface SpiralHelpProps {
  viewType: "annual" | "quarterly" | "monthly" | "weekly";
  currentYear: number;
}

export const SpiralHelp: React.FC<SpiralHelpProps> = ({ viewType, currentYear }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Customize help content based on view type
  const getHelpContent = () => {
    switch (viewType) {
      case "quarterly":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Quarterly Spiral View</DialogTitle>
              <DialogDescription>
                Navigating Your Memories - Quarterly View
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                The <strong>Quarterly Spiral</strong> visualizes your memories from {currentYear}. 
                Each complete loop of the spiral represents one quarter (3 months).
              </p>
              <p>
                <strong>Colors:</strong> The spiral's colors change by quarter - blue for winter, 
                green for spring, gold for summer, and white-blue for fall.
              </p>
              <p>
                <strong>Navigation:</strong> Click and drag to rotate the spiral. Use the mouse wheel to zoom in/out.
              </p>
              <p>
                <strong>Adding Memories:</strong> Click anywhere on the spiral to add a memory at that time.
                Brighter points are higher intensity memories.
              </p>
              <p>
                <strong>Future Events:</strong> Events in the future appear as floating objects around the spiral.
              </p>
              <p>
                <strong>Process vs. One-time:</strong> One-time events appear as bright points, while ongoing processes
                appear as colored lines along the spiral.
              </p>
            </div>
          </>
        );
        
      case "monthly":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Monthly Spiral View</DialogTitle>
              <DialogDescription>
                Navigating Your Memories - Monthly View
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                The <strong>Monthly Spiral</strong> shows your memories with more detail. Each complete 
                loop represents one month, helping you see daily patterns.
              </p>
              <p>
                <strong>Colors:</strong> Each month has its own color scheme, making it easy to distinguish 
                between different months of the year.
              </p>
              <p>
                <strong>Day Markers:</strong> Days 1, 10, and 20 of each month are marked along the spiral.
                The first day of each month shows the month name.
              </p>
              <p>
                <strong>Navigation:</strong> Click and drag to rotate the spiral. Use the mouse wheel to zoom in/out.
              </p>
              <p>
                <strong>Adding Memories:</strong> Click anywhere on the spiral to add a memory at that time.
                Memories are positioned precisely by day within each month.
              </p>
              <p>
                <strong>Process vs. One-time:</strong> One-time events appear as bright points, while ongoing processes
                appear as colored lines that follow the daily progression.
              </p>
            </div>
          </>
        );
        
      case "weekly":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Weekly Spiral View</DialogTitle>
              <DialogDescription>
                Navigating Your Memories - Weekly View
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                The <strong>Weekly Spiral</strong> offers the highest resolution view of your recent memories. 
                Each complete loop represents one day, with seven loops forming a week.
              </p>
              <p>
                <strong>Colors:</strong> Each day of the week has its own color, making it easy to see 
                weekly patterns in your memories.
              </p>
              <p>
                <strong>Hour Markers:</strong> Key hours (0:00, 6:00, 12:00, 18:00) are marked along each day's coil.
                Midnight also shows the day name.
              </p>
              <p>
                <strong>Time Range:</strong> The spiral shows approximately the last 30 days of memories,
                with precise hourly positioning.
              </p>
              <p>
                <strong>Navigation:</strong> Click and drag to rotate the spiral. Use the mouse wheel to zoom in/out.
              </p>
              <p>
                <strong>Adding Memories:</strong> Click anywhere on the spiral to add a memory at that time.
                Memories are positioned by the exact hour they occurred.
              </p>
            </div>
          </>
        );
      
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Annual Spiral View</DialogTitle>
              <DialogDescription>
                Navigating Your Memories
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                The <strong>Memory Spiral</strong> visualizes your memories across time. Each complete 
                loop of the spiral represents one year.
              </p>
              <p>
                <strong>Colors:</strong> The spiral's colors change by season - blue for winter, 
                green for spring, gold for summer, and red for fall.
              </p>
              <p>
                <strong>Navigation:</strong> Click and drag to rotate the spiral. Use the mouse wheel to zoom in/out.
              </p>
              <p>
                <strong>Adding Memories:</strong> Click anywhere on the spiral to add a memory at that time.
                Brighter points are higher intensity memories.
              </p>
              <p>
                <strong>Future Events:</strong> Events in the future appear as floating objects around the spiral.
              </p>
              <p>
                <strong>Process vs. One-time:</strong> One-time events appear as bright points, while ongoing processes
                appear as colored lines along the spiral.
              </p>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4 bg-background/30 hover:bg-background/50 text-white"
        onClick={() => setIsOpen(true)}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          {getHelpContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};
