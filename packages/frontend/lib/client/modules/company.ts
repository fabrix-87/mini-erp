// @/lib/api/modules/company.ts
import { Customer } from "@/types/customer";
import api from "../api";
import { ApiResponse } from "@/types/api";
import { Supplier } from "@/types/supplier";


/**
 * Aggiorna i dati anagrafici della company associata al customer
 */
export async function updateCustomerCompany(id: number, data: any) {
  return api.put<Customer>(`/customers/${id}/company`, data);
}

/**
 * Aggiorna i dati anagrafici della company associata al supplier
 */
export async function updateSupplierCompany(id: number, data: any) {
  return api.put<Supplier>(`/suppliers/${id}/company`, data);
}