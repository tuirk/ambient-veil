
import { useState, useEffect } from "react";
import { SpiralConfig } from "@/types/event";
import { saveConfig, getConfig } from "@/utils/storage";

/**
 * Hook to manage spiral configuration state
 */
export function useSpiralConfig() {
  const currentYear = new Date().getFullYear();
  
  const [config, setConfig] = useState<SpiralConfig>({
    startYear: currentYear - 5, // Fixed to current year - 5
    currentYear: currentYear,
    zoom: 1,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  });
  
  // Load config from localStorage
  useEffect(() => {
    const savedConfig = getConfig();
    
    // Always set startYear to 5 years before current year
    const fixedConfig = {
      ...savedConfig,
      startYear: currentYear - 5
    };
    
    setConfig(fixedConfig);
    saveConfig(fixedConfig); // Save the fixed config
  }, [currentYear]);

  return { config, setConfig };
}
