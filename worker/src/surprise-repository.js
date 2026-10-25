import { berlinDateKey, surpriseTypeForDate } from "./surprise-date.js";

/**
 * Fetch exactly today's message from D1. Never list future messages or accept
 * a date supplied by the browser. Call only after verifying admin identity.
 */
export async function getTodaySurprise(db, now = new Date()) {
  if (!db || typeof db.prepare !== "function") {
    throw new TypeError("A configured D1 binding is required");
  }
  const dateKey = berlinDateKey(now);
  const type = surpriseTypeForDate(dateKey);
  const result = await db.prepare(
    "SELECT surprise_date, message, surprise_type FROM daily_surprises WHERE surprise_date = ?1 LIMIT 1"
  ).bind(dateKey).first();

  if (!result) return { date: dateKey, type, available: false, message: null };
  return {
    date: dateKey,
    type,
    available: true,
    message: result.message,
  };
}
