import {
  ApiResponse,
  PaginatedResponse,
  Warehouse,
  WarehouseListStats,
  WarehouseStats,
} from "@mini-erp/shared";

export type WarehouseListApiResponse = PaginatedResponse<Warehouse>;
export type WarehouseStatsApiResponse = ApiResponse<WarehouseStats>;
export type WarehouseListStatsApiResponse = ApiResponse<WarehouseListStats>;
export type WarehouseSingleApiResponse = ApiResponse<Warehouse>;

export const WAREHOUSE_TAGS = {
  list: "warehouses-list",
  detail: (id: string): string => `warehouse-${id}`,
  stats: "warehouses-stats",
} as const;
