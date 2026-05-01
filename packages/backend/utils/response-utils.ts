// utils/response-util.ts
import type { Context } from "hono";
import type { AppBindings } from "../lib/hono-app";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationInfo,
  ValidationError,
  ApiStatus,
} from "../types/api-response-types";

// ============================================================================
// PURE FORMATTERS (no Context dependency)
// ============================================================================

/**
 * Builds a paginated response envelope without sending it.
 * Useful when you need to compose the response before returning.
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

// ============================================================================
// RESPONSE SENDERS (Hono Context)
// ============================================================================

/**
 * Sends a successful JSON response.
 *
 * @param c       - Hono context
 * @param data    - Response payload
 * @param options - Optional status code, message, results count, pagination
 */
export const sendSuccess = <T>(
  c: Context<AppBindings>,
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
    ...(options?.message !== undefined && { message: options.message }),
    ...(options?.results !== undefined && { results: options.results }),
    ...(options?.pagination !== undefined && { pagination: options.pagination }),
  };

  return c.json(response, (options?.statusCode ?? 200) as any);
};

/**
 * Sends an error JSON response.
 *
 * @param c       - Hono context
 * @param options - Status code, message, api status variant, validation errors
 */
export const sendError = (
  c: Context<AppBindings>,
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

  return c.json(response, (options.statusCode ?? 500) as any);
};

/**
 * Sends a client failure response (e.g. validation error, bad input).
 * Uses status "fail" and defaults to HTTP 400.
 */
export const sendFail = (
  c: Context<AppBindings>,
  options: {
    statusCode?: number;
    message: string;
    errors?: ValidationError[];
  },
) => {
  return sendError(c, {
    statusCode: options.statusCode ?? 400,
    status: "fail",
    message: options.message,
    errors: options.errors,
  });
};

/**
 * Sends a validation failure response with structured field errors.
 */
export const sendValidationError = (
  c: Context<AppBindings>,
  errors: ValidationError[],
  message = "Validazione fallita",
) => {
  return sendFail(c, { statusCode: 400, message, errors });
};

/**
 * Sends an authentication failure response.
 */
export const sendAuthenticationError = (
  c: Context<AppBindings>,
  message = "Autenticazione richiesta",
  errors?: ValidationError[],
) => {
  return sendFail(c, { statusCode: 401, message, errors });
};

/**
 * Sends a paginated success response.
 */
export const sendPaginatedResponse = <T>(
  c: Context<AppBindings>,
  data: T[],
  total: number,
  page: number,
  limit: number,
  options?: {
    statusCode?: number;
    message?: string;
  },
) => {
  const response = formatPaginatedResponse(data, total, page, limit, options?.message);

  return c.json(response, (options?.statusCode ?? 200) as any);
};

/**
 * Sends a 201 Created response.
 */
export const sendCreated = <T>(c: Context<AppBindings>, data: T, message?: string) => {
  return sendSuccess(c, data, { statusCode: 201, message });
};

/**
 * Sends a 204 No Content response.
 */
export const sendNoContent = (c: Context<AppBindings>) => {
  return c.body(null, 204);
};

/**
 * Sends a 200 OK response confirming successful deletion.
 */
export const sendDeleted = (
  c: Context<AppBindings>,
  message = "Risorsa eliminata con successo",
) => {
  return sendSuccess(c, null, { statusCode: 200, message });
};

/**
 * Sends a 404 response - resource not found.
 */
export const sendNotFound = (
  c: Context<AppBindings>,
  message = "Risorsa non trovata",
) => {
  return sendSuccess(c, null, { statusCode: 404, message });
};
