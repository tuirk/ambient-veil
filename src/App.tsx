
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Spiral from "./pages/Spiral";
import NotFound from "./pages/NotFound";

const App = () => {
  // Create a QueryClient instance
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <div className="min-h-screen w-full overflow-hidden relative">
        <div className="relative z-10 w-full h-screen">
          <BrowserRouter>
            <TooltipProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/spiral" element={<Spiral />} />
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
