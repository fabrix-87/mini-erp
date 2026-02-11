// utils/response.ts

import { Response } from "express";
import {
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
  ValidationError,
  ApiStatus,
} from "../types/api-response";

/**
 * Formatta risposta paginata
 */
export const formatPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message?: string,
  errors?: ValidationError[],
): PaginatedResponse<T> => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    status: "success",
    data,
    message,
    results: data.length,
    errors,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page * limit < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Invia risposta di successo
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  options?: {
    statusCode?: number;
    message?: string;
    results?: number;
    pagination?: PaginationInfo;
  },
) => {
  const response: ApiResponse<T> = {
    status: "success",
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.results !== undefined && { results: options.results }),
    ...(options?.pagination && { pagination: options.pagination }),
  };

  return res.status(options?.statusCode ?? 200).json(response);
};

/**
 * Invia risposta di errore
 */
export const sendError = (
  res: Response,
  options: {
    statusCode?: number;
    message: string;
    status?: ApiStatus;
    errors?: ValidationError[];
  },
) => {
  const response: ApiResponse<null> = {
    status: options.status ?? "error",
    data: null,
    message: options.message,
    errors: options.errors,
  };

  return res.status(options.statusCode ?? 500).json(response);
};

/**
 * Invia risposta di fallimento (fail = errore client, es. validazione)
 */
export const sendFail = (
  res: Response,
  options: {
    statusCode?: number;
    message: string;
    errors?: ValidationError[];
  },
) => {
  return sendError(res, {
    statusCode: options.statusCode ?? 400,
    status: "fail",
    message: options.message,
    errors: options.errors,
  });
};

/**
 * Invia risposta con validazione fallita
 */
export const sendValidationError = (
  res: Response,
  errors: ValidationError[],
  message: string = "Validazione fallita",
) => {
  return sendFail(res, {
    statusCode: 400,
    message,
    errors,
  });
};

/**
 * Invia risposta paginata (combina formatPaginatedResponse + sendSuccess)
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  options?: {
    statusCode?: number;
    message?: string;
  },
) => {
  const response = formatPaginatedResponse(
    data,
    total,
    page,
    limit,
    options?.message,
  );
  return res.status(options?.statusCode ?? 200).json(response);
};

/**
 * Invia risposta creata con successo (201)
 */
export const sendCreated = <T>(res: Response, data: T, message?: string) => {
  return sendSuccess(res, data, {
    statusCode: 201,
    message,
  });
};

/**
 * Invia risposta no content (204)
 */
export const sendNoContent = (res: Response) => {
  return res.status(204).send();
};

/**
 * Invia risposta di eliminazione con successo
 */
export const sendDeleted = (
  res: Response,
  message = "Risorsa eliminata con successo",
) => {
  return sendSuccess(res, null, {
    statusCode: 200,
    message,
  });
};
