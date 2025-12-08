import { ApiResponse } from "@/types/api";
import api from "../client";
import { Opportunity, OpportunityDashboardStats } from "@/types/opportunity";

/**
 * Ricava le statistiche per la dashboard delle attività
 * @param userId 
 * @returns 
 */
export const getOpportunityStats = async (
  userId: number
): Promise<ApiResponse<OpportunityDashboardStats>> => {
  const response = await api.get("/opportunities/dashboard/stats", {
    params: { userId },
  });
  return response.data;
};

/**
 * Ritorna la lista delle opportunità con filtri opzionali
 * @param status 
 * @param sortBy 
 * @param sortOrder 
 * @param limit 
 * @returns 
 */
export const getOpportunities = async (
  status?: string,
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC',
  limit: number = 20
): Promise<ApiResponse<Opportunity[]>> => {
  const response = await api.get("/opportunities", { params: { status, sortBy, sortOrder, limit } });
  return response.data;
}