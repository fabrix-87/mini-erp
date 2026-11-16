const TIME_UNITS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
} as const;

/**
 * Safely converts a time string into milliseconds.
 * Returns the fallback when the input is invalid or non-positive.
 *
 * Supported units: ms, s, m, h, d, w.
 * @example safeMs("15m", 900_000) // 900000
 */
export const safeMs = (timeString: string, fallback: number): number => {
  const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d|w)$/i.exec(timeString.trim());

  if (!match) {
    console.warn(`Invalid time value '${timeString}'. Using fallback: ${fallback}ms`);
    return fallback;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase() as keyof typeof TIME_UNITS;
  const result = Math.round(value * TIME_UNITS[unit]);

  if (!Number.isSafeInteger(result) || result <= 0) {
    console.warn(`Invalid time value '${timeString}'. Using fallback: ${fallback}ms`);
    return fallback;
  }

  return result;
};
