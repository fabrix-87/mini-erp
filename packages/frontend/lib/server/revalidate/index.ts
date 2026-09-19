// lib/server/revalidate/index.ts

import {
  revalidateTag as nextRevalidateTag,
  revalidatePath as nextRevalidatePath,
} from "next/cache";
import { getRoute, type RouteKey } from "@/lib/navigation-routes";

// ============================================================================
// Types
// ============================================================================

type RevalidateTagProfile = Parameters<typeof nextRevalidateTag>[1];
type RevalidatePathType = Parameters<typeof nextRevalidatePath>[1];

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
  tags.forEach((tag) => revalidateTag(tag, profile));
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
  paths.forEach((path) => revalidatePath(path, type));
}

// ============================================================================
// Options type condiviso
// ============================================================================

interface RevalidateOptions {
  tagProfile?: RevalidateTagProfile;
  pathType?: RevalidatePathType;
  listTag?: string;
  detailTag?: string;
}

// ============================================================================
// Entity revalidators
// ============================================================================

/**
 * Revalidate a single entity (tag + path) or its list.
 *
 * @param routeKey - RouteKey from the navigation tree (e.g. "roles", "contacts")
 * @param id - Entity ID (omit to revalidate the list)
 * @param options - Revalidation options
 *
 * @example
 * revalidateEntity("contacts", id, {
 *   detailTag: CONTACT_TAGS.detail(id),
 * });
 *
 * revalidateEntity("contacts", undefined, {
 *   listTag: CONTACT_TAGS.list,
 * });
 */
export function revalidateEntity(
  routeKey: RouteKey,
  id?: number | string,
  options?: RevalidateOptions,
): void {
  const basePath = getRoute(routeKey);

  if (id !== undefined) {
    const detailTag = options?.detailTag ?? `${routeKey}-${id}`;

    revalidateTag(detailTag, options?.tagProfile);
    revalidatePath(`${basePath}/${id}`, options?.pathType);
  } else {
    const listTag = options?.listTag ?? `${routeKey}-list`;

    revalidateTag(listTag, options?.tagProfile);
    revalidatePath(basePath, options?.pathType);
  }
}

/**
 * Revalidate a single entity AND its list (tag + path for both).
 *
 * @param routeKey - RouteKey from the navigation tree (e.g. "roles", "contacts")
 * @param id - Entity ID
 * @param options - Revalidation options
 *
 * @example
 * revalidateEntityWithList("contacts", id, {
 *   detailTag: CONTACT_TAGS.detail(id),
 *   listTag: CONTACT_TAGS.list,
 * });
 */
export function revalidateEntityWithList(
  routeKey: RouteKey,
  id: number | string,
  options?: RevalidateOptions,
): void {
  const basePath = getRoute(routeKey);

  const detailTag = options?.detailTag ?? `${routeKey}-${id}`;

  const listTag = options?.listTag ?? `${routeKey}-list`;

  revalidateTag(detailTag, options?.tagProfile);
  revalidatePath(`${basePath}/${id}`, options?.pathType);

  revalidateTag(listTag, options?.tagProfile);
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
export * from "./opportunity-revalidate";
export * from "./activity-revalidate";
export * from "./lead-revalidate";
export * from "./user-revalidate";
export * from "./role-revalidate";
export * from "./contact-revalidate";
export * from "./company-revalidate";
