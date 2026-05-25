// services/server/customer-service.ts

import { serverApi } from "@/lib/server/api";
import { CUSTOMER_TAGS, CustomerListApiResponse, CustomerSingleApiResponse } from "@/types/customer-types";
import { CustomerQueryInput } from "@mini-erp/shared";

// ============================================================================
// READ
// ============================================================================

/**
 * Get all customers with filters and pagination
 */
export async function getAllCustomers(
  params: CustomerQueryInput,
  revalidate?: number | false,
): Promise<CustomerListApiResponse> {
  return serverApi.get<CustomerListApiResponse>("/customers", {
    params,
    revalidate: revalidate ?? false,
    tags: [CUSTOMER_TAGS.list],
    unwrapData: false,
  });
}

// ============================================================================
// Search & Filter Helpers
// ============================================================================

/**
 * Search customers
 */
export async function searchCustomers(
  query: string,
  options?: {
    limit?: number;
    page?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    revalidate?: number | false;
  },
): Promise<CustomerListApiResponse> {
  return getAllCustomers(
    {
      search: query,
      limit: options?.limit ?? 10,
      page: options?.page ?? 1,
      sortBy: "code",
      sortOrder: options?.sortOrder ?? "asc",
    },
    options?.revalidate ?? false,
  );
}

/**
 * Get customer by ID
 */
export async function getCustomerById(
  id: number,
  revalidate?: number | false
): Promise<CustomerSingleApiResponse> {
  return serverApi.get<CustomerSingleApiResponse>(`/customers/${id}`, {
    revalidate: revalidate ?? false,
    tags: [CUSTOMER_TAGS.detail(id)],
    unwrapData: false,
  });
}