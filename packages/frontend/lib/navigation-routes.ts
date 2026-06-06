// lib/navigation-routes.ts
import { NAVIGATION_TREE } from "./navigation-config";

// ============================================================================
// Type inference from NAVIGATION_TREE
// ============================================================================

/**
 * Extracts all nameKey values from the navigation tree as a union type.
 * e.g. "leads" | "customers" | "suppliers" | "contacts" | ...
 */
type NavTreeSection = (typeof NAVIGATION_TREE)[number];
type NavTreeItem = NavTreeSection["items"][number];
export type RouteKey = NavTreeItem["nameKey"];

/**
 * Static map of RouteKey → href, derived at module load time from NAVIGATION_TREE.
 * Used as the single source of truth for all programmatic navigation.
 */
const ROUTE_MAP = Object.fromEntries(
  NAVIGATION_TREE.flatMap((section) => section.items.map((item) => [item.nameKey, item.href])),
) as Record<RouteKey, string>;

// ============================================================================
// Route builders
// ============================================================================

/**
 * Returns the base href for a given route key.
 *
 * @param key - A nameKey from the navigation tree (e.g. "customers")
 * @returns The registered href (e.g. "/crm/customers")
 */
export function getRoute(key: RouteKey): string {
  return ROUTE_MAP[key];
}

/**
 * Returns the detail route for a given entity.
 *
 * @param key - A nameKey from the navigation tree
 * @param id - The entity identifier
 * @returns e.g. "/crm/customers/123"
 */
export function getDetailRoute(key: RouteKey, id: string | number): string {
  return `${ROUTE_MAP[key]}/${id}`;
}

/**
 * Returns the edit route for a given entity.
 *
 * @param key - A nameKey from the navigation tree
 * @param id - The entity identifier
 * @returns e.g. "/crm/customers/123/edit"
 */
export function getEditRoute(key: RouteKey, id: string | number): string {
  return `${ROUTE_MAP[key]}/${id}/edit`;
}

/**
 * Returns the "new entity" creation route.
 *
 * @param key - A nameKey from the navigation tree
 * @returns e.g. "/crm/customers/new"
 */
export function getNewRoute(key: RouteKey): string {
  return `${ROUTE_MAP[key]}/new`;
}
