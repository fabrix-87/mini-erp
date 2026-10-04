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
  NAVIGATION_TREE.flatMap((section) =>
    extractNavNodes(section.items).map(({ nameKey, href }) => [nameKey, href] as const),
  ),
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
 * Returns the creation route for a navigation entity, with optional query parameters.
 *
 * @param key - Navigation route key.
 * @param queryParams - Optional key-value object representing URL query parameters.
 * @returns Route path for the "new" page, appended with formatted query string if provided.
 * @throws Error when the route key is not mapped.
 */
export function getNewRoute(key: RouteKey, queryParams?: Record<string, string>): string {
  const baseRoute = ROUTE_MAP[key];

  if (!baseRoute) {
    throw new Error(`Missing route mapping for key: ${key}`);
  }

  const path = `${baseRoute}/new`;

  if (!queryParams || Object.keys(queryParams).length === 0) {
    return path;
  }

  // Filter out any undefined/empty string values if necessary
  const searchParams = new URLSearchParams();

  Object.entries(queryParams).forEach(([paramKey, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(paramKey, value);
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `${path}?${queryString}` : path;
}

interface NavNode {
  nameKey: string;
  href: string;
}

/**
 * Recursively extracts all nodes with nameKey and href from the navigation tree.
 *
 * @param items - Array of navigation items (may contain nested items)
 * @returns Flat array of nodes with nameKey and href
 */
function extractNavNodes(
  items: readonly {
    nameKey?: string;
    href?: string;
    items?: readonly unknown[];
  }[],
): NavNode[] {
  const nodes: NavNode[] = [];

  for (const item of items) {
    if (item.nameKey && item.href) {
      nodes.push({ nameKey: item.nameKey, href: item.href });
    }

    if (Array.isArray(item.items) && item.items.length > 0) {
      nodes.push(...extractNavNodes(item.items as typeof items));
    }
  }

  return nodes;
}
