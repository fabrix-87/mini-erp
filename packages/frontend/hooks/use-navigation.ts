// hooks/use-navigation.ts
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getRoute, getDetailRoute, getEditRoute, getNewRoute } from "@/lib/navigation-routes";
import type { RouteKey } from "@/lib/navigation-routes";

/**
 * Hook providing type-safe navigation helpers bound to the Next.js router.
 * All methods derive paths from NAVIGATION_TREE — no hardcoded strings.
 *
 * @returns Object with navigation helper functions.
 */
export function useNavigation() {
  const router = useRouter();

  const navigate = useCallback((key: RouteKey) => router.push(getRoute(key)), [router]);

  const navigateToDetail = useCallback(
    (key: RouteKey, id: string | number) => router.push(getDetailRoute(key, id)),
    [router],
  );

  const navigateToEdit = useCallback(
    (key: RouteKey, id: string | number) => router.push(getEditRoute(key, id)),
    [router],
  );

  const navigateToNew = useCallback((key: RouteKey) => router.push(getNewRoute(key)), [router]);

  /** Refreshes the current route without a full page reload (re-fetches server components). */
  const refresh = useCallback(() => router.refresh(), [router]);

  /** Goes back to the previous history entry. */
  const back = useCallback(() => router.back(), [router]);

  return {
    navigate,
    navigateToDetail,
    navigateToEdit,
    navigateToNew,
    refresh,
    back,
    // Esponi anche i builder puri per usarli in href= senza push
    getRoute,
    getDetailRoute,
    getEditRoute,
    getNewRoute,
  };
}
