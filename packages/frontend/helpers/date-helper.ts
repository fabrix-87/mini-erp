import { format, startOfMonth, endOfMonth } from "date-fns";

// Helper per formattare la data senza problemi di timezone
export function formatDateForUrl(date: Date): string {
  // Usa format locale invece di toISOString()
  // Formato: YYYY-MM-DD
  return format(date, "yyyy-MM-dd");
}

// Helper per confrontare solo le date (ignorando l'orario)
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Converts a Date, ISO string, or null/undefined to an HTML date input
 * value string in the format "YYYY-MM-DD".
 *
 * Returns an empty string when the value is absent, which is the correct
 * controlled-input default for <input type="date" />.
 *
 * @param val - Date, ISO string, null or undefined
 * @returns "YYYY-MM-DD" string or ""
 */
export function toDateInput(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

/**
 * Formats a Date or ISO string for display in the specified locale.
 * Returns "—" when the value is absent.
 *
 * @param val - Date, ISO string, null or undefined
 * @param locale - The locale to use for formatting (e.g., "it-IT", "en-US")
 * @returns Formatted date string or "—"
 */
export function formatDate(val: Date | string | null | undefined, locale: string): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a Date or ISO string for display in the Italian locale.
 * Returns "—" when the value is absent.
 *
 * @param val - Date, ISO string, null or undefined
 * @returns Formatted date string (e.g. "29 marzo 2026") or "—"
 */
export function formatDateIT(val: Date | string | null | undefined): string {
  return formatDate(val, "it-IT");
}

/**
 * Returns the number of full days elapsed since a given date.
 *
 * @param val - Date or ISO string
 * @returns Number of days (always >= 0)
 */
export function daysSince(val: Date | string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(val).getTime()) / (1000 * 60 * 60 * 24)));
}
