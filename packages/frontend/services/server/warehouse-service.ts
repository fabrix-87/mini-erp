import { serverApi } from "@/lib/server/api";
import { DeleteApiResponse } from "@/types/api";
import {
  WAREHOUSE_TAGS,
  WarehouseListApiResponse,
  WarehouseSingleApiResponse,
  WarehouseStatsApiResponse,
} from "@/types/warehouse-types";
import {
  CreateWarehouseFormValues,
  UpdateWarehouseFormValues,
  WarehouseQueryInput,
} from "@mini-erp/shared";

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

// ============================================================================
// CRUD
// ============================================================================
export async function createWarehouse(
  data: CreateWarehouseFormValues,
): Promise<WarehouseSingleApiResponse> {
  return serverApi.post<WarehouseSingleApiResponse>("/warehouses", data, {
    tags: [WAREHOUSE_TAGS.list],
    unwrapData: false,
  });
}

export async function updateWarehouse(
  data: UpdateWarehouseFormValues,
  id: string,
): Promise<WarehouseSingleApiResponse> {
  return serverApi.patch<WarehouseSingleApiResponse>(`/warehouses/${id}`, data, {
    tags: [WAREHOUSE_TAGS.detail(id)],
    unwrapData: false,
  });
}

export async function deleteWarehouse(id: string): Promise<DeleteApiResponse> {
  return serverApi.delete(`/warehouses/${id}`, { tags: [WAREHOUSE_TAGS.list] });
}
