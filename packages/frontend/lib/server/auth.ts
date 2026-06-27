// lib/server/auth.ts
import {
  EntityPermissions,
  PermissionCode,
  RoleDTO,
  User,
  UserSessionPayload,
} from "@mini-erp/shared";
import { serverApi } from "./api";
import { redirect } from "next/navigation";
import { cache } from "react";

// ============================================================================
// Constants
// ============================================================================

/** Role codes that grant admin-level access. */
const ADMIN_ROLE_CODES = new Set(["ADMIN", "SUPER_ADMIN"]);

// ============================================================================
// Per-Request Memoized Session Fetch
// ============================================================================

/**
 * Fetches the current user session payload, memoized per React render pass.
 *
 * `React.cache()` ensures that no matter how many times this function is called
 * within the same request (e.g. layout + page + multiple Server Components),
 * only **one** network call is made to `/users/me`.
 *
 * The cache is automatically invalidated at the end of each request — there is
 * no risk of stale data leaking across users or requests.
 *
 * @internal
 * @throws When the API call fails (caller must handle or let bubble up).
 */
const fetchSessionPayload = cache(
  async (): Promise<UserSessionPayload> =>
    serverApi.get<UserSessionPayload>("/users/me", { revalidate: 0 }),
);

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Returns `true` if the given roles include an admin-level role code.
 * @internal
 */
function hasAdminRole(roles: RoleDTO[]): boolean {
  return roles.some((r) => ADMIN_ROLE_CODES.has(r.code));
}

// ============================================================================
// Auth Check Functions
// ============================================================================

/**
 * Checks the current authentication status using cookies.
 * Benefits from per-request memoization: if `getCurrentUser` or any permission
 * check has already been called in this request, no extra fetch is made.
 *
 * @returns The authenticated `UserSessionPayload`, or `null` if unauthenticated or on error.
 */
export async function checkAuth(): Promise<UserSessionPayload | null> {
  try {
    return await fetchSessionPayload();
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated user.
 * Uses per-request memoization for the no-cache path; falls back to
 * a tagged fetch with configurable ISR revalidation when `options` is set.
 *
 * @param options - Optional cache configuration.
 * @param options.revalidate - ISR TTL in seconds, or `false` to disable.
 * @param options.tags - Cache tags for on-demand revalidation.
 * @returns The authenticated `User`.
 */
export async function getCurrentUser(options?: {
  revalidate?: number | false;
  tags?: string[];
}): Promise<User> {
  if (!options) {
    return fetchSessionPayload() as unknown as Promise<User>;
  }

  return serverApi.get<User>("/users/me", {
    revalidate: options.revalidate ?? 60,
    tags: options.tags ?? ["user-profile"],
  });
}

// ============================================================================
// Permission Checks
// ============================================================================

/**
 * Checks whether the current user has a specific permission.
 *
 * @param permissionCode - The permission code to check.
 * @returns `true` if the user has the permission, `false` otherwise.
 */
export async function checkUserPermission(permissionCode: PermissionCode): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return session.currentTenant.permissions.includes(permissionCode);
  } catch {
    return false;
  }
}

/**
 * Checks whether the current user has all of the specified permissions.
 * A single API call is made regardless of how many codes are provided.
 *
 * @param permissionCodes - Array of permission codes to evaluate.
 * @returns A record mapping each permission code to `true` or `false`.
 *
 * @example
 * const perms = await checkUserPermissions(["invoice:read", "invoice:create"]);
 * // { 'invoice:read': true, 'invoice:create': false }
 */
export async function checkUserPermissions(
  permissionCodes: PermissionCode[],
): Promise<Record<string, boolean>> {
  try {
    const session = await fetchSessionPayload();
    const granted = new Set(session.currentTenant.permissions);
    return Object.fromEntries(permissionCodes.map((code) => [code, granted.has(code)]));
  } catch {
    return Object.fromEntries(permissionCodes.map((code) => [code, false]));
  }
}

/**
 * Checks user permissions using a named map for ergonomic destructuring.
 *
 * @example
 * const { canCreate, canRead } = await checkUserPermissionsMap({
 *   canCreate: "currency:create",
 *   canRead:   "currency:read",
 * });
 */
export async function checkUserPermissionsMap<K extends string>(
  map: Record<K, PermissionCode>,
): Promise<Record<K, boolean>> {
  try {
    const session = await fetchSessionPayload();
    const granted = new Set(session.currentTenant.permissions);
    return Object.fromEntries(
      Object.entries(map).map(([alias, code]) => [alias, granted.has(code as string)]),
    ) as Record<K, boolean>;
  } catch {
    return Object.fromEntries(Object.keys(map).map((alias) => [alias, false])) as Record<
      K,
      boolean
    >;
  }
}

/**
 * Checks all standard CRUD permissions for a given entity in a single fetch.
 *
 * Permissions follow the `entity:action` convention.
 * Holding `entity:manage` implicitly grants all actions.
 *
 * @param entity - The entity name (e.g. `"currency"`, `"invoice"`).
 * @returns An {@link EntityPermissions} object with boolean flags for each action.
 *
 * @example
 * const { canCreate, canRead } = await checkEntityPermissions("invoice");
 */
export async function checkEntityPermissions(entity: string): Promise<EntityPermissions> {
  const denied: EntityPermissions = {
    canCreate: false,
    canRead: false,
    canUpdate: false,
    canDelete: false,
    canManage: false,
  };

  try {
    const session = await fetchSessionPayload();
    const granted = new Set(session.currentTenant.permissions);
    const canManage = granted.has(`${entity}:manage`);

    return {
      canCreate: canManage || granted.has(`${entity}:create`),
      canRead: canManage || granted.has(`${entity}:read`),
      canUpdate: canManage || granted.has(`${entity}:update`),
      canDelete: canManage || granted.has(`${entity}:delete`),
      canManage,
    };
  } catch {
    return denied;
  }
}

// ============================================================================
// Role Checks
// ============================================================================

/**
 * Checks whether the current user has a specific role.
 *
 * @param roleCode - The role code to check.
 * @returns `true` if the user has the role, `false` otherwise.
 */
export async function checkUserRole(roleCode: string): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return session.currentTenant.roles.some((r: RoleDTO) => r.code === roleCode);
  } catch {
    return false;
  }
}

/**
 * Checks whether the current user has admin or super-admin role.
 *
 * @returns `true` if the user is an admin, `false` otherwise.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return hasAdminRole(session.currentTenant.roles);
  } catch {
    return false;
  }
}

// ============================================================================
// Route Guards (redirect on failure)
// ============================================================================

/**
 * Requires a valid session in Server Components.
 * Redirects to `/login?session_expired=true` if unauthenticated.
 *
 * NOTE: `cookies()` cannot be mutated in Server Components — cookie cleanup
 * is delegated to the proxy middleware on the next request.
 *
 * @returns The authenticated `UserSessionPayload`.
 */
export async function requireAuth(): Promise<UserSessionPayload> {
  const user = await checkAuth();
  if (!user) redirect("/login?session_expired=true");
  return user;
}

/**
 * Requires the current user to have a specific permission.
 * Redirects to `/login?session_expired=true` if unauthenticated,
 * or `/dashboard` if the permission is not granted.
 *
 * @param permissionCode - The required permission code.
 * @returns The authenticated `UserSessionPayload`.
 */
export async function requirePermission(
  permissionCode: PermissionCode,
): Promise<UserSessionPayload> {
  try {
    const session = await fetchSessionPayload();
    if (!session.currentTenant.permissions.includes(permissionCode)) {
      redirect("/dashboard");
    }
    return session;
  } catch {
    redirect("/login?session_expired=true");
  }
}

/**
 * Requires the current user to have a specific role.
 * Redirects to `/login?session_expired=true` if unauthenticated,
 * or `/dashboard` if the role is not present.
 *
 * @param roleCode - The required role code.
 * @returns The authenticated `UserSessionPayload`.
 */
export async function requireRole(roleCode: string): Promise<UserSessionPayload> {
  try {
    const session = await fetchSessionPayload();
    if (!session.currentTenant.roles.some((r: RoleDTO) => r.code === roleCode)) {
      redirect("/dashboard");
    }
    return session;
  } catch {
    redirect("/login?session_expired=true");
  }
}

/**
 * Requires admin or super-admin access.
 * Redirects to `/login?session_expired=true` if unauthenticated,
 * or `/dashboard` if the user is not an admin.
 *
 * @returns The authenticated `UserSessionPayload`.
 */
export async function requireAdmin(): Promise<UserSessionPayload> {
  try {
    const session = await fetchSessionPayload();
    if (!hasAdminRole(session.currentTenant.roles)) redirect("/dashboard");
    return session;
  } catch {
    redirect("/login?session_expired=true");
  }
}
