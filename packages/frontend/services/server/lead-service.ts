// services/server/lead.ts

import { serverApi } from "@/lib/server/api";
import type { ApiResponse } from "@/types/api";
import {
  type Lead,
  type LeadStats,
  type LeadQueryInput,
  type LeadStatsInput,
  type UpdateLeadStatusInput,
  type BulkAssignLeadsInput,
  type BulkUpdateLeadStatusInput,
  LEAD_TAGS,
  LeadListApiResponse,
  LeadStatsApiResponse,
  LeadSingleApiResponse,
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
// READ
// ============================================================================

/**
 * Ottieni lista lead con filtri e paginazione
 */
export async function getAllLeads(
  params: LeadQueryInput,
  revalidate: number | false,
): Promise<LeadListApiResponse> {
  return serverApi.get<LeadListApiResponse>("/leads", {
    params,
    revalidate: revalidate ?? 0,
    tags: [LEAD_TAGS.list],
    unwrapData: false,
  });
}

/**
 * Ottieni singola lead per ID
 */
export async function getLeadByIdServer(
  id: string,
  revalidate: number | false = 0,
): Promise<LeadSingleApiResponse> {
  return serverApi.get<ApiResponse<Lead>>(`/leads/${id}`, {
    unwrapData: false,
    revalidate,
    tags: [LEAD_TAGS.detail(id)],
  });
}

/**
 * Ottieni statistiche lead
 */
export async function getLeadStatsServer(params?: LeadStatsInput): Promise<LeadStatsApiResponse> {
  return serverApi.get<ApiResponse<LeadStats>>("/leads/stats", {
    params,
    revalidate: 0,
    unwrapData: false,
  });
}

/**
 * Fetches activities associated with a specific lead (SSR)
 */
export async function getLeadActivitiesServer(leadId: number): Promise<ApiResponse<Activity[]>> {
  const url = `/activities?leadId=${leadId}&status=SCHEDULED,IN_PROGRESS&limit=5`;
  return serverApi.get<ApiResponse<Activity[]>>(url, { unwrapData: false });
}

// ============================================================================
// WRITE (usate dalle server actions)
// ============================================================================

export async function createLeadServer(data: CreateLeadFormInput): Promise<ApiResponse<Lead>> {
  return serverApi.post<ApiResponse<Lead>>("/leads", data);
}

export async function updateLeadServer(
  id: string,
  data: UpdateLeadFormInput,
): Promise<ApiResponse<Lead>> {
  return serverApi.put<ApiResponse<Lead>>(`/leads/${id}`, data);
}

export async function updateLeadStatusServer(
  id: string,
  data: UpdateLeadStatusInput,
): Promise<ApiResponse<Lead>> {
  return serverApi.patch<ApiResponse<Lead>>(`/leads/${id}/status`, data);
}

export async function updateLeadScoreServer(
  id: string,
  data: UpdateLeadScoreFormInput,
): Promise<ApiResponse<Lead>> {
  return serverApi.patch<ApiResponse<Lead>>(`/leads/${id}/score`, data);
}

export async function qualifyLeadServer(
  id: string,
  data: QualifyLeadFormInput,
): Promise<ApiResponse<Lead>> {
  return serverApi.patch<ApiResponse<Lead>>(`/leads/${id}/qualify`, data);
}

export async function convertLeadServer(
  id: string,
  data: ConvertLeadFormInput,
): Promise<ApiResponse<Lead>> {
  return serverApi.post<ApiResponse<Lead>>(`/leads/${id}/convert`, data);
}

export async function assignLeadServer(
  id: string,
  assignedUserId: string,
): Promise<ApiResponse<Lead>> {
  return serverApi.patch<ApiResponse<Lead>>(`/leads/${id}/assign`, { assignedUserId });
}

export async function bulkAssignLeadsServer(
  data: BulkAssignLeadsInput,
): Promise<ApiResponse<null>> {
  return serverApi.post<ApiResponse<null>>("/leads/bulk/assign", data);
}

export async function bulkUpdateLeadStatusServer(
  data: BulkUpdateLeadStatusInput,
): Promise<ApiResponse<null>> {
  return serverApi.post<ApiResponse<null>>("/leads/bulk/status", data);
}

export async function deleteLeadServer(id: string): Promise<ApiResponse<null>> {
  return serverApi.delete<ApiResponse<null>>(`/leads/${id}`);
}
