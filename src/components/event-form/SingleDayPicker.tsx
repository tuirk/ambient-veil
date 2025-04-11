
import React from "react";

interface SingleDayPickerProps {
  singleDay: number;
  setSingleDay: (day: number) => void;
  singleMonth: number;
  setSingleMonth: (month: number) => void;
  singleYear: number;
  setSingleYear: (year: number) => void;
  availableDays: number[];
  months: string[];
  years: number[];
}

const SingleDayPicker: React.FC<SingleDayPickerProps> = ({
  singleDay,
  setSingleDay,
  singleMonth,
  setSingleMonth,
  singleYear,
  setSingleYear,
  availableDays,
  months,
  years
}) => {
  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium leading-none">Date</label>
      <div className="grid grid-cols-3 gap-2">
        <select
          value={singleDay}
          onChange={(e) => setSingleDay(Number(e.target.value))}
          className="rounded-md border border-input bg-background/50 px-3 py-2"
        >
          {availableDays.map((day) => (
            <option key={day} value={day}>{day}</option>
          ))}
        </select>
        <select
          value={singleMonth}
          onChange={(e) => setSingleMonth(Number(e.target.value))}
          className="rounded-md border border-input bg-background/50 px-3 py-2"
        >
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>
        <select
          value={singleYear}
          onChange={(e) => setSingleYear(Number(e.target.value))}
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

export default SingleDayPicker;
