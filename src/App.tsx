
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Spiral from "./pages/Spiral";
import MinimalSpiral from "./pages/MinimalSpiral";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {/* Move TooltipProvider inside the rendering tree, not wrapping everything */}
      <Toaster />
      <Sonner />
      <div className="min-h-screen w-full overflow-hidden relative">
        <div className="relative z-10 w-full h-screen">
          <BrowserRouter>
            {/* Apply TooltipProvider where it's actually used, not globally */}
            <TooltipProvider>
              <Routes>
                {/* Redirect from root to spiral page */}
                <Route path="/" element={<Navigate to="/spiral" replace />} />
                <Route path="/spiral" element={<Spiral />} />
                <Route path="/minimal" element={<MinimalSpiral />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
          </BrowserRouter>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default App;
