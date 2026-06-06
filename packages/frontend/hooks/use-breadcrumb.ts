// hooks/use-breadcrumb.ts
"use client";

import { useSyncExternalStore, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { breadcrumbStore } from "@/lib/stores/breadcrumb-store";
import { BreadcrumbItem } from "@/types/breadcrumb-types";
import { useTranslations } from "next-intl";
import { NAVIGATION_TREE } from "@/lib/navigation-config";

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

/**
 * Returns a localized dictionary of action segment labels (new, edit, view…).
 * Keys are URL segments, values are translated strings.
 *
 * @returns Record mapping action segments to their localized label.
 */
export function useActionLabels(): Record<string, string> {
  const t = useTranslations("nav");

  return useMemo(() => ({
    new:      t("activities_new").split(" ").at(-1) ?? "Nuovo", // fallback se la chiave cambia
    edit:     t("action_edit"),
    create:   t("action_create"),
    update:   t("action_update"),
    view:     t("action_view"),
    calendar: t("activities_calendar"),
    stats:    t("action_stats"),
    settings: t("action_settings"),
    profile:  t("action_profile"),
    general:  t("action_general"),
  }), [t]);
}

/**
 * Derives a localized dictionary of entity segment labels from the NAVIGATION_TREE.
 * Keys are the last URL segment of each nav item's href, values are translated singular labels.
 *
 * @returns Record mapping entity URL segments to their localized singular label.
 */
export function useEntityLabels(): Record<string, string> {
  const t = useTranslations("nav");

  return useMemo(() => {
    const map: Record<string, string> = {};

    for (const section of NAVIGATION_TREE) {
      for (const item of section.items) {
        // Extract the last segment of the href as the key (e.g. "customers" from "/crm/customers")
        const segment = item.href.split("/").filter(Boolean).at(-1);
        if (segment && "nameKey" in item) {
          map[segment] = t(item.nameKey as Parameters<typeof t>[0]);
        }
      }
    }

    return map;
  }, [t]);
}

/**
 * Derives localized BreadcrumbItem constants from the NAVIGATION_TREE.
 * Replaces static CRUMB_* constants with a single dynamic lookup hook.
 *
 * @returns A function `getCrumb(segment)` that returns { label, href } for a nav segment.
 */
export function useCrumbMap(): Record<string, { label: string; href: string }> {
  const t = useTranslations("nav");

  return useMemo(() => {
    const map: Record<string, { label: string; href: string }> = {
      root: { label: t("dashboard"), href: "/dashboard" },
    };

    for (const section of NAVIGATION_TREE) {
      for (const item of section.items) {
        const segment = item.href.split("/").filter(Boolean).at(-1);
        if (segment && "nameKey" in item) {
          map[segment] = {
            label: t(item.nameKey as Parameters<typeof t>[0]),
            href: item.href,
          };
        }
      }
    }

    return map;
  }, [t]);
}