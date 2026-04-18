// services/client/lead.ts
"use client";

import api from "@/lib/client/api";
import type { ApiResponse } from "@/types/api";
import type {
  Lead,  
  LeadStats,
  LeadQueryInput,
  LeadStatsInput,
  CreateLeadInput,
  UpdateLeadInput,
  UpdateLeadStatusInput,
  UpdateLeadScoreInput,
  QualifyLeadInput,
  ConvertLeadInput,
  BulkAssignLeadsInput,
  BulkUpdateLeadStatusInput,
} from "@/types/lead";

/** Recupera la lista lead con filtri e paginazione */
export async function getLeads(params: LeadQueryInput): Promise<ApiResponse<Lead[]>> {
  const response = await api.get<ApiResponse<Lead[]>>("/leads", { params });
  return response.data;
}

/** Recupera singola lead per ID */
export async function getLeadById(id: number): Promise<ApiResponse<Lead>> {
  const response = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
  return response.data;
}

/** Recupera statistiche lead */
export async function getLeadStats(params?: LeadStatsInput): Promise<ApiResponse<LeadStats>> {
  const response = await api.get<ApiResponse<LeadStats>>("/leads/stats", { params });
  return response.data;
}

/** Crea nuova lead */
export async function createLead(data: CreateLeadInput): Promise<ApiResponse<Lead>> {
  const response = await api.post<ApiResponse<Lead>>("/leads", data);
  return response.data;
}

/** Aggiorna lead */
export async function updateLead(id: number, data: UpdateLeadInput): Promise<ApiResponse<Lead>> {
  const response = await api.put<ApiResponse<Lead>>(`/leads/${id}`, data);
  return response.data;
}

/** Aggiorna status lead */
export async function updateLeadStatus(
  id: number,
  data: UpdateLeadStatusInput,
): Promise<ApiResponse<Lead>> {
  const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/status`, data);
  return response.data;
}

/** Aggiorna score lead */
export async function updateLeadScore(
  id: number,
  data: UpdateLeadScoreInput,
): Promise<ApiResponse<Lead>> {
  const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/score`, data);
  return response.data;
}

/** Qualifica lead (BANT) */
export async function qualifyLead(id: number, data: QualifyLeadInput): Promise<ApiResponse<Lead>> {
  const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/qualify`, data);
  return response.data;
}

/** Converte lead in Customer */
export async function convertLead(id: number, data: ConvertLeadInput): Promise<ApiResponse<Lead>> {
  const response = await api.post<ApiResponse<Lead>>(`/leads/${id}/convert`, data);
  return response.data;
}

/** Assegna lead a un utente */
export async function assignLead(id: number, assignedUserId: number): Promise<ApiResponse<Lead>> {
  const response = await api.patch<ApiResponse<Lead>>(`/leads/${id}/assign`, {
    assignedUserId,
  });
  return response.data;
}

/** Bulk assign leads */
export async function bulkAssignLeads(data: BulkAssignLeadsInput): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>("/leads/bulk/assign", data);
  return response.data;
}

/** Bulk update lead status */
export async function bulkUpdateLeadStatus(
  data: BulkUpdateLeadStatusInput,
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>("/leads/bulk/status", data);
  return response.data;
}

/** Elimina lead */
export async function deleteLead(id: number): Promise<ApiResponse<null>> {
  const response = await api.delete<ApiResponse<null>>(`/leads/${id}`);
  return response.data;
}
