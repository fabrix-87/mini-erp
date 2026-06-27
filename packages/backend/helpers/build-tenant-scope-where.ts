// packages/backend/helpers/build-tenant-scope-where.ts

import { ForbiddenError } from "@/utils/app-error-utils";

interface AuthRole {
  code: string;
}

export interface TenantScopedAuthUser {
  tenantId?: number | undefined;
  roles: AuthRole[];
}

/**
 * Builds a Prisma-compatible tenant scope filter.
 * SUPER_ADMIN users receive an empty filter, while tenant-scoped users
 * are restricted to their current tenant.
 *
 * @param user - Authenticated user.
 * @param tenantFieldName - Tenant field name in the target Prisma model.
 * @returns Prisma where fragment for tenant scoping.
 */
export function buildTenantScopeWhere<
  TFieldName extends string,
  TWhere extends Partial<Record<TFieldName, number>>,
>(
  user: TenantScopedAuthUser,
  tenantFieldName: TFieldName = "tenantId" as TFieldName,
): TWhere | Record<string, never> {
  const isSuperAdmin = user.roles.some((role) => role.code === "SUPER_ADMIN");

  if (isSuperAdmin) {
    return {};
  }

  if (user.tenantId === undefined) {
    throw new ForbiddenError("Tenant-scoped user is missing tenant context");
  }

  return {
    [tenantFieldName]: user.tenantId,
  } as TWhere;
}
