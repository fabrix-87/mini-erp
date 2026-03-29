// hooks/use-breadcrumb.ts
"use client";

import { useSyncExternalStore, useEffect } from "react";
import { breadcrumbStore } from "@/lib/stores/breadcrumb-store";
import type { BreadcrumbItem } from "@/lib/stores/breadcrumb-store";

// ============================================================================
// Read hook — use in Breadcrumbs.tsx
// ============================================================================

/**
 * Returns the current breadcrumb items from the store.
 * Re-renders automatically when items change.
 */
export function useBreadcrumbItems(): BreadcrumbItem[] {
  const { items } = useSyncExternalStore(
    breadcrumbStore.subscribe,
    breadcrumbStore.getSnapshot,
    breadcrumbStore.getServerSnapshot,
  );
  return items;
}

// ============================================================================
// Write hook — use in BreadcrumbSetter
// ============================================================================

/**
 * Sets breadcrumb items for the current page.
 * Clears automatically on unmount.
 *
 * @param items - Ordered array of { label, href? }
 */
export function useBreadcrumbSetter(items: BreadcrumbItem[]): void {
  // Stable key to avoid re-running the effect on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    breadcrumbStore.setItems(items);
    return () => breadcrumbStore.clear();
    // JSON.stringify è il modo più semplice per confrontare array di oggetti
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items)]);
}
