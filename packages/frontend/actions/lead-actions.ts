// actions/lead.ts
"use server";

import { ActionResult, withAuth } from "@/lib/server/action";
import { leadRevalidation } from "@/lib/server/revalidate";
import {
  createLeadServer,
  updateLeadServer,
  deleteLeadServer,
  updateLeadStatusServer,
  updateLeadScoreServer,
  qualifyLeadServer,
  convertLeadServer,
  assignLeadServer,
  bulkAssignLeadsServer,
  bulkUpdateLeadStatusServer,
  getLeadActivitiesServer,
  getLeadByIdServer,
} from "@/services/server/lead-service";
import type {
  UpdateLeadStatusInput,
  BulkAssignLeadsInput,
  BulkUpdateLeadStatusInput,
  Lead,
} from "@/types/lead-types";
import {
  Activity,
  ConvertLeadFormInput,
  CreateLeadFormInput,
  QualifyLeadFormInput,
  UpdateLeadFormInput,
  UpdateLeadScoreFormInput,
} from "@mini-erp/shared";

// ============================================================================
// Server Actions
// ============================================================================

export async function getLeadByIdAction(
  id: string,
  revalidate: number | false = 0,
): Promise<ActionResult<Lead>> {
  return withAuth(async () => {
    const response = await getLeadByIdServer(id, 3600);
    return response.data;
  }, "lead:read");
}

/** Server Action — Crea lead */
export async function createLeadAction(data: CreateLeadFormInput): Promise<ActionResult<Lead>> {
  return withAuth(async () => {
    const response = await createLeadServer(data);
    leadRevalidation.list();
    return response.data;
  }, "lead:create");
}

/** Server Action — Aggiorna lead */
export async function updateLeadAction(
  id: string,
  data: UpdateLeadFormInput,
): Promise<ActionResult<Lead>> {
  return withAuth(async () => {
    const response = await updateLeadServer(id, data);
    leadRevalidation.lead(id);
    return response.data;
  }, "lead:update");
}

/** Server Action — Elimina lead */
export async function deleteLeadAction(id: string): Promise<ActionResult<void>> {
  return withAuth(async () => {
    await deleteLeadServer(id);
    leadRevalidation.lead(id);
  }, "lead:delete");
}

/** Server Action — Aggiorna status lead */
export async function updateLeadStatusAction(id: string, data: UpdateLeadStatusInput) {
  try {
    const response = await updateLeadStatusServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Aggiorna score lead */
export async function updateLeadScoreAction(id: string, data: UpdateLeadScoreFormInput) {
  try {
    const response = await updateLeadScoreServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Qualifica lead (BANT) */
export async function qualifyLeadAction(id: string, data: QualifyLeadFormInput) {
  try {
    const response = await qualifyLeadServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Converti lead in Customer */
export async function convertLeadAction(id: string, data: ConvertLeadFormInput) {
  try {
    const response = await convertLeadServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Assegna lead a utente */
export async function assignLeadAction(id: string, assignedUserId: string) {
  try {
    const response = await assignLeadServer(id, assignedUserId);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Bulk assign leads */
export async function bulkAssignLeadsAction(data: BulkAssignLeadsInput) {
  try {
    await bulkAssignLeadsServer(data);
    leadRevalidation.list();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Bulk update status */
export async function bulkUpdateLeadStatusAction(data: BulkUpdateLeadStatusInput) {
  try {
    await bulkUpdateLeadStatusServer(data);
    leadRevalidation.list();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
