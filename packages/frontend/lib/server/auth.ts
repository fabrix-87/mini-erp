// lib/api/server-modules/auth.ts
import { RoleDTO, User, UserSessionPayload } from "@mini-erp/shared";
import { serverApi } from "./api";
import { redirect } from "next/navigation";

// ============================================================================
// Server-Side Auth API Functions
// ============================================================================

/**
 * Verifica lo stato di autenticazione corrente
 * Usa i cookies automaticamente
 */
export async function checkAuth(): Promise<User | null> {
  try {
    const user = await serverApi.get<User>("/users/me", {
      revalidate: 0, // No cache - sempre fresh
    });
    return user;
  } catch (error) {
    console.error("Auth check failed:", error);
    return null;
  }
}

/**
 * Ottieni informazioni utente corrente
 * Con cache strategy
 */
export async function getCurrentUser(options?: {
  revalidate?: number | false;
  tags?: string[];
}): Promise<User> {
  return serverApi.get<User>("/users/me", {
    revalidate: options?.revalidate ?? 60, // Cache 1 min by default
    tags: options?.tags ?? ["user-profile"],
  });
}

/**
 * Verifica permessi utente
 */
export async function checkUserPermission(permissionCode: string): Promise<boolean> {
  try {
    const user = await serverApi.get<UserSessionPayload>("/users/me", {
      revalidate: 0,
    });

    // Check if user has permission through roles
    return user.currentTenant.permissions.some((p: string) => p === permissionCode) ?? false;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

/**
 * Verifica se utente ha ruolo specifico
 */
export async function checkUserRole(roleCode: string): Promise<boolean> {
  try {
    const user = await serverApi.get<UserSessionPayload>("/users/me", {
      revalidate: 0,
    });

    return user.currentTenant.roles.some((role: RoleDTO) => role.code === roleCode) ?? false;
  } catch (error) {
    console.error("Role check failed:", error);
    return false;
  }
}

/**
 * Verifica se utente è admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkUserRole("ADMIN") || checkUserRole("SUPER_ADMIN");
}

/**
 * Requires authentication in server components.
 * On invalid session (e.g. Redis reset), redirects to /login with
 * session_expired=true flag so the login page can clear stale cookies.
 *
 * NOTE: cookies() cannot be mutated in Server Components — cleanup
 * is delegated to the /api/auth/clear-session route handler via redirect.
 */
export async function requireAuth(): Promise<User> {
  const user = await checkAuth();

  if (!user) {
    redirect("/login?session_expired=true");
  }

  return user;
}

/**
 * Requires a specific permission. Redirects to /login if unauthenticated,
 * or to /dashboard if the permission is missing.
 */
export async function requirePermission(permissionCode: string): Promise<User> {
  const user = await requireAuth();
  const hasPermission = await checkUserPermission(permissionCode);

  if (!hasPermission) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Requires a specific role. Redirects to /login if unauthenticated,
 * or to /dashboard if the role is missing.
 */
export async function requireRole(roleCode: string): Promise<User> {
  const user = await requireAuth();
  const hasRole = await checkUserRole(roleCode);

  if (!hasRole) {
    redirect("/dashboard");
  }

  return user;
}

/**
 * Requires admin access. Redirects to /login if unauthenticated,
 * or to /dashboard if not admin.
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  const isAdminUser = await isAdmin();

  if (!isAdminUser) {
    redirect("/dashboard");
  }

  return user;
}
