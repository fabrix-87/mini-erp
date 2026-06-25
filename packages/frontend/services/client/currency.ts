import api from "@/lib/client/api";
import { CurrencySingleApiResponse } from "@/types/currency-types";

/**
 * Get a currency from Code
 * @param code - Query parameters including pagination (page, limit) and filters
 * @returns {Promise<CurrencyListApiResponse>}
 */
export const getCurrencyByCode = async (code: string): Promise<CurrencySingleApiResponse> => {
  const response = await api.get(`/currencies/${code}`);
  return response.data;
};
