
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SeasonPickerProps {
  season: string;
  setSeason: (season: string) => void;
  seasonYear: number;
  setSeasonYear: (year: number) => void;
  seasons: string[];
  years: number[];
}

const SeasonPicker: React.FC<SeasonPickerProps> = ({
  season,
  setSeason,
  seasonYear,
  setSeasonYear,
  seasons,
  years
}) => {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium leading-none">Season & Year</label>
      <div className="grid grid-cols-2 gap-2">
        <Select 
          value={season} 
          onValueChange={(value) => setSeason(value)}
        >
          <SelectTrigger className="bg-background/50">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <select
          value={seasonYear}
          onChange={(e) => setSeasonYear(Number(e.target.value))}
          className="rounded-md border border-input bg-background/50 px-3 py-2"
        >
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SeasonPicker;
