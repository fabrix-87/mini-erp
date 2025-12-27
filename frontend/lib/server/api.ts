// lib/api/server/api.ts

import { ServerApiError, ServerRequestOptions } from "@/types/server-client";
import { getCookiesString } from "./cookies";
import { ApiError, ApiResponse } from "@/types/api";
import { getFingerprintForSSR } from "./fingerprint";

// ============================================================================
// Configuration
// ============================================================================

export const API_BASE_URL = process.env.API_URL || "http://localhost:5000";

// ============================================================================
// Main Server API Client
// ============================================================================

class ServerApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      ...fetchOptions
    } = options;

    const url = buildUrl(endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies)

    const response = await fetch(url, {
      ...fetchOptions,
      method: "GET",
      headers,
      next: {
        revalidate: revalidate !== undefined ? revalidate : 0,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      ...fetchOptions
    } = options;

    const url = buildUrl(endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies)

    const response = await fetch(url, {
      ...fetchOptions,
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      next: {
        revalidate: revalidate !== undefined ? revalidate : false,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response);
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      ...fetchOptions
    } = options;

    const url = buildUrl(endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies)

    const response = await fetch(url, {
      ...fetchOptions,
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      next: {
        revalidate: revalidate !== undefined ? revalidate : false,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response);
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      ...fetchOptions
    } = options;

    const url = buildUrl(endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies)

    const response = await fetch(url, {
      ...fetchOptions,
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      next: {
        revalidate: revalidate !== undefined ? revalidate : false,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response);
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      ...fetchOptions
    } = options;

    const url = buildUrl(endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies)

    const response = await fetch(url, {
      ...fetchOptions,
      method: "DELETE",
      headers: headers,
      next: {
        revalidate: revalidate !== undefined ? revalidate : false,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response);
  }
}

const buildHeaders = async (
  initHeaders: HeadersInit | undefined,
  includeCookies: boolean
): Promise<Headers> => {
  const headers = new Headers(initHeaders);

  const fingerprint = await getFingerprintForSSR();
  headers.set("X-Device-Fingerprint", fingerprint);

  if (includeCookies) {
    const cookiesString = await getCookiesString();
    if (cookiesString) {
      headers.set("Cookie", cookiesString);
    }
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
};

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const serverApi = new ServerApiClient();

/**
 * Costruisce URL con query params
 */
export function buildUrl(
  endpoint: string,
  params?: Record<string, any>
): string {
  // Rimuovi / iniziale dall'endpoint se presente
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  // Assicurati che la base finisca con /
  const base = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

  // Crea l'URL completo
  const url = new URL(cleanEndpoint, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Gestisce la risposta dell'API
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const error: ApiError = await response.json();
      throw new ServerApiError(
        error.message || "API request failed",
        response.status,
        error
      );
    }

    throw new ServerApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  if (isJson) {
    const data: ApiResponse<T> = await response.json();
    return data.data;
  }

  // Non-JSON response
  return (await response.text()) as unknown as T;
}
