/**
 * Date utilities that respect the app's calendar timezone.
 *
 * Why: Dates like "today", "this Monday", or a check-in date are calendar concepts
 * tied to where the users are, not UTC. We standardise on America/Los_Angeles
 * (Seattle / PT) so coach and clients always agree on the same calendar day,
 * regardless of where they open the app.
 *
 * Database storage: dates are stored as DATE columns (YYYY-MM-DD strings) without
 * any zone info. These helpers translate "now" → that string in the app timezone,
 * and parse a stored YYYY-MM-DD back to a Date that displays as the same calendar
 * day in any local timezone.
 */

/** App-wide calendar timezone. Change here if the user base shifts. */
export const APP_TIMEZONE = "America/Los_Angeles";

/**
 * Get today's date in the app timezone as a YYYY-MM-DD string.
 * Use this for any "today" calculation that hits the DB or compares to stored dates.
 */
export function getTodayLocal(): string {
  return formatDateInZone(new Date(), APP_TIMEZONE);
}

/**
 * Format any Date or YYYY-MM-DD string as a YYYY-MM-DD date string in the app timezone.
 */
export function formatDateInZone(date: Date | string, zone: string = APP_TIMEZONE): string {
  const d = typeof date === "string" ? parseDateLocal(date) : date;
  // en-CA locale → "YYYY-MM-DD" format
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Parse a YYYY-MM-DD string into a Date that represents that calendar day's
 * midnight in the local browser timezone. This avoids the "off by one day" issue
 * where new Date("2026-06-16") parses as UTC midnight and shifts back in PT.
 *
 * Use this whenever you have a date-only string from the DB that you want to
 * display or do calendar math on.
 */
export function parseDateLocal(dateStr: string | Date): Date {
  if (dateStr instanceof Date) return dateStr;
  // Date-only string? Append local midnight so it parses in local zone, not UTC.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T00:00:00`);
  }
  return new Date(dateStr);
}

/**
 * Get the YYYY-MM-DD of the most recent Monday on or before today, in the app timezone.
 * Used for "submitted this week" checks.
 */
export function getMondayOfThisWeek(): string {
  const todayStr = getTodayLocal();
  const today = parseDateLocal(todayStr);
  const day = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diff);
  // Format back through the zone helper to be safe near DST boundaries
  return formatDateInZone(monday, APP_TIMEZONE);
}

/**
 * Format a date for display: "Jun 16, 2026".
 * Treats date-only strings as the calendar day they represent (no timezone shift).
 */
export function formatDateForDisplay(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? parseDateLocal(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts,
  }).format(d);
}

/**
 * Format a check-in / log entry as relative + absolute: "Today", "Yesterday", or "Mon, Jun 16".
 */
export function formatCheckInDate(date: string | Date): string {
  const d = typeof date === "string" ? parseDateLocal(date) : date;
  const dStr = formatDateInZone(d);
  const today = getTodayLocal();
  if (dStr === today) return "Today";
  // Yesterday
  const yesterday = parseDateLocal(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dStr === formatDateInZone(yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}
