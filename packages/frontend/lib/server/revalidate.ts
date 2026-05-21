// lib/server/revalidate.ts
// Helper utilities for Next.js 16 revalidation API

import {
  revalidateTag as nextRevalidateTag,
  revalidatePath as nextRevalidatePath,
} from "next/cache";

// ============================================================================
// Types
// ============================================================================

/**
 * Next.js revalidation profile for revalidateTag
 */
type RevalidateTagProfile = string | { expire?: number };

/**
 * Next.js revalidation type for revalidatePath
 */
type RevalidatePathType = "page" | "layout";

// ============================================================================
// Default Profile
// ============================================================================

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

/**
 * Revalidate entity (tag + path)
 *
 * @param entity - Entity name (e.g., 'user', 'product')
 * @param id - Entity ID (optional)
 * @param options { tagProfile, pathType } - Revalidation options ({default: 'max', default: 'page'})
 *
 * @example
 * // Revalidate all users
 * revalidateEntity('users');
 *
 * // Revalidate specific user
 * revalidateEntity('user', 1);
 */
export function revalidateEntity(
  entity: string,
  id?: number | string,
  options?: {
    tagProfile?: RevalidateTagProfile;
    pathType?: RevalidatePathType;
    tagPrefix?: string;
    pathRoot?: string;
  },
): void {
  const tag = options?.tagPrefix ?? entity;
  const pathRoot = options?.pathRoot ?? (id !== undefined ? `${entity}s` : entity);

  if (id !== undefined) {
    revalidateTag(`${tag}-${id}`, options?.tagProfile);
    revalidatePath(`/${pathRoot}/${id}`, options?.pathType);
  } else {
    revalidateTag(`${tag}s-list`, options?.tagProfile);
    revalidatePath(`/${pathRoot}`, options?.pathType);
  }
}

/**
 * Revalidate entity and its list
 *
 * @param entity - Entity name (e.g., 'user', 'product')
 * @param id - Entity ID
 * @param options { tagProfile, pathType } - Revalidation options ({default: 'max', default: 'page'})
 *
 * @example
 * // After updating user 1, revalidate both the user and the users list
 * revalidateEntityWithList('user', 1);
 */
export function revalidateEntityWithList(
  entity: string,
  id: number | string,
  options?: {
    tagProfile?: RevalidateTagProfile;
    pathType?: RevalidatePathType;
    tagPrefix?: string;
    /** Override path root, e.g. 'settings/users' instead of 'users' */
    pathRoot?: string;
  },
): void {
  const tag = options?.tagPrefix ?? entity;
  const pathRoot = options?.pathRoot ?? `${entity}s`;

  revalidateTag(`${tag}-${id}`, options?.tagProfile);
  revalidatePath(`/${pathRoot}/${id}`, options?.pathType);

  revalidateTag(`${tag}s-list`, options?.tagProfile);
  revalidatePath(`/${pathRoot}`, options?.pathType);
}

// ============================================================================
// Common Entity Revalidators
// ============================================================================

/**
 * Revalidate user-related cache
 */
export const userRevalidation = {
  /** Revalidate specific user detail and path */
  user: (id: number) => revalidateEntity("user", id, { pathRoot: "settings/users" }),

  /** Revalidate users list */
  list: () => revalidateEntity("users", undefined, { pathRoot: "settings/users" }),

  /** Revalidate specific user + list */
  userWithList: (id: number) =>
    revalidateEntityWithList("user", id, {
      tagPrefix: "user",
      pathRoot: "settings/users",
    }),

  /** Revalidate user profile (no path needed) */
  profile: () => revalidateTag("user-profile"),
};

/**
 * Revalidate product-related cache
 */
export const productRevalidation = {
  product: (id: number) => revalidateEntity("product", id),
  list: () => revalidateEntity("products"),
  productWithList: (id: number) => revalidateEntityWithList("product", id),
};

/**
 * Revalidate document-related cache
 */
export const documentRevalidation = {
  document: (id: number) => revalidateEntity("document", id),
  list: () => revalidateEntity("documents"),
  documentWithList: (id: number) => revalidateEntityWithList("document", id),
};

/**
 * Revalidate customer-related cache
 */
export const customerRevalidation = {
  customer: (id: number) => revalidateEntity("customer", id),
  list: () => revalidateEntity("customer"),
  customerWithList: (id: number) => revalidateEntityWithList("customer", id),
};

/**
 * Revalidate role-related cache
 */
export const roleRevalidation = {
  /** Revalidate specific role and roles list */
  role: (id: number) =>
    revalidateEntityWithList("role", id, {
      tagPrefix: "role",
      pathRoot: "settings/roles",
    }),

  /** Revalidate roles list only */
  list: () => revalidateEntity("roles", undefined, { pathRoot: "settings/roles" }),
};

/**
 * Revalidate lead-related cache
 */
export const leadRevalidation = {
  lead: (id: number) => revalidateEntityWithList("lead", id, { pathRoot: "leads" }),
  list: () => revalidateEntity("leads", undefined, { pathRoot: "leads" }),
};

/**
 * Revalidate activity-related cache
 */
export const activityRevalidation = {
  /** Revalidate specific activity detail + lists */
  activity: (id: number) => revalidateEntityWithList("activity", id, { pathRoot: "activities" }),

  /** Revalidate activities list */
  list: () => revalidateEntity("activities", undefined, { pathRoot: "activities" }),

  /** Revalidate activities belonging to a lead (revalidates lead detail page) */
  forLead: (leadId: number) => {
    revalidateTag(`activities-lead-${leadId}`);
    revalidatePath(`/leads/${leadId}`, "page");
  },
};

// ============================================================================
// Export for convenience
// ============================================================================

export {
  type RevalidateTagProfile,
  type RevalidatePathType,
  DEFAULT_TAG_PROFILE,
  DEFAULT_PATH_TYPE,
};
