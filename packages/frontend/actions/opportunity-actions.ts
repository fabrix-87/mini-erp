"use server";

import { deleteOpportunity } from "@/services/server/opportunity-service";
import { opportunityRevalidation } from "@/lib/server/revalidate";
import { ActionResult, withAuth } from "@/lib/server/action";

/**
 * Server Action — delete opportunity with revalidation.
 * @param id - Opportunity ID
 */
export async function deleteOpportunityAction(id: string): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await deleteOpportunity(id);
    opportunityRevalidation.opportunityWithList(id);
  }, "opportunity:delete");
}
