
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  specifyDays: boolean;
  setSpecifyDays: (value: boolean) => void;
  startDay: number;
  setStartDay: (day: number) => void;
  startMonth: number;
  setStartMonth: (month: number) => void;
  spanStartYear: number;
  setSpanStartYear: (year: number) => void;
  endDay: number;
  setEndDay: (day: number) => void;
  endMonth: number;
  setEndMonth: (month: number) => void;
  endYear: number;
  setEndYear: (year: number) => void;
  availableDays: number[];
  availableEndDays: number[];
  months: string[];
  years: number[];
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  specifyDays,
  setSpecifyDays,
  startDay,
  setStartDay,
  startMonth,
  setStartMonth,
  spanStartYear,
  setSpanStartYear,
  endDay,
  setEndDay,
  endMonth,
  setEndMonth,
  endYear,
  setEndYear,
  availableDays,
  availableEndDays,
  months,
  years
}) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Checkbox
          id="specifyDays"
          checked={specifyDays}
          onCheckedChange={(checked) => setSpecifyDays(!!checked)}
          className="border-input"
        />
        <Label htmlFor="specifyDays" className="text-sm">
          I want to specify exact days (not just months)
        </Label>
      </div>

      {/* Start Date */}
      <div className="grid gap-3">
        <label className="text-sm font-medium leading-none">Start Date</label>
        <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {specifyDays && (
            <select
              value={startDay}
              onChange={(e) => setStartDay(Number(e.target.value))}
              className="rounded-md border border-input bg-background/50 px-3 py-2"
            >
              {availableDays.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(Number(e.target.value))}
            className="rounded-md border border-input bg-background/50 px-3 py-2"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={spanStartYear}
            onChange={(e) => setSpanStartYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background/50 px-3 py-2"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* End Date */}
      <div className="grid gap-3">
        <label className="text-sm font-medium leading-none">End Date</label>
        <div className={`grid ${specifyDays ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
          {specifyDays && (
            <select
              value={endDay}
              onChange={(e) => setEndDay(Number(e.target.value))}
              className="rounded-md border border-input bg-background/50 px-3 py-2"
            >
              {availableEndDays.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          )}
          <select
            value={endMonth}
            onChange={(e) => setEndMonth(Number(e.target.value))}
            className="rounded-md border border-input bg-background/50 px-3 py-2"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            className="rounded-md border border-input bg-background/50 px-3 py-2"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default DateRangePicker;
