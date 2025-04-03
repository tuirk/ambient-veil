
import React from "react";

interface EventLightProps {
  color: string;
  intensity: number;
  isProcessEvent?: boolean;
}

export const EventLight: React.FC<EventLightProps> = ({ 
  color, 
  intensity,
  isProcessEvent = false 
}) => {
  // Light intensity based on event type and intensity
  const lightIntensity = isProcessEvent 
    ? 0.4 + intensity * 0.15
    : 0.45 + intensity * 0.19;
  
  return (
    <pointLight 
      color={color} 
      intensity={lightIntensity}
      distance={3}
      decay={2}
    />
  );
};
