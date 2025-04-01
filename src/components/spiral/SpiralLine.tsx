
import React from "react";
import { TubularSpiral } from "./TubularSpiral";

interface SpiralLineProps {
  startYear: number;
  currentYear: number;
  zoom: number;
}

export const SpiralLine: React.FC<SpiralLineProps> = ({
  startYear,
  currentYear,
  zoom
}) => {
  return (
    <TubularSpiral
      startYear={startYear}
      currentYear={currentYear}
      zoom={zoom}
    />
  );
};
