import { buildNavigationConfig } from "@/lib/navigation";
import { NavigationItem } from "@/types/navigation-types";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

/**
 * Recursively scans the navigation configuration tree to find an item matching the href.
 * * @param items - Array of navigation items to search through.
 * @param href - The exact target URL path to match.
 * @returns The matching NavigationItem object, or null if not found.
 */
export const findItemRecursive = (items: NavigationItem[], href: string): NavigationItem | null => {
  for (const item of items) {
    if (item.href === href) return item;
    if (item.items) {
      const found = findItemRecursive(item.items, href);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Hook that returns a memoized function to look up the localized name
 * for a given href within the navigation tree.
 *
 * @returns A stable `findPageTitle(href)` function bound to the current locale.
 */
export function useFindPageTitle(): (href: string) => string {
  const t  = useTranslations("nav");

  return useMemo(() => {
    const config = buildNavigationConfig(t);

    return (href: string): string => {
      for (const section of config) {
        const item = findItemRecursive(section.items, href);
        if (item) return item.name;
      }
      return "";
    };
  }, [t]);
}