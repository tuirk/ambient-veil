
import React from "react";
import { Slider } from "@/components/ui/slider";

interface IntensitySliderProps {
  intensity: number;
  setIntensity: (intensity: number) => void;
}

const IntensitySlider: React.FC<IntensitySliderProps> = ({ intensity, setIntensity }) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium leading-none">
        Intensity: {intensity}
      </label>
      <Slider
        value={[intensity]}
        min={1}
        max={10}
        step={1}
        onValueChange={(value) => setIntensity(value[0])}
        className="mt-1"
      />
    </div>
  );
};

export default IntensitySlider;
