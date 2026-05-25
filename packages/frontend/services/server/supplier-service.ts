// services/server/supplier-service.ts

import { serverApi } from "@/lib/server/api";
import {
  SUPPLIER_TAGS,
  SupplierDeleteApiResponse,
  SupplierListApiResponse,
  SupplierSingleApiResponse,
} from "@/types/supplier-types";
import {
  CreateSupplierInput,
  SupplierQueryInput,
  UpdateSupplierCompanyInput,
  UpdateSupplierInput,
} from "@mini-erp/shared";

// ============================================================================
// READ
// ============================================================================

/**
 * Get all suppliers with filters and pagination
 */
export async function getAllSuppliers(
  params: SupplierQueryInput,
  revalidate?: number | false,
): Promise<SupplierListApiResponse> {
  return serverApi.get<SupplierListApiResponse>("/suppliers", {
    params,
    revalidate: revalidate ?? false,
    tags: [SUPPLIER_TAGS.list],
    unwrapData: false,
  });
}

// ============================================================================
// Search & Filter Helpers
// ============================================================================

/**
 * Search suppliers
 */
export async function searchSuppliers(
  query: string,
  options?: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    revalidate?: number | false;
    hasProducts?: boolean | undefined;
    hasOrders?: boolean | undefined;
  },
): Promise<SupplierListApiResponse> {
  return getAllSuppliers(
    {
      search: query,
      limit: options?.limit ?? 10,
      page: options?.page ?? 1,
      sortBy: options?.sortBy ?? "code",
      sortOrder: options?.sortOrder ?? "asc",
      hasProducts: options?.hasProducts,
      hasOrders: options?.hasOrders,
    },
    options?.revalidate ?? false,
  );
}

/**
 * Get supplier by ID
 */
export async function getSupplierById(
  id: number,
  revalidate?: number | false,
): Promise<SupplierSingleApiResponse> {
  return serverApi.get<SupplierSingleApiResponse>(`/suppliers/${id}`, {
    revalidate: revalidate ?? false,
    tags: [SUPPLIER_TAGS.detail(id)],
    unwrapData: false,
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new supplier with nested company data
 */
export async function createSupplier(
  data: CreateSupplierInput,
): Promise<SupplierSingleApiResponse> {
  return serverApi.post<SupplierSingleApiResponse>("/suppliers", data);
}

/**
 * Update supplier procurement-specific fields
 * @route PUT /api/suppliers/:id
 */
export async function updateSupplier(
  id: number,
  data: UpdateSupplierInput,
): Promise<SupplierSingleApiResponse> {
  return serverApi.put<SupplierSingleApiResponse>(`/suppliers/${id}`, data);
}

/**
 * Update the company data belonging to a supplier
 * @route PUT /api/suppliers/:id/company
 */
export async function updateSupplierCompany(
  id: number,
  data: UpdateSupplierCompanyInput,
): Promise<SupplierSingleApiResponse> {
  return serverApi.put<SupplierSingleApiResponse>(`/suppliers/${id}/company`, data);
}

/**
 * Delete a supplier by ID
 */
export async function deleteSupplier(
  id: number,
): Promise<SupplierDeleteApiResponse> {
  return serverApi.delete<SupplierDeleteApiResponse>(`/suppliers/${id}`);
}