import { serverApi } from "@/lib/server/api";
import { getCurrentTenantId } from "@/lib/server/auth";
import { TENANT_TAGS } from "@/types/tenant-types";
import { TenantWithDetails } from "@mini-erp/shared";

/**
 * Fetches the full details of the current tenant.
 *
 * Uses a per-tenant cache tag so that revalidation is scoped correctly —
 * invalidating Tenant A's data never affects Tenant B's cache entry.
 *
 * @param revalidate - ISR TTL in seconds (default: 30). Use `false` to cache
 *   indefinitely until manual revalidation via tag.
 * @returns The full {@link TenantWithDetails} for the authenticated tenant.
 */
export async function getCurrentTenant(
  revalidate: number | false = 30,
): Promise<TenantWithDetails> {
  const tenantId = await getCurrentTenantId();

  return serverApi.get<TenantWithDetails>("tenants/current", {
    revalidate,
    tags: [TENANT_TAGS.detail(tenantId)],
  });
}