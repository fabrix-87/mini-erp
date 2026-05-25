// lib/api/modules/supplier.ts

import { ApiResponse, PaginatedResponse } from "@/types/api";
import api from "../api";
import { Supplier, SupplierQueryInput, SupplierStats } from "@/types/supplier-types";

/**
 * Recupera la lista dei fornitori con filtri e paginazione
 */
export const getSuppliers = async (
  params: SupplierQueryInput
): Promise<PaginatedResponse<Supplier[]>> => {
  const response = await api.get('/suppliers', { params });
  return response.data;
};

/**
 * Recupera le statistiche dashboard dei fornitori
 */
export const getDashboardStats = async (): Promise<ApiResponse<SupplierStats>> => {
  const response = await api.get('/dashboard/supplier');
  return response.data;
};

/**
 * Recupera un singolo fornitore per ID
 */
export const getSupplierById = async (
  id: number
): Promise<ApiResponse<Supplier>> => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data;
};

/**
 * Crea un nuovo fornitore
 */
export const createSupplier = async (
  data: Partial<Supplier>
): Promise<ApiResponse<Supplier>> => {
  const response = await api.post('/suppliers', data);
  return response.data;
};

/**
 * Aggiorna un fornitore esistente
 */
export const updateSupplier = async (
  id: number,
  data: Partial<Supplier>
): Promise<ApiResponse<Supplier>> => {
  const response = await api.put(`/suppliers/${id}`, data);
  return response.data;
};

/**
 * Elimina un fornitore
 */
export const deleteSupplier = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};

/**
 * Recupera i prodotti di un fornitore
 */
export const getSupplierProducts = async (
  id: number
): Promise<ApiResponse<any[]>> => {
  const response = await api.get(`/suppliers/${id}/products`);
  return response.data;
};

/**
 * Recupera gli ordini di acquisto di un fornitore
 */
export const getSupplierOrders = async (
  id: number,
  params?: { page?: number; limit?: number }
): Promise<ApiResponse<any[]>> => {
  const response = await api.get(`/suppliers/${id}/orders`, { params });
  return response.data;
};