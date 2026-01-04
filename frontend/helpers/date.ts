
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