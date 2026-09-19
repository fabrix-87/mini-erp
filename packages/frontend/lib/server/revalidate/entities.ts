// lib/server/revalidate/entities.ts
import { CONTACT_TAGS } from "@/types/contact-types";
import { revalidateEntity, revalidateEntityWithList, revalidatePath, revalidateTag } from ".";
import { ACTIVITY_TAGS } from "@/types/activitiy-types";
import { USER_TAGS } from "@/types/user-types";

// ============================================================================
// Common Entity Revalidators
// ============================================================================

/**
 * Revalidate product-related cache.
 * Route: /catalog/products
 */
export const productRevalidation = {
  /** Revalidate specific product detail and path. */
  product: (id: number) => revalidateEntity("products", id),

  /** Revalidate products list. */
  list: () => revalidateEntity("products"),

  /** Revalidate specific product and products list. */
  productWithList: (id: number) =>
    revalidateEntityWithList("products", id),
};

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