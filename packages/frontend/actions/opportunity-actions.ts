"use server";

import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
} from "@/services/server/opportunity-service";
import { opportunityRevalidation } from "@/lib/server/revalidate";
import { ActionResult, withAuth } from "@/lib/server/action";
import { OpportunityComplete, OpportunityFormValues } from "@mini-erp/shared";

// ============================================================================
// Opportunity CRUD Actions
// ============================================================================

/**
 * Creates a new opportunity. Requires `opportunity:create` permission.
 *
 * @param data - The opportunity creation payload.
 * @returns The created `Opportunity` on success.
 */
export async function createOpportunityAction(
  data: OpportunityFormValues,
): Promise<ActionResult<OpportunityComplete>> {
  return withAuth(async () => {
    const res = await createOpportunity(data);
    if (res.status === "success") opportunityRevalidation.list();
    else console.error(res.errors);
    return res.data;
  }, "opportunity:create");
}

/**
 * Updates an existing opportunity. Requires `opportunity:update` permission.
 *
 * @param opportunityId - The ID of the opportunity to update
 * @param data - Fields to update
 * @returns The updated `Opportunity` on success.
 */
export async function updateOpportunityAction(
  opportunityId: string,
  data: OpportunityFormValues,
): Promise<ActionResult<OpportunityComplete>> {
  return withAuth(async () => {
    const res = await updateOpportunity(opportunityId, data);
    if (res.status === "success") opportunityRevalidation.opportunityWithList(opportunityId);
    else console.error(res.errors);
    return res.data;
  }, "opportunity:update");
}

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
