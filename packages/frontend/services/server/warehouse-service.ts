import { serverApi } from "@/lib/server/api";
import {
  WAREHOUSE_TAGS,
  WarehouseListApiResponse,
  WarehouseStatsApiResponse,
} from "@/types/warehouse-types";
import { WarehouseQueryInput } from "@mini-erp/shared";

/**
 * Fetch paginated warehouse list.
 * @param params - Query filters and pagination
 * @param revalidate - Cache TTL in seconds (false = no cache)
 */
export async function getAllWarehouses(
  params: WarehouseQueryInput,
  revalidate?: number | false,
): Promise<WarehouseListApiResponse> {
  return serverApi.get<WarehouseListApiResponse>("/warehouses", {
    params,
    revalidate: revalidate ?? false,
    tags: [WAREHOUSE_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Fetch warehouse stats for the stats bar.
 * @param revalidate - Cache TTL in seconds
 */
export async function getWarehouseStats(
  revalidate?: number | false,
): Promise<WarehouseStatsApiResponse> {
  return serverApi.get<WarehouseStatsApiResponse>("/warehouses/stats", {
    revalidate: revalidate ?? 300,
    tags: [WAREHOUSE_TAGS.stats],
    unwrapData: false,
  });
}
