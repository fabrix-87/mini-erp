// packages/backend/middleware/tenant-scope-middleware.ts

import { AppBindings } from "@/lib/hono-app";
import { BadRequestError, ForbiddenError } from "@/utils/app-error-utils";
import type { Context, MiddlewareHandler } from "hono";

interface AuthRole {
  code: string;
}

interface AuthUserTenantScope {
  tenantId?: number | undefined;
  roles?: AuthRole[] | undefined;
  currentTenant?:
    | {
        tenantId?: number | undefined;
        roles?: AuthRole[] | undefined;
      }
    | undefined;
}

/**
 * Type guard for an authenticated user object with role information.
 *
 * @param value - Unknown context value.
 * @returns True when the value exposes the expected auth shape.
 */
function isAuthUserTenantScope(value: unknown): value is AuthUserTenantScope {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    tenantId?: unknown;
    roles?: unknown;
  };

  const tenantIdIsValid =
    candidate.tenantId === undefined || typeof candidate.tenantId === "number";

  const rolesAreValid =
    candidate.roles === undefined ||
    (Array.isArray(candidate.roles) &&
      candidate.roles.every((role) => {
        if (typeof role !== "object" || role === null) {
          return false;
        }

        return typeof (role as { code?: unknown }).code === "string";
      }));

  return tenantIdIsValid && rolesAreValid;
}

/**
 * Returns true when the authenticated user has the SUPER_ADMIN role.
 *
 * @param user - Authenticated user context payload.
 * @returns Whether the user is a super admin.
 */
function isSuperAdmin(user: AuthUserTenantScope): boolean {
  const roles = user.currentTenant?.roles ?? user.roles ?? [];
  return roles.some((role) => role.code === "SUPER_ADMIN");
}

/**
 * Ensures that tenant-scoped users always operate with a valid tenant context.
 * SUPER_ADMIN users are allowed to bypass tenant scoping.
 *
 * @param c - Hono request context.
 * @param next - Hono next middleware handler.
 * @returns Middleware response.
 */
export const requireTenantScope: MiddlewareHandler<AppBindings> = async (
  c: Context<AppBindings>,
  next,
): Promise<void> => {
  const authUserValue = c.get("user");

  if (!isAuthUserTenantScope(authUserValue)) {
    throw new ForbiddenError("Authenticated user context is missing or invalid");
  }

  if (isSuperAdmin(authUserValue)) {
    await next();
    return;
  }

  if (!authUserValue.currentTenant?.tenantId) {
    throw new BadRequestError("Tenant context is required for this operation");
  }

  await next();
};
