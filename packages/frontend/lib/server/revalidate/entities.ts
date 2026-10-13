// lib/server/revalidate/entities.ts
import { revalidateEntity, revalidateEntityWithList } from ".";

// ============================================================================
// Common Entity Revalidators
// ============================================================================

/**
 * Revalidate document-related cache.
 * NOTE: "documents" is not yet in NAVIGATION_TREE — using pathRoot fallback.
 * @todo Add "documents" to NAVIGATION_TREE and migrate to routeKey.
 */
export const documentRevalidation = {
  /** Revalidate specific document detail and path. */
  document: (id: number) => revalidateEntity("documents", id),

  /** Revalidate documents list. */
  list: () => revalidateEntity("documents"),

  /** Revalidate specific document and documents list. */
  documentWithList: (id: number) =>
    revalidateEntityWithList("documents", id),
};