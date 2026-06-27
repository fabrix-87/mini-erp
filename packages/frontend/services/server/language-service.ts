// services/server/language.ts
import { serverApi } from "@/lib/server/api";
import type { Language } from "@mini-erp/shared/types";
import type { ApiResponse, LanguageQueryInput } from "@mini-erp/shared";
import { LanguageListApiResponse } from "@/types/language";

// ============================================================================
// Cache Tags
// ============================================================================

const LANGUAGE_TAGS = {
  list: "languages-list",
};

// ============================================================================
// READ
// ============================================================================

/**
 * Get all languages with filters and pagination
 * @param params - Query parameters including pagination (page, limit) and filters
 * @param revalidate - Cache revalidation time in seconds, or false to disable
 * @returns {Promise<LanguageListApiResponse>}
 */
export async function getAllLanguages(
  params?: LanguageQueryInput,
  options?: {
    revalidate?: number | false;
  },
): Promise<LanguageListApiResponse> {
  const { page = 1, limit = 20, ...filters } = params || {};

  return serverApi.get<LanguageListApiResponse>("/languages", {
    params: { page, limit, ...filters },
    revalidate: options?.revalidate ?? 3600, // lingue cambiano raramente
    tags: [LANGUAGE_TAGS.list],
    unwrapData: false,
  });
}
