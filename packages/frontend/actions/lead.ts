// actions/lead.ts
"use server";

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
} from "@/services/server/lead";
import type {
  UpdateLeadStatusInput,
  BulkAssignLeadsInput,
  BulkUpdateLeadStatusInput,
} from "@/types/lead";
import { ConvertLeadFormInput, CreateLeadFormInput, QualifyLeadFormInput, UpdateLeadFormInput, UpdateLeadScoreFormInput } from "@mini-erp/shared";

// ============================================================================
// Server Actions
// ============================================================================

/** Server Action — Crea lead */
export async function createLeadAction(data: CreateLeadFormInput) {
  try {
    const response = await createLeadServer(data);
    leadRevalidation.list();
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Aggiorna lead */
export async function updateLeadAction(id: number, data: UpdateLeadFormInput) {
  try {
    const response = await updateLeadServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Elimina lead */
export async function deleteLeadAction(id: number) {
  try {
    await deleteLeadServer(id);
    leadRevalidation.lead(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Aggiorna status lead */
export async function updateLeadStatusAction(id: number, data: UpdateLeadStatusInput) {
  try {
    const response = await updateLeadStatusServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Aggiorna score lead */
export async function updateLeadScoreAction(id: number, data: UpdateLeadScoreFormInput) {
  try {
    const response = await updateLeadScoreServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Qualifica lead (BANT) */
export async function qualifyLeadAction(id: number, data: QualifyLeadFormInput) {
  try {
    const response = await qualifyLeadServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Converti lead in Customer */
export async function convertLeadAction(id: number, data: ConvertLeadFormInput) {
  try {
    const response = await convertLeadServer(id, data);
    leadRevalidation.lead(id);
    return { success: true, data: response.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/** Server Action — Assegna lead a utente */
export async function assignLeadAction(id: number, assignedUserId: number) {
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
