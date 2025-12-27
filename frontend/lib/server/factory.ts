import { ServerRequestOptions } from "@/types/server-client";
import { serverApi } from "./api";

/**
 * Helper per revalidare tag specifici
 */
export function createTaggedRequest<T>(tags: string[]) {
  return {
    get: (endpoint: string, options?: ServerRequestOptions) =>
      serverApi.get<T>(endpoint, { ...options, tags }),
    post: (endpoint: string, data?: any, options?: ServerRequestOptions) =>
      serverApi.post<T>(endpoint, data, { ...options, tags }),
    put: (endpoint: string, data?: any, options?: ServerRequestOptions) =>
      serverApi.put<T>(endpoint, data, { ...options, tags }),
    patch: (endpoint: string, data?: any, options?: ServerRequestOptions) =>
      serverApi.patch<T>(endpoint, data, { ...options, tags }),
    delete: (endpoint: string, options?: ServerRequestOptions) =>
      serverApi.delete<T>(endpoint, { ...options, tags }),
  };
}

/**
 * Helper per creare richieste con cache strategy
 */
export function createCachedRequest<T>(revalidate: number | false) {
  return {
    get: (endpoint: string, options?: ServerRequestOptions) =>
      serverApi.get<T>(endpoint, { ...options, revalidate }),
  };
}