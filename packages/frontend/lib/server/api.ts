// lib/server/api.ts
import { ServerApiError, ServerRequestOptions } from "@/types/server-client";
import { getCookiesString } from "./cookies";
import { ApiResponse, ApiError as ApiErrorType } from "@mini-erp/shared";
import { getFingerprintForSSR } from "./fingerprint";

// ============================================================================
// Configuration
// ============================================================================

/** Base URL for all server-side API requests. Defaults to `http://localhost:5000` if `API_URL` env var is not set. */
export const API_BASE_URL = process.env.API_URL || "http://localhost:5000";

// ============================================================================
// Main Server API Client
// ============================================================================

/**
 * HTTP client for server-side API communication.
 *
 * Handles authentication cookies, device fingerprinting, Next.js cache
 * revalidation tags, and automatic JSON unwrapping out of the box.
 *
 * @example
 * ```ts
 * const user = await serverApi.get<User>('/users/me');
 * const post = await serverApi.post<Post>('/posts', { title: 'Hello' });
 * ```
 */
class ServerApiClient {
  /** Resolved base URL prepended to every request endpoint. */
  private baseUrl: string;

  /**
   * Creates a new `ServerApiClient` instance.
   *
   * @param baseUrl - Base URL for all requests. Defaults to {@link API_BASE_URL}.
   */
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Sends a `GET` request to the given endpoint.
   *
   * @typeParam T - Expected shape of the response data.
   * @param endpoint - API path relative to the base URL (e.g. `'/users'`).
   * @param options - Optional request configuration (query params, cache tags, etc.).
   * @returns Parsed response, unwrapped from the standard `ApiResponse` envelope by default.
   */
  async get<T>(endpoint: string, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("GET", endpoint, undefined, options);
  }

  /**
   * Sends a `POST` request to the given endpoint.
   *
   * @typeParam T - Expected shape of the response data.
   * @param endpoint - API path relative to the base URL.
   * @param data - Request body, serialised as JSON.
   * @param options - Optional request configuration.
   * @returns Parsed response, unwrapped from the standard `ApiResponse` envelope by default.
   */
  async post<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("POST", endpoint, data, options);
  }

  /**
   * Sends a `PUT` request to the given endpoint.
   *
   * @typeParam T - Expected shape of the response data.
   * @param endpoint - API path relative to the base URL.
   * @param data - Request body, serialised as JSON.
   * @param options - Optional request configuration.
   * @returns Parsed response, unwrapped from the standard `ApiResponse` envelope by default.
   */
  async put<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("PUT", endpoint, data, options);
  }

  /**
   * Sends a `PATCH` request to the given endpoint.
   *
   * @typeParam T - Expected shape of the response data.
   * @param endpoint - API path relative to the base URL.
   * @param data - Partial request body, serialised as JSON.
   * @param options - Optional request configuration.
   * @returns Parsed response, unwrapped from the standard `ApiResponse` envelope by default.
   */
  async patch<T>(endpoint: string, data?: any, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("PATCH", endpoint, data, options);
  }

  /**
   * Sends a `DELETE` request to the given endpoint.
   *
   * @typeParam T - Expected shape of the response data.
   * @param endpoint - API path relative to the base URL.
   * @param options - Optional request configuration.
   * @returns Parsed response, unwrapped from the standard `ApiResponse` envelope by default.
   */
  async delete<T>(endpoint: string, options?: ServerRequestOptions): Promise<T> {
    return this.request<T>("DELETE", endpoint, undefined, {unwrapData: false, ...options});
  }

  /**
   * Core request dispatcher used by all public HTTP methods.
   *
   * Responsibilities:
   * - Builds the full URL (base + endpoint + query params).
   * - Attaches auth cookies and device-fingerprint headers.
   * - Configures Next.js ISR via `revalidate` / `tags`.
   * - Delegates response parsing and error handling to {@link handleResponse}.
   *
   * @typeParam T - Expected shape of the response data.
   * @param method - HTTP method (`'GET'`, `'POST'`, etc.).
   * @param endpoint - API path relative to the base URL.
   * @param data - Optional request body (JSON-serialisable).
   * @param options - Full set of request options; destructured internally.
   * @returns Parsed (and optionally unwrapped) response value.
   *
   * @throws {ServerApiError} When the server returns a non-2xx status code.
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data: any,
    options: ServerRequestOptions = {},
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
 * Builds the `Headers` object for an outgoing request.
 *
 * Always sets:
 * - `X-Device-Fingerprint` – SSR-safe device fingerprint for tracking / fraud prevention.
 * - `Content-Type: application/json` – unless already provided by the caller.
 *
 * Conditionally sets:
 * - `Cookie` – forwards the current user's cookies when `includeCookies` is `true`,
 *   enabling server-side authenticated requests.
 *
 * @param initHeaders - Seed headers supplied by the caller (merged first).
 * @param includeCookies - When `true`, the current request's cookies are forwarded to the API.
 * @returns A fully populated `Headers` instance ready to be passed to `fetch`.
 */
const buildHeaders = async (
  initHeaders: HeadersInit | undefined,
  includeCookies: boolean,
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

/**
 * Constructs a fully-qualified URL from a base URL, an endpoint path, and an
 * optional map of query-string parameters.
 *
 * - Normalises leading/trailing slashes so concatenation never produces `//`.
 * - Skips `null` and `undefined` param values to avoid sending empty keys.
 * - All param values are coerced to `string` via `String()`.
 *
 * @param baseUrl - Protocol + host (e.g. `'https://api.example.com'`).
 * @param endpoint - Resource path (e.g. `'/users/42'`).
 * @param params - Key-value map of query parameters to append.
 * @returns The fully-qualified URL string (e.g. `'https://api.example.com/users/42?foo=bar'`).
 *
 * @example
 * ```ts
 * buildUrl('https://api.example.com', '/items', { page: 2, limit: 10 });
 * // → 'https://api.example.com/items?page=2&limit=10'
 * ```
 */
export function buildUrl(baseUrl: string, endpoint: string, params?: Record<string, any>): string {
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
 * Parses a `fetch` `Response` and returns the typed result.
 *
 * **Error path** – throws a {@link ServerApiError} for any non-2xx status:
 * - If the body is JSON, the structured error payload is included in the thrown error.
 * - Otherwise, a plain `"HTTP <status>: <statusText>"` message is used.
 *
 * **Success path**:
 * - JSON bodies are cast to `ApiResponse<T>`.
 *   - When `unwrapData` is `true` (default), only `json.data` is returned.
 *   - When `unwrapData` is `false`, the full envelope is returned as `T`.
 * - Non-JSON bodies fall back to raw text, cast to `T`.
 *
 * @typeParam T - Expected shape of the unwrapped (or full) response value.
 * @param response - The raw `Response` object returned by `fetch`.
 * @param unwrapData - Whether to extract `data` from the `ApiResponse` envelope. Defaults to `true`.
 * @returns The parsed response value typed as `T`.
 *
 * @throws {ServerApiError} When `response.ok` is `false`.
 */
export async function handleResponse<T>(
  response: Response,
  unwrapData: boolean = true,
): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    if (isJson) {
      const errorBody: ApiErrorType = await response.json();
      throw new ServerApiError(
        errorBody.message || "API request failed",
        response.status,
        errorBody,
      );
    }
    throw new ServerApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
  }

  if (isJson) {
    const json: ApiResponse<T> = await response.json();
    return unwrapData ? json.data : (json as T);
  }

  // Plain text fallback
  return (await response.text()) as unknown as T;
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

/**
 * Pre-configured singleton instance of {@link ServerApiClient}.
 *
 * Import and use this directly in Server Components, Route Handlers, and
 * server actions instead of instantiating the class yourself.
 *
 * @example
 * ```ts
 * import { serverApi } from '@/lib/server/api';
 *
 * const products = await serverApi.get<Product[]>('/products');
 * ```
 */
export const serverApi = new ServerApiClient();
