// lib/api/server-modules/auth.ts
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
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

/**
 * Retrieves the current authenticated user.
 * Uses per-request memoization for the no-cache path; falls back to
 * a tagged fetch with configurable ISR revalidation when `revalidate` is set.
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
  // When no options are passed, reuse the memoized fetch (zero extra cost).
  if (!options) {
    return fetchSessionPayload() as unknown as Promise<User>;
  }

  return serverApi.get<User>("/users/me", {
    revalidate: options.revalidate ?? 60,
    tags: options.tags ?? ["user-profile"],
  });
}

// ============================================================================
// Permission & Role Checks
// ============================================================================

/**
 * Checks whether the current user has a specific permission.
 * @param permissionCode - The permission code to check.
 * @returns `true` if the user has the permission, `false` otherwise.
 */
export async function checkUserPermission(permissionCode: PermissionCode): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return session.currentTenant.permissions.includes(permissionCode);
  } catch (error) {
    console.error("Permission check failed:", error);
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
 * const perms = await checkUserPermissions(["invoice:read", "invoice:create", "user:manage"]);
 * // { 'invoice:read': true, 'invoice:create': true, 'user:manage': false }
 */
export async function checkUserPermissions(
  permissionCodes: PermissionCode[],
): Promise<Record<string, boolean>> {
  try {
    const session = await fetchSessionPayload();
    const granted = new Set(session.currentTenant.permissions);
    return Object.fromEntries(permissionCodes.map((code) => [code, granted.has(code)]));
  } catch (error) {
    console.error("Permissions check failed:", error);
    return Object.fromEntries(permissionCodes.map((code) => [code, false]));
  }
}

/**
 * Checks user permissions using a named map for ergonomic destructuring.
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
 * Permissions are expected to follow the `entity:action` convention.
 * Missing permissions are treated as `false`.
 *
 * @param entity - The entity name (e.g. `"currency"`, `"invoice"`, `"user"`).
 * @returns An {@link EntityPermissions} object with boolean flags for each action.
 *
 * @example
 * const { canCreate, canRead, canDelete } = await checkEntityPermissions("invoice");
 */
export async function checkEntityPermissions(entity: string): Promise<EntityPermissions> {
  try {
    const session = await fetchSessionPayload();
    const granted = new Set(session.currentTenant.permissions);

    const hasManage = granted.has(`${entity}:manage`);

    return {
      canCreate: hasManage || granted.has(`${entity}:create`),
      canRead: hasManage || granted.has(`${entity}:read`),
      canUpdate: hasManage || granted.has(`${entity}:update`),
      canDelete: hasManage || granted.has(`${entity}:delete`),
      canManage: hasManage,
    };
  } catch (error) {
    console.error(`Entity permission check failed for "${entity}":`, error);
    return {
      canCreate: false,
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canManage: false,
    };
  }
}

/**
 * Checks whether the current user has a specific role.
 * @param roleCode - The role code to check.
 * @returns `true` if the user has the role, `false` otherwise.
 */
export async function checkUserRole(roleCode: string): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return session.currentTenant.roles.some((role: RoleDTO) => role.code === roleCode);
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
}

/**
 * Checks whether the current user has admin or super-admin role.
 * @returns `true` if the user is an admin, `false` otherwise.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await fetchSessionPayload();
    return session.currentTenant.roles.some(
      (role: RoleDTO) => role.code === "ADMIN" || role.code === "SUPER_ADMIN",
    );
  } catch (error) {
    console.error("Admin check failed:", error);
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
 * is delegated to the `/api/auth/clear-session` route handler via redirect.
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
 * Redirects to `/login` if unauthenticated, or `/dashboard` if unauthorized.
 *
 * Performs a single `/users/me` call by reusing the session payload.
 *
 * @param permissionCode - The required permission code.
 * @returns The authenticated `User`.
 */
export async function requirePermission(permissionCode: PermissionCode): Promise<User> {
  try {
    const session = await fetchSessionPayload();
    const hasPermission = session.currentTenant.permissions.includes(permissionCode);
    if (!hasPermission) redirect("/dashboard");
    return session as unknown as User;
  } catch {
    redirect("/login?session_expired=true");
  }
}

/**
 * Requires the current user to have a specific role.
 * Redirects to `/login` if unauthenticated, or `/dashboard` if unauthorized.
 *
 * @param roleCode - The required role code.
 * @returns The authenticated `User`.
 */
export async function requireRole(roleCode: string): Promise<User> {
  try {
    const session = await fetchSessionPayload();
    const hasRole = session.currentTenant.roles.some((r: RoleDTO) => r.code === roleCode);
    if (!hasRole) redirect("/dashboard");
    return session as unknown as User;
  } catch {
    redirect("/login?session_expired=true");
  }
}

/**
 * Requires admin or super-admin access.
 * Redirects to `/login` if unauthenticated, or `/dashboard` if not admin.
 *
 * @returns The authenticated `User`.
 */
export async function requireAdmin(): Promise<User> {
  try {
    const session = await fetchSessionPayload();
    const admin = session.currentTenant.roles.some(
      (r: RoleDTO) => r.code === "ADMIN" || r.code === "SUPER_ADMIN",
    );
    if (!admin) redirect("/dashboard");
    return session as unknown as User;
  } catch {
    redirect("/login?session_expired=true");
  }
}
