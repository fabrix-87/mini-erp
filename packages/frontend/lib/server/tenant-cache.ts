// lib/server/tenant-cache.ts

import { getCurrentTenantId } from "./auth";

/**
 * Returns tenant-scoped cache options for serverApi calls.
 * Injects tenantId into params (cache key isolation) and tags.
 *
 * @param tag - Base cache tag name (e.g. 'customer-list')
 * @param params - Original query params
 * @param revalidate - Cache TTL
 */
export async function tenantCacheOptions(
  tag: string,
  params?: Record<string, any>,
  revalidate?: number | false,
) {
  const tenantId = await getCurrentTenantId();

  return {
    params: { ...params, _tid: tenantId },
    tags: [`${tag}-${tenantId}`],
    revalidate: revalidate ?? false,
  };
}
