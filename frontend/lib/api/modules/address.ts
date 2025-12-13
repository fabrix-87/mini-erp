import { ApiResponse } from "@/types/api";
import api from "../client";
import { Address } from "@/types/address";

/**
 * Preleva gli indirizzi per l'azienda specificata
 */
export const getAddresses = async (
  companyId: number
): Promise<ApiResponse<Address[]>> => {
  const response = await api.get('/addresses/', { params: { companyId } } );
  return response.data;
};

/**
 * Crea un nuovo indirizzo per l'azienda specificata
 */
export const createAddress = async (
  companyId: number,
  data: Partial<Address>
): Promise<ApiResponse<Address>> => {
  data.companyId = companyId;
  const response = await api.post("/addresses", data);
  return response.data;
};

/**
 * Modifica un indirizzo esistente
 */
export const updateAddress = async (
  companyId: number,
  data: Partial<Address>
): Promise<ApiResponse<Address>> => {
  const response = await api.put(`/addresses/${companyId}`, data);
  return response.data;
};
