export const MOOD_COLORS = [
  "#8B5CF6", // Vivid Purple
  "#D946EF", // Bright Magenta
  "#F97316", // Bright Orange
  "#0EA5E9", // Ocean Blue
  "#ea384c", // Bright Red
  "#16a34a", // Forest Green
];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export const daysInMonth = (month: number, year: number): number => {
  return new Date(year, month + 1, 0).getDate();
};
