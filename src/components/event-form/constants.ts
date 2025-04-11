
export const MOOD_COLORS = [
  "#9b87f5", // Purple
  "#D946EF", // Magenta
  "#F97316", // Orange
  "#0EA5E9", // Blue
  "#ea384c", // Red
  "#16a34a", // Green
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
