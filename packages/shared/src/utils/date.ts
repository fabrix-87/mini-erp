/**
 * Normalizes a given date or date string to midnight (00:00:00.000) in local time.
 *
 * @param {Date | string} date - The date to normalize.
 * @returns {Date} A new Date object set to midnight.
 */
export const normalizeToMidnight = (date: Date | string): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};
