const BERLIN_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function berlinDateKey(date = new Date()) {
  const parts = Object.fromEntries(
    BERLIN_DATE.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

/**
 * Returns the priority category for a date key (YYYY-MM-DD).
 * The database should return only the row for this exact key.
 * Anniversary takes precedence over the monthly 16th surprise.
 */
export function surpriseTypeForDate(dateKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    throw new TypeError("dateKey must be YYYY-MM-DD");
  }
  const [, month, day] = dateKey.split("-");
  if (month === "02" && day === "16") return "anniversary";
  if (month === "10" && day === "30") return "birthday";
  if (month === "12" && day === "24") return "christmas";
  if (day === "16") return "monthly";
  return "daily";
}
