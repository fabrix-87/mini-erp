import api from "@/lib/client/api";
import { ApiResponse } from "@/types/api";
import { Country, CountryQueryParams } from "@/types/country";

/**
 * Recupera la lista dei Paesti con filtri e paginazione
 */
export const getCountries = async (
  params: CountryQueryParams
): Promise<ApiResponse<Country[]>> => {
  const response = await api.get("/countries", { params });
  return response.data;
};
