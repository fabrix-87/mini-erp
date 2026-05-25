import { ApiResponse } from "@/types/api";
import { Customer, CustomerQueryInput, CustomerStats } from "@/types/customer-types";
import api from "@/lib/client/api";
import { Company, CompanyQueryInput } from "@/types/company-types";
import { CreateCustomerForm } from "@mini-erp/shared/types";

/**
 * Recupera la lista dei clienti con filtri e paginazione
 */
export const getCompanies = async (
  params: CompanyQueryInput
): Promise<ApiResponse<Company[]>> => {
    const defaultParams = { limit: 20, page: 1 };

    // I parametri forniti dall'utente (contenuti in 'params') SOVRASCRIVERANNO i default.
    const finalParams = {
        ...defaultParams,
        ...params
    };
    const response = await api.get('/companies', {params: finalParams});
    return response.data;
};

/**
 * Recupera la lista dei clienti con filtri e paginazione
 */
export const getCustomers = async (
  params: CustomerQueryInput
): Promise<ApiResponse<Customer[]>> => {
    const defaultParams = { limit: 20, page: 1 };

    if(params.type === "all") params.type = undefined;
    if(params.segment === "all") params.segment = undefined;

    // I parametri forniti dall'utente (contenuti in 'params') SOVRASCRIVERANNO i default.
    const finalParams = {
        ...defaultParams,
        ...params
    };
    const response = await api.get('/customers', {params: finalParams});
    return response.data;
};

/**
 * Recupera le statistiche dashboard dei clienti
 */
export const getDashboardStats = async (): Promise<ApiResponse<CustomerStats>> => {
  const response = await api.get('/dashboard/customers')
  return response.data
}

/**
 * Recupera un singolo cliente per ID
 */
export const getCustomerById = async (
  id: number
): Promise<ApiResponse<Customer>> => {
  const response = await api.get(`/customers/${id}`)
  return response.data
}

/**
 * Crea un nuovo cliente
 */
export const createCustomer = async (
  data: CreateCustomerForm
): Promise<ApiResponse<Customer>> => {
  const response = await api.post('/customers', data)
  return response.data
}

/**
 * Aggiorna un cliente esistente
 */
export const updateCustomer = async (
  id: number,
  data: Partial<Customer>
): Promise<ApiResponse<Customer>> => {
  const response = await api.put(`/customers/${id}`, data)
  return response.data
}

/**
 * Elimina un cliente
 */
export const deleteCustomer = async (
  id: number
): Promise<ApiResponse<void>> => {
  const response = await api.delete(`/customers/${id}`)
  return response.data
}