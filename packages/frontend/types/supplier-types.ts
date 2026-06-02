import { ApiResponse, PaginatedResponse, Supplier } from "@mini-erp/shared";

export type { Supplier, SupplierQueryInput, SupplierStats } from "@mini-erp/shared/types";

// ============================================================================
// Client Query Keys
// ============================================================================

export const supplierKeys = {
  all: ["supplier"] as const,
  lists: () => [...supplierKeys.all, "list"] as const,
  list: (params: object) => [...supplierKeys.lists(), params] as const,
  detail: (id: number) => [...supplierKeys.all, "detail", id] as const,
  stats: () => [...supplierKeys.all, "stats"] as const,
};

// ============================================================================
// Server Cache Tags
// ============================================================================

export const SUPPLIER_TAGS = {
  list: "supplier-list",
  detail: (id: number) => `supplier-${id}`,
};

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type SupplierListApiResponse = PaginatedResponse<Supplier>;
export interface SupplierSingleApiResponse extends ApiResponse<Supplier> {}
export interface SupplierDeleteApiResponse extends ApiResponse<null> {}
