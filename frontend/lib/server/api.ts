// lib/api/server/api.ts

import { ServerApiError, ServerRequestOptions } from "@/types/server-client";
import { getCookiesString } from "./cookies";
import { 
  ApiResponse, 
  ApiError as ApiErrorType 
} from "@/types/api";
import { getFingerprintForSSR } from "./fingerprint";

// ============================================================================
// Configuration
// ============================================================================

export const API_BASE_URL = process.env.API_URL || "http://localhost:5000";

// Estendiamo le opzioni
export interface ExtendedServerRequestOptions extends ServerRequestOptions {
  returnHeaders?: boolean;
}

// ============================================================================
// Main Server API Client
// ============================================================================

class ServerApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Esempio di Overload per GET:
  // 1. Se returnHeaders è true -> Ritorna { data: T, headers }
  // 2. Default -> Ritorna T
  // ===========================================================================
  // GET Request (con Overload)
  // ===========================================================================
  async get<T>(endpoint: string, options: ExtendedServerRequestOptions & { returnHeaders: true }): Promise<{ data: T; headers: Headers }>;
  async get<T>(endpoint: string, options?: ExtendedServerRequestOptions): Promise<T>;
  async get<T>(endpoint: string, options: ExtendedServerRequestOptions = {}): Promise<T | { data: T; headers: Headers }> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  // ===========================================================================
  // POST Request (con Overload)
  // ===========================================================================
  async post<T>(endpoint: string, data: any, options: ExtendedServerRequestOptions & { returnHeaders: true }): Promise<{ data: T; headers: Headers }>;
  async post<T>(endpoint: string, data?: any, options?: ExtendedServerRequestOptions): Promise<T>;
  async post<T>(endpoint: string, data?: any, options: ExtendedServerRequestOptions = {}): Promise<T | { data: T; headers: Headers }> {
    return this.request<T>("POST", endpoint, data, options);
  }

  // ===========================================================================
  // PUT Request (con Overload)
  // ===========================================================================
  async put<T>(endpoint: string, data: any, options: ExtendedServerRequestOptions & { returnHeaders: true }): Promise<{ data: T; headers: Headers }>;
  async put<T>(endpoint: string, data?: any, options?: ExtendedServerRequestOptions): Promise<T>;
  async put<T>(endpoint: string, data?: any, options: ExtendedServerRequestOptions = {}): Promise<T | { data: T; headers: Headers }> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  // ===========================================================================
  // PATCH Request (con Overload)
  // ===========================================================================
  async patch<T>(endpoint: string, data: any, options: ExtendedServerRequestOptions & { returnHeaders: true }): Promise<{ data: T; headers: Headers }>;
  async patch<T>(endpoint: string, data?: any, options?: ExtendedServerRequestOptions): Promise<T>;
  async patch<T>(endpoint: string, data?: any, options: ExtendedServerRequestOptions = {}): Promise<T | { data: T; headers: Headers }> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  // ===========================================================================
  // DELETE Request (con Overload)
  // ===========================================================================
  async delete<T>(endpoint: string, options: ExtendedServerRequestOptions & { returnHeaders: true }): Promise<{ data: T; headers: Headers }>;
  async delete<T>(endpoint: string, options?: ExtendedServerRequestOptions): Promise<T>;
  async delete<T>(endpoint: string, options: ExtendedServerRequestOptions = {}): Promise<T | { data: T; headers: Headers }> {
    return this.request<T>("DELETE", endpoint, undefined, options);
  }

  // ===========================================================================
  // Unified Request Handler
  // ===========================================================================
  private async request<T>(
    method: string,
    endpoint: string,
    data: any,
    options: ExtendedServerRequestOptions
  ): Promise<T | { data: T; headers: Headers }> {
    const {
      params,
      includeCookies = true,
      revalidate,
      tags,
      returnHeaders,
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

    return handleResponse<T>(response, returnHeaders);
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
export async function handleResponse<T>(
  response: Response,
  returnHeaders = false
): Promise<T | { data: T; headers: Headers }> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      // Usiamo il tipo ApiErrorType definito nel tuo file types
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

  let data: T;

  if (isJson) {
    // QUI LA DIFFERENZA:
    // Sappiamo che il backend restituisce ApiResponse<T>
    const json: ApiResponse<T> = await response.json();
    
    // Restituiamo solo il payload 'data' pulito
    data = json.data; 
  } else {
    data = (await response.text()) as unknown as T;
  }

  if (returnHeaders) {
    return { data, headers: response.headers };
  }

  return data;
}
