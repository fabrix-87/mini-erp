// lib/server/revalidate/index.ts

import {
  revalidateTag as nextRevalidateTag,
  revalidatePath as nextRevalidatePath,
} from "next/cache";
import { getRoute, type RouteKey } from "@/lib/navigation-routes";

// ============================================================================
// Types
// ============================================================================

type RevalidateTagProfile = string | { expire?: number };
type RevalidatePathType = "page" | "layout";

const DEFAULT_TAG_PROFILE: RevalidateTagProfile = "max";
const DEFAULT_PATH_TYPE: RevalidatePathType = "page";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Revalidate cache by tag
 *
 * @param tag - Cache tag to revalidate
 * @param profile - Revalidation tag profile (default: 'max')
 *
 * @example
 * revalidateTag('users-list');
 * revalidateTag('user-1', 'max');
 */
export function revalidateTag(
  tag: string,
  profile: RevalidateTagProfile = DEFAULT_TAG_PROFILE,
): void {
  nextRevalidateTag(tag, profile);
}

/**
 * Revalidate cache by path (Next.js 16 compatible)
 *
 * @param path - Path to revalidate
 * @param type - Revalidation path type (default: 'page')
 *
 * @example
 * revalidatePath('/users');
 * revalidatePath('/users/1', 'page');
 */
export function revalidatePath(path: string, type: RevalidatePathType = DEFAULT_PATH_TYPE): void {
  nextRevalidatePath(path, type);
}

/**
 * Revalidate multiple tags at once
 *
 * @param tags - Array of tags to revalidate
 * @param profile - Revalidation tag profile (default: 'max')
 *
 * @example
 * revalidateTags(['users-list', 'user-1', 'user-2']);
 */
export function revalidateTags(
  tags: string[],
  profile: RevalidateTagProfile = DEFAULT_TAG_PROFILE,
): void {
  tags.forEach((tag) => nextRevalidateTag(tag, profile));
}

/**
 * Revalidate multiple paths at once
 *
 * @param paths - Array of paths to revalidate
 * @param type - Revalidation path type (default: 'page')
 *
 * @example
 * revalidatePaths(['/users', '/users/1']);
 */
export function revalidatePaths(
  paths: string[],
  type: RevalidatePathType = DEFAULT_PATH_TYPE,
): void {
  paths.forEach((path) => nextRevalidatePath(path, type));
}

// ============================================================================
// Options type condiviso
// ============================================================================

interface RevalidateOptions {
  tagProfile?: RevalidateTagProfile;
  pathType?: RevalidatePathType;
  tagPrefix?: string;
  /**
   * RouteKey dalla navigation tree (e.g. "roles", "customers").
   * Se fornito, il path viene risolto tramite `getRoute(routeKey)`.
   * Ha precedenza su `pathRoot`.
   */
  routeKey?: RouteKey;
  /**
   * Override manuale del path root, usato solo se `routeKey` non è fornito.
   * @deprecated Preferire `routeKey` quando disponibile.
   */
  pathRoot?: string;
}

// ============================================================================
// Internal helper: resolve the base path
// ============================================================================

/**
 * Resolves the base path from options, prioritizing `routeKey` over `pathRoot`.
 *
 * @param entity - Entity name used as fallback (e.g. "user" → "/users")
 * @param options - Revalidation options
 * @param withId - Whether we're resolving a detail path
 */
function resolveBasePath(
  entity: string,
  options: RevalidateOptions | undefined,
  withId: boolean,
): string {
  if (options?.routeKey) {
    return getRoute(options.routeKey);
  }
  if (options?.pathRoot) {
    return `/${options.pathRoot}`;
  }
  // Fallback legacy: entity → pluralizza solo se stiamo cercando il path lista
  return withId ? `/${entity}s` : `/${entity}s`;
}

// ============================================================================
// Entity revalidators
// ============================================================================

/**
 * Revalidate a single entity (tag + path) or its list.
 *
 * @param entity - Entity name in singular (e.g. "role", "user")
 * @param id - Entity ID (omit to revalidate the list)
 * @param options - Revalidation options; use `routeKey` for type-safe path resolution
 *
 * @example
 * // List - path resolved from navigation tree
 * revalidateEntity("role", undefined, { routeKey: "roles" });
 *
 * // Detail
 * revalidateEntity("role", 1, { routeKey: "roles" });
 */
export function revalidateEntity(
  entity: string,
  id?: number | string,
  options?: RevalidateOptions,
): void {
  const tag = options?.tagPrefix ?? entity;
  const basePath = resolveBasePath(entity, options, id !== undefined);

  if (id !== undefined) {
    revalidateTag(`${tag}-${id}`, options?.tagProfile);
    revalidatePath(`${basePath}/${id}`, options?.pathType);
  } else {
    revalidateTag(`${tag}s-list`, options?.tagProfile);
    revalidatePath(basePath, options?.pathType);
  }
}

/**
 * Revalidate a single entity AND its list (tag + path for both).
 *
 * @param entity - Entity name in singular (e.g. "role", "user")
 * @param id - Entity ID
 * @param options - Revalidation options; use `routeKey` for type-safe path resolution
 *
 * @example
 * revalidateEntityWithList("role", 1, { routeKey: "roles" });
 */
export function revalidateEntityWithList(
  entity: string,
  id: number | string,
  options?: RevalidateOptions,
): void {
  const tag = options?.tagPrefix ?? entity;
  const basePath = resolveBasePath(entity, options, true);

  // Singolo
  revalidateTag(`${tag}-${id}`, options?.tagProfile);
  revalidatePath(`${basePath}/${id}`, options?.pathType);

  // Lista
  revalidateTag(`${tag}s-list`, options?.tagProfile);
  revalidatePath(basePath, options?.pathType);
}

// ============================================================================
// Exports
// ============================================================================

export {
  type RevalidateTagProfile,
  type RevalidatePathType,
  DEFAULT_TAG_PROFILE,
  DEFAULT_PATH_TYPE,
};

export * from "./entities";
