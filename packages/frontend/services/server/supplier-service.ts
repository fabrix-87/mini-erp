// services/server/supplier-service.ts

import { serverApi } from "@/lib/server/api";
import {
  SUPPLIER_TAGS,
  SupplierDeleteApiResponse,
  SupplierListApiResponse,
  SupplierSingleApiResponse,
} from "@/types/supplier-types";
import {
  CreateSupplierForm,
  CreateSupplierInput,
  Supplier,
  SupplierQueryInput,
  SupplierStats,
  UpdateSupplierCompanyInput,
  UpdateSupplierForm,
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
  id: string,
  revalidate?: number | false,
): Promise<Supplier> {
  return serverApi.get<Supplier>(`/suppliers/${id}`, {
    revalidate: revalidate ?? false,
    tags: [SUPPLIER_TAGS.detail(id)],
    //unwrapData: false,
  });
}

// ============================================================================
// Stats
// ============================================================================
export async function getSupplierStats(): Promise<SupplierStats> {
  return serverApi.get<SupplierStats>("/suppliers/stats");
}


// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new supplier with nested company data
 */
export async function createSupplier(
  data: CreateSupplierForm,
): Promise<Supplier> {
  return serverApi.post<Supplier>("/suppliers", data);
}

/**
 * Update supplier procurement-specific fields
 * @route PUT /api/suppliers/:id
 */
export async function updateSupplier(
  id: string,
  data: UpdateSupplierForm,
): Promise<Supplier> {
  return serverApi.put<Supplier>(`/suppliers/${id}`, data);
}

/**
 * Update the company data belonging to a supplier
 * @route PUT /api/suppliers/:id/company
 */
export async function updateSupplierCompany(
  id: string,
  data: UpdateSupplierCompanyInput,
): Promise<Supplier> {
  return serverApi.put<Supplier>(`/suppliers/${id}/company`, data);
}

/**
 * Delete a supplier by ID
 */
export async function deleteSupplier(
  id: string,
): Promise<SupplierDeleteApiResponse> {
  return serverApi.delete<SupplierDeleteApiResponse>(`/suppliers/${id}`);
}