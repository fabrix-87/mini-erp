// @/lib/api/modules/company.ts
import {
  Company,
  companyFilters,
  CompanyDashboardStats,
} from "@/types/company";
import api from "../client";
import { ApiResponse } from "@/types/api";
import { LeadStats } from "@/types/lead";

/**
 * Ricava le statistiche per la dashboard delle aziende
 * @returns ApiResponse<DashboardStats>
 */
export const getDashboardStats = async (): Promise<
  ApiResponse<CompanyDashboardStats>
> => {
  const response = await api.get("/companies/dashboard/stats");
  return response.data;
};

/**
 * Ricava le statistiche per la dashboard delle aziende
 * @returns ApiResponse<DashboardStats>
 */
export const getLeadStats = async (): Promise<
  ApiResponse<LeadStats>
> => {
  const response = await api.get("/companies/dashboard/lead-stats");
  return response.data;
};


/**
 * Ricava la lista delle aziende con filtri opzionali
 * @param filters
 * @returns <ApiResponse<Company[]>
 */
export const getCompanies = async (
  filters: companyFilters
): Promise<ApiResponse<Company[]>> => {
  const response = await api.get("/companies", { params: filters });
  return response.data;
};

/**
 * Ricava i dettagli di una singola azienda
 * @param companyId
 * @param params { include?: string }
 * @returns ApiResponse<Company>
 */
export const getCompany = async (
  companyId: number,
  params?: { include?: string }
): Promise<ApiResponse<Company>> => {
  const response = await api.get(`/companies/${companyId}`, { params });
  return response.data;
};

/**
 * Crea una nuova azienda
 * @param payload
 * @returns ApiResponse<Company>
 */
export const createCompany = async (
  payload: Partial<Company>
): Promise<ApiResponse<Company>> => {
  const response = await api.post(`/companies`, payload);
  return response.data;
};

/**
 * Modifica un'azienda esistente
 * @param payload
 * @returns ApiResponse<Company>
 */
export const updateCompany = async (
  companyId: number,
  payload: Partial<Company>
): Promise<ApiResponse<Company>> => {
  const response = await api.put(`/companies/${companyId}`, payload);
  return response.data;
};

/**
 * Elimina un'azienda
 * @param companyId
 * @returns ApiResponse<null>
 */
export const deleteCompany = async (
  companyId: number
): Promise<ApiResponse<null>> => {
  const response = await api.delete(`/companies/${companyId}`);
  return response.data;
};

/**
 * Ricerca aziende per nome
 * @param query
 * @param limit
 * @returns
 */
export const searchCompanies = async (
  query: string,
  limit: number = 10
): Promise<ApiResponse<Company[]>> => {
  const response = await api.get("/companies/search", {
    params: { q: query, limit },
  });
  return response.data;
};


/**
 * Converte un Lead in Cliente
 * @param companyId
 * @returns ApiResponse<null>
 */
export const convertLeadToCustomer = async (
  companyId: number
): Promise<ApiResponse<null>> => {
  const response = await api.post(`/companies/${companyId}/convert`);
  return response.data;
};