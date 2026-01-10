import { ApiResponse, ValidationError } from "../types/api-response";

/**
 * Formatta risposta paginata
 */
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string,
  errors?: ValidationError[]
): ApiResponse => ({
  status: "success",
  data,
  message,
  errors,
  pagination: {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  },
});