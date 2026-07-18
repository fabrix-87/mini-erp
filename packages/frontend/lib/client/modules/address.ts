import { ApiResponse } from "@/types/api";
import api from "../api";
import { Address } from "@/types/address";
import { AddressType } from "@mini-erp/shared/constants";

/**
 * Preleva gli indirizzi per l'azienda specificata
 */
export const getAddresses = async (companyId: string): Promise<ApiResponse<Address[]>> => {
  const response = await api.get("/addresses/", { params: { companyId } });
  return response.data;
};

/**
 * Crea un nuovo indirizzo per l'azienda specificata
 */
export const createAddress = async (
  companyId: string,
  data: Partial<Address>,
): Promise<ApiResponse<Address>> => {
  data.companyId = companyId;
  const response = await api.post("/addresses", data);
  return response.data;
};

/**
 * Modifica un indirizzo esistente
 */
export const updateAddress = async (
  companyId: string,
  data: Partial<Address>,
): Promise<ApiResponse<Address>> => {
  const response = await api.put(`/addresses/${companyId}`, data);
  return response.data;
};

/** Fetches the first address of the given type for a company. */
export const getAddressByType = async (companyId: string, type: AddressType) => {
  const response = await api.get<Address>(`/companies/${companyId}/addresses?type=${type}&take=1`);
  return response.data;
};
