// lib/server/api.ts

import { ServerApiError, ServerRequestOptions } from "@/types/server-client";
import { getCookiesString } from "./cookies";
import { ApiResponse, ApiError as ApiErrorType } from "@/types/api";
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

  // ===========================================================================
  // GET Request
  // ===========================================================================
  async get<T>(endpoint: string, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  // ===========================================================================
  // POST Request
  // ===========================================================================
  async post<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  // ===========================================================================
  // PUT Request
  // ===========================================================================
  async put<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  // ===========================================================================
  // PATCH Request
  // ===========================================================================
  async patch<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  // ===========================================================================
  // DELETE Request
  // ===========================================================================
  async delete<T>(endpoint: string, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  // ===========================================================================
  // Unified Request Handler
  // ===========================================================================
  private async request<T>(
    method: string,
    endpoint: string,
    data: any,
    options: ServerRequestOptions = {}
  ): Promise<T> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      unwrapData = true,
      ...fetchOptions
    } = options;

    const url = buildUrl(this.baseUrl, endpoint, params);
    const headers = await buildHeaders(fetchOptions.headers, includeCookies);

    const response = await fetch(url, {
      ...fetchOptions,
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      next: {
        revalidate: revalidate !== undefined ? revalidate : 0,
        tags: tags || [],
      },
    });

    return handleResponse<T>(response, unwrapData);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Costruisce gli headers della richiesta
 */
const buildHeaders = async (
  initHeaders: HeadersInit | undefined,
  includeCookies: boolean
): Promise<Headers> => {
  const headers = new Headers(initHeaders);

  // Fingerprint
  const fingerprint = await getFingerprintForSSR();
  headers.set("X-Device-Fingerprint", fingerprint);

  // Cookie (per auth)
  if (includeCookies) {
    const cookiesString = await getCookiesString();
    if (cookiesString) {
      headers.set("Cookie", cookiesString);
    }
  }

  // Content-Type
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
};

/**
 * Costruisce URL con query params
 */
export function buildUrl(
  baseUrl: string,
  endpoint: string,
  params?: Record<string, any>
): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
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
export async function handleResponse<T>(response: Response, unwrapData: boolean = true): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  // ========================================
  // Error Handling
  // ========================================
  if (!response.ok) {
    if (isJson) {
      const errorBody: ApiErrorType = await response.json();
      throw new ServerApiError(
        errorBody.message || "API request failed",
        response.status,
        errorBody
      );
    }

    throw new ServerApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  // ========================================
  // Success Response
  // ========================================
  if (isJson) {
    const json: ApiResponse<T> = await response.json();
    
    // Scegli se unwrappare o no
    if (unwrapData) {
      return json.data; // Comportamento attuale
    } else {
      return json as T; // Restituisci tutto
    }
  }

  // Plain text fallback
  return (await response.text()) as unknown as T;
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const serverApi = new ServerApiClient();
