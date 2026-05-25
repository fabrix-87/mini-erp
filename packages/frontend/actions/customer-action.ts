// ============================================================================
// Search & Filter Actions 
// ============================================================================

import { withAuth } from "@/lib/server/action";
import { searchCustomers, getCustomerById } from "@/services/server/customer-service";
import { ActionResult } from "next/dist/shared/lib/app-router-types";

/**
 * Search customer by query
 */
export async function searchCustomerAction(
  query: string,
  options?: {
    limit?: number;
  }
): Promise<ActionResult> {
  return withAuth(async () => {
    return await searchCustomers(query, {
      limit: options?.limit ?? 10,
      revalidate: 30,
    });
  }, 'customer:read');
}

/**
 * Get customer by ID
 */
export async function getCustomerByIdAction(
  id: number
): Promise<ActionResult> {
  return withAuth(async () => {
    return await getCustomerById(id, false)
  }, 'customer:read');
}