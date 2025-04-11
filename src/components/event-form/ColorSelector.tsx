
import React from "react";

interface ColorSelectorProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  colors: string[];
}

const ColorSelector: React.FC<ColorSelectorProps> = ({ 
  selectedColor, 
  setSelectedColor,
  colors
}) => {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium leading-none">Emotional Tone</label>
      <div className="flex flex-wrap gap-2 mt-1">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full transition-all ${
              selectedColor === color
                ? "ring-2 ring-white scale-110"
                : "opacity-70 hover:opacity-100"
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setSelectedColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
