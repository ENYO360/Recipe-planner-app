// src/utils/dateHelpers.js

// Returns an array of 7 date strings for the current week (Mon–Sun)
export function getCurrentWeekDates() {
  const today = new Date();
  const day   = today.getDay(); // 0 = Sunday, 1 = Monday ...

  // Find this week's Monday
  // If today is Sunday (0), go back 6 days to Monday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  // Build array of 7 dates from Monday
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return formatDateKey(date);
  });
}

// Format a Date object to a "YYYY-MM-DD" string (our dateKey format)
export function formatDateKey(date) {
  return date.toISOString().split("T")[0];
}

// Format "2024-03-11" → "Monday, March 11"
export function formatDisplayDate(dateKey) {
  const date = new Date(dateKey + "T12:00:00"); // noon avoids timezone issues
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month:   "long",
    day:     "numeric",
  });
}

// Format "2024-03-11" → { day: "Mon", date: "11" }
export function formatShortDate(dateKey) {
  const date = new Date(dateKey + "T12:00:00");
  return {
    day:  date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.getDate().toString(),
  };
}

// Check if a dateKey matches today
export function isToday(dateKey) {
  return dateKey === formatDateKey(new Date());
}

// "2024-03-11" → "Week of March 11"
export function formatWeekLabel(weekDates) {
  const first = new Date(weekDates[0] + "T12:00:00");
  return "Week of " + first.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}