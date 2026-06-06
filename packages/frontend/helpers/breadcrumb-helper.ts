import { navigationConfig, NavigationItem } from "@/lib/navigation";

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
 * Traverses the global navigation config to extract a localized name for a specific path.
 * * @param href - The URL path to search for in the sidebar configuration.
 * @returns The localized configuration name string, or an empty string if unmatched.
 */
export const findPageTitle = (href: string): string => {
  for (const section of navigationConfig) {
    const item = findItemRecursive(section.items, href);
    if (item) return item.name;
  }
  return "";
};