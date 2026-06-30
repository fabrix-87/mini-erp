// packages/frontend/lib/server/action.ts
// Helper utilities for Next.js Server Actions

import { redirect } from "next/navigation";
import { requireAdmin, requireAuth, requirePermission, requireRole } from "@/lib/server/auth";
import { ServerApiError } from "@/types/server-client";

// ============================================================================
// Types
// ============================================================================

export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// Core helper
// ============================================================================

/**
 * Wraps a server action with authentication and standardized error handling.
 *
 * @param action - Async function containing the business logic
 * @param permission - Optional permission code to check (e.g. 'user:create').
 *                     If omitted, falls back to requireAdmin().
 *
 * @example
 * export async function createRoleAction(data: CreateRoleInput) {
 *   return withAuth(async () => {
 *     const role = await createRole(data);
 *     roleRevalidation.list();
 *     return role;
 *   }, 'role:create');
 * }
 */
export async function withAuth<T>(
  action: () => Promise<T>,
  permission?: `${string}:${string}`,
  role?: string,
): Promise<ActionResult<T>> {
  try {
    if (permission) {
      await requirePermission(permission);
    } else {
      await requireAdmin();
    }

    if (role) {
      await requireRole(role);
    } else {
      await requireAdmin();
    }

    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error("Server action error:", error);

    if (error instanceof ServerApiError) {
      if (error.statusCode === 401) redirect("/login");
      if (error.statusCode === 403) {
        return { success: false, error: "Non hai i permessi per questa azione" };
      }
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto",
    };
  }
}

/**
 * Wraps a server action that operates on the authenticated user's own data.
 * Does NOT require admin privileges — only a valid session.
 * Use for profile updates, settings changes, password change, etc.
 *
 * @param action - Async function containing the business logic
 */
export async function withSelf<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    // requireSession verifica solo che esista un token valido
    await requireAuth();
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error("Server action error (self):", error);
    if (error instanceof ServerApiError) {
      if (error.statusCode === 401) redirect("/login");
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Errore imprevisto",
    };
  }
}
