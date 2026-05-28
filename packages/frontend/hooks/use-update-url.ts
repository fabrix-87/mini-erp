import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";

// ============================================================================
// Types
// ============================================================================

/** Scalar value accepted as a URL param */
export type URLParamScalar = string | number | boolean;

/** Full value accepted as a URL param — null/undefined removes the key */
export type URLParamValue = URLParamScalar | URLParamScalar[] | null | undefined;

/** Plain object shape for URL params */
export type URLParamsRecord = Record<string, URLParamValue>;

/** Anything that can represent current search params */
export type CompatibleParams = URLSearchParams | ReadonlyURLSearchParams | URLParamsRecord;

export interface UpdateURLOptions {
  /**
   * Use router.replace instead of router.push.
   * Prefer for filter/sort changes that should not pollute browser history.
   * Default: false
   */
  replace?: boolean;

  /**
   * Scroll to top after navigation.
   * Default: false
   */
  scroll?: boolean;

  /**
   * Reset the page param when other params change.
   * Useful for data tables: changing filters should go back to page 1.
   * Default: false
   */
  resetPage?: boolean;

  /**
   * Name of the page param to reset.
   * Default: "page"
   */
  pageParam?: string;
}

// ============================================================================
// Internal utilities
// ============================================================================

/**
 * Converts any CompatibleParams to a Map<string, string[]>,
 * correctly preserving multi-value keys (e.g. tags=a&tags=b).
 *
 * NOTE: Object.fromEntries(sp.entries()) silently drops duplicate keys —
 * only the last value per key survives. Fix: use URLSearchParams.getAll().
 */
function paramsToMultiMap(params: CompatibleParams): Map<string, string[]> {
  const map = new Map<string, string[]>();

  if (
    params instanceof URLSearchParams ||
    (params != null && "getAll" in params && typeof params.getAll === "function")
  ) {
    const sp = params as URLSearchParams;
    sp.forEach((_, key) => {
      if (!map.has(key)) {
        map.set(key, sp.getAll(key));
      }
    });
    return map;
  }

  // Plain object
  for (const [key, value] of Object.entries(params as URLParamsRecord)) {
    const values = normalizeToStrings(value);
    if (values.length > 0) {
      map.set(key, values);
    }
  }
  return map;
}

/**
 * Converts a URLParamValue to a string array,
 * filtering out null/undefined/empty-string.
 * Returns [] when the value should be removed from the URL.
 */
function normalizeToStrings(value: URLParamValue): string[] {
  if (value == null || value === "") return [];

  if (Array.isArray(value)) {
    return value.filter((v): v is URLParamScalar => v != null && v !== "").map(String);
  }

  return [String(value)];
}

/**
 * Appends a key+value to URLSearchParams, handling arrays and removal.
 */
function applyParam(target: URLSearchParams, key: string, value: URLParamValue): void {
  const strings = normalizeToStrings(value);
  strings.forEach((v) => target.append(key, v));
}

// ============================================================================
// Public pure functions
// ============================================================================

/**
 * Merges current params with partial updates, returning a new query string.
 *
 * - Keys present in `updates` with a non-empty value replace current values.
 * - Keys present in `updates` with null/undefined/'' are REMOVED from the result.
 * - Array values produce repeated params: { tags: ['a','b'] } → tags=a&tags=b
 * - Keys in `current` not mentioned in `updates` are kept as-is.
 */
export function mergeSearchParams<T extends URLParamsRecord>(
  current: CompatibleParams,
  updates: Partial<T>,
): string {
  const result = new URLSearchParams();
  const currentMap = paramsToMultiMap(current);

  // 1. Carry over current params that are not being updated
  for (const [key, values] of currentMap) {
    if (key in updates) continue;
    values.forEach((v) => result.append(key, v));
  }

  // 2. Apply updates (null/undefined/'' removes the key)
  for (const [key, value] of Object.entries(updates)) {
    applyParam(result, key, value);
  }

  return result.toString();
}

/**
 * Builds a query string from a params object, omitting empty values.
 */
export function buildSearchParams(params: CompatibleParams): string {
  return mergeSearchParams({}, params as URLParamsRecord);
}

// ============================================================================
// Hook — overloads
// ============================================================================

/**
 * Overload A — basePath provided at hook call site.
 * The returned function does NOT require a path argument.
 *
 * @example
 * const updateURL = useUpdateURL('/customers');
 * updateURL({ search: 'acme' }, { replace: true });
 * updateURL({ page: 3 });
 */
export function useUpdateURL(
  basePath: string,
): (updates: URLParamsRecord, options?: UpdateURLOptions) => void;

/**
 * Overload B — no basePath. Path is passed at each call site.
 *
 * @example
 * const updateURL = useUpdateURL();
 * updateURL('/customers', { search: 'acme' }, { replace: true });
 * updateURL('/orders',    { status: 'PENDING' });
 */
export function useUpdateURL(): (
  path: string,
  updates: URLParamsRecord,
  options?: UpdateURLOptions,
) => void;

// ============================================================================
// Hook — implementation
// ============================================================================

export function useUpdateURL(basePath?: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useCallback(
    (
      pathOrUpdates: string | URLParamsRecord,
      updatesOrOptions?: URLParamsRecord | UpdateURLOptions,
      maybeOptions?: UpdateURLOptions,
    ): void => {
      // -- Resolve overloaded arguments -----------------------------------
      let path: string;
      let updates: URLParamsRecord;
      let options: UpdateURLOptions;

      if (basePath !== undefined) {
        // useUpdateURL('/customers') — path fixed at hook level
        path = basePath;
        updates = (pathOrUpdates as URLParamsRecord) ?? {};
        options = (updatesOrOptions as UpdateURLOptions) ?? {};
      } else {
        // useUpdateURL() — path passed per call
        path = pathOrUpdates as string;
        updates = (updatesOrOptions as URLParamsRecord) ?? {};
        options = maybeOptions ?? {};
      }

      // -- Navigation logic -----------------------------------------------
      const { replace = false, scroll = false, resetPage = false, pageParam = "page" } = options;

      const finalUpdates: URLParamsRecord =
        resetPage && !(pageParam in updates) ? { ...updates, [pageParam]: null } : updates;

      const qs = mergeSearchParams(searchParams, finalUpdates);
      const targetUrl = qs ? `${path}?${qs}` : path;

      if (replace) {
        router.replace(targetUrl, { scroll });
      } else {
        router.push(targetUrl, { scroll });
      }
    },
    [router, searchParams, basePath],
  );
}
