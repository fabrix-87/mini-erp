// ============================================================================
// Search & Filter Actions 
// ============================================================================

import { withAuth } from "@/lib/server/action";
import { searchCustomers } from "@/services/server/customer-service";
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
    const result = await searchCustomers(query, {
      limit: options?.limit ?? 10,
      revalidate: 30,
    });
    return result;
  }, 'customer:read');
}