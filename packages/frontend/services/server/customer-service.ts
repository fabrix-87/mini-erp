// services/server/customer-service.ts

import { serverApi } from "@/lib/server/api";
import { CUSTOMER_TAGS, CustomerListApiResponse } from "@/types/customer";
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
      page: options?.limit ?? 1,
      sortBy: "code",
      sortOrder: options?.sortOrder ?? "asc",
    },
    options?.revalidate ?? false,
  );
}
