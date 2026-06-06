// lib/navigation.ts
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Settings,
  LogOut,
  Search,
  Bell,
  Moon,
  Sun,
  Menu,
  SunMoon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NavigationItem, NavigationSection } from "@/types/navigation-types";
import { NAVIGATION_TREE } from "./navigation-config";

// ============================================================================
// Configuration Factory
// ============================================================================

/**
 * Resolves translated strings over the static navigation tree.
 *
 * @param t - Translator function from `useTranslations("nav")`
 * @returns Full NavigationSection[] with localized strings
 */
export function buildNavigationConfig(
  t: ReturnType<typeof useTranslations<"nav">>,
): NavigationSection[] {
  return NAVIGATION_TREE.map((section) => ({
    title: t(section.titleKey),
    path: section.path,
    items: section.items.map((item) => ({
      ...item,
      name: t(item.nameKey),
      description: "descKey" in item ? t(item.descKey) : undefined,
      items: "items" in item
        ? item.items.map((sub) => ({ ...sub, name: t(sub.nameKey) }))
        : undefined,
    })),
  }));
}

// ============================================================================
// RBAC Core Logic Helpers
// ============================================================================

/**
 * Recursively filters navigation items matching the allowed user roles.
 *
 * @param items - Tree array of navigation targets.
 * @param userRoleCodes - Set containing the active user's authorized role codes.
 * @returns Filtered hierarchy array compliant with security constraints.
 */
function filterItemsByRoles(items: NavigationItem[], userRoleCodes: Set<string>): NavigationItem[] {
  return items
    .filter((item) => !item.roles || item.roles.some((role) => userRoleCodes.has(role)))
    .map((item) =>
      item.items?.length ? { ...item, items: filterItemsByRoles(item.items, userRoleCodes) } : item,
    );
}

// ============================================================================
// Public Hooks & Utilities
// ============================================================================

/**
 * Custom hook providing a role-filtered, localized navigation structure.
 * Combines RBAC filtering with next-intl translations, memoized for performance.
 *
 * @returns Secured and localized NavigationSection[] matching user credentials.
 */
export function useFilteredNavigation(): NavigationSection[] {
  const { user } = useAuth();
  const t = useTranslations("nav");

  return useMemo(() => {
    const userRoleCodes = new Set<string>(user?.roles?.map((r: { code: string }) => r.code) ?? []);

    const config = buildNavigationConfig(t);

    return config
      .map((section) => ({ ...section, items: filterItemsByRoles(section.items, userRoleCodes) }))
      .filter((section) => section.items.length > 0);
  }, [user?.roles, t]);
}

/**
 * Determines if a specific link matches exactly the active browser path.
 */
export function isActiveLink(currentPath: string, href: string): boolean {
  return currentPath === href;
}

/**
 * Verifies if a sidebar section is the active prefix layout.
 */
export function isActiveSection(currentPath: string, sectionPath: string): boolean {
  if (sectionPath === "/dashboard") return currentPath === sectionPath;
  return currentPath === sectionPath || currentPath.startsWith(`${sectionPath}/`);
}

/**
 * Checks if any child node under a collapsible route is currently selected.
 */
export function hasActiveSubItem(currentPath: string, items?: NavigationItem[]): boolean {
  if (!items || items.length === 0) return false;
  return items.some((subItem) => currentPath === subItem.href);
}

/** Bundled iconography for the global navigation toolbar. */
export const headerIcons = { Menu, Search, Sun, Moon, Bell, Settings, LogOut, SunMoon };
