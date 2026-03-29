// services/server/language.ts
import { serverApi } from "@/lib/server/api";
import type { Language } from "@mini-erp/shared/types";
import type { ApiResponse } from "@mini-erp/shared";

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
 * Get all available languages
 */
export async function getAllLanguages(options?: {
  revalidate?: number | false;
}): Promise<ApiResponse<Language[]>> {
  return serverApi.get<ApiResponse<Language[]>>("/languages", {
    revalidate: options?.revalidate ?? 3600, // lingue cambiano raramente
    tags: [LANGUAGE_TAGS.list],
    unwrapData: false,
  });
}
