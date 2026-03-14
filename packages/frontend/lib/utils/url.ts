// packages/frontend/lib/utils/url.ts

/**
 * Builds a URLSearchParams string from a params object,
 * omitting undefined, null, and empty string values.
 */
export function buildSearchParams(params: Record<string, unknown>): string {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      urlParams.set(key, String(value));
    }
  });

  return urlParams.toString();
}

/**
 * Merges current params with new partial params and returns
 * the resulting query string. Useful for URL-driven filtering/sorting.
 */
export function mergeSearchParams<T extends Record<string, unknown>>(
  current: T,
  updates: Partial<T>
): string {
  return buildSearchParams({ ...current, ...updates });
}
