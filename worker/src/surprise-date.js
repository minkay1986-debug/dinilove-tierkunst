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

export function isValidDateKey(dateKey) {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false;
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === dateKey;
}

/**
 * Priority for a given Berlin calendar date.
 * Anniversary outranks monthly surprise; birthday and Christmas also outrank
 * the monthly surprise if they ever coincide.
 */
export function surpriseTypeForDate(dateKey) {
  if (!isValidDateKey(dateKey)) throw new TypeError("dateKey must be a valid YYYY-MM-DD date");
  const [, month, day] = dateKey.split("-");
  if (month === "02" && day === "16") return "anniversary";
  if (month === "10" && day === "30") return "birthday";
  if (month === "12" && day === "24") return "christmas";
  if (day === "16") return "monthly";
  return "daily";
}
