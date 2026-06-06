// hooks/use-breadcrumb.ts
"use client";

import { useSyncExternalStore, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { breadcrumbStore } from "@/lib/stores/breadcrumb-store";
import { BreadcrumbItem } from "@/types/breadcrumb-types";

// ============================================================================
// Read hook — use in Breadcrumbs.tsx
// ============================================================================

/**
 * Returns the current breadcrumb items from the store.
 * Re-renders automatically when items change.
 */
export function useBreadcrumbStoreData() {
  return useSyncExternalStore(
    breadcrumbStore.subscribe,
    breadcrumbStore.getSnapshot,
    breadcrumbStore.getServerSnapshot,
  );
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
  const pathname = usePathname();
  
  // Utilizziamo una ref per tracciare la stringa reale dei breadcrumb passati
  const itemsSerialized = JSON.stringify(items);
  const prevItemsRef = useRef(itemsSerialized);

  useEffect(() => {
    breadcrumbStore.setItems(items, pathname);
    prevItemsRef.current = itemsSerialized;

    return () => {
      breadcrumbStore.clear();
    };
    // Eseguiamo l'effetto solo se cambia il pathname o il contenuto reale dei breadcrumb
  }, [pathname, itemsSerialized]); 
}
