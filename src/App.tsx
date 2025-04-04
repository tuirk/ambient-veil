
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Spiral from "./pages/Spiral";
import QuarterlySpiral from "./pages/QuarterlySpiral";
import NotFound from "./pages/NotFound";

// Background wrapper component that only shows on specific routes
const BackgroundManager = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Determine if we need the full cosmic background
  const needsBackground = location.pathname === "/" || 
                          location.pathname === "/spiral" || 
                          location.pathname === "/quarterly";
  
  return (
    <div className={`min-h-screen w-full overflow-hidden relative ${needsBackground ? 'cosmic-background' : ''}`}>
      {needsBackground && (
        <div className="deep-space-bg">
          <div className="background-image"></div>
        </div>
      )}
      <div className="relative z-10 w-full h-screen">
        {children}
      </div>
    </div>
  );
};

const App = () => {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TooltipProvider>
          <BackgroundManager>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/spiral" element={<Spiral />} />
              <Route path="/quarterly" element={<QuarterlySpiral />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BackgroundManager>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
