// lib/server/revalidate/entities.ts
import { revalidateEntity, revalidateEntityWithList, revalidatePath, revalidateTag } from ".";

// ============================================================================
// Common Entity Revalidators
// ============================================================================

/**
 * Revalidate user-related cache.
 * Route: /admin/users
 */
export const userRevalidation = {
  /** Revalidate specific user detail and path. */
  user: (id: string) => revalidateEntity("user", id, { routeKey: "users" }),

  /** Revalidate users list. */
  list: () => revalidateEntity("user", undefined, { routeKey: "users" }),

  /** Revalidate specific user and users list. */
  userWithList: (id: string) => revalidateEntityWithList("user", id, { routeKey: "users" }),

  /** Revalidate user profile tag only (no path needed). */
  profile: () => revalidateTag("user-profile"),
};

/**
 * Revalidate role-related cache.
 * Route: /admin/roles
 */
export const roleRevalidation = {
  /** Revalidate specific role detail and roles list. */
  role: (id: number) => revalidateEntityWithList("role", id, { routeKey: "roles" }),

  /** Revalidate roles list only. */
  list: () => revalidateEntity("role", undefined, { routeKey: "roles" }),
};

/**
 * Revalidate lead-related cache.
 * Route: /crm/leads
 */
export const leadRevalidation = {
  /** Revalidate specific lead detail and leads list. */
  lead: (id: number) => revalidateEntityWithList("lead", id, { routeKey: "leads" }),

  /** Revalidate leads list. */
  list: () => revalidateEntity("lead", undefined, { routeKey: "leads" }),
};

/**
 * Revalidate customer-related cache.
 * Route: /crm/customers
 */
export const customerRevalidation = {
  /** Revalidate specific customer detail and path. */
  customer: (id: number) => revalidateEntity("customer", id, { routeKey: "customers" }),

  /** Revalidate customers list. */
  list: () => revalidateEntity("customer", undefined, { routeKey: "customers" }),

  /** Revalidate specific customer and customers list. */
  customerWithList: (id: number) =>
    revalidateEntityWithList("customer", id, { routeKey: "customers" }),
};

/**
 * Revalidate supplier-related cache.
 * Route: /crm/suppliers
 */
export const supplierRevalidation = {
  /** Revalidate specific supplier detail and path. */
  supplier: (id: number) => revalidateEntity("supplier", id, { routeKey: "suppliers" }),

  /** Revalidate suppliers list. */
  list: () => revalidateEntity("supplier", undefined, { routeKey: "suppliers" }),

  /** Revalidate specific supplier and suppliers list. */
  supplierWithList: (id: number) =>
    revalidateEntityWithList("supplier", id, { routeKey: "suppliers" }),
};

/**
 * Revalidate contact-related cache.
 * Route: /crm/contacts
 */
export const contactRevalidation = {
  /** Revalidate specific contact detail and path. */
  contact: (id: string) => revalidateEntity("contact", id, { routeKey: "contacts" }),

  /** Revalidate contacts list. */
  list: () => revalidateEntity("contact", undefined, { routeKey: "contacts" }),

  /** Revalidate specific contact and contacts list. */
  contactWithList: (id: string) =>
    revalidateEntityWithList("contact", id, { routeKey: "contacts" }),
};

/**
 * Revalidate activity-related cache.
 * Route: /activities
 */
export const activityRevalidation = {
  /** Revalidate specific activity detail and activities list. */
  activity: (id: number) => revalidateEntityWithList("activity", id, { routeKey: "activities" }),

  /** Revalidate activities list. */
  list: () => revalidateEntity("activity", undefined, { routeKey: "activities" }),

  /**
   * Revalidate activities belonging to a specific lead.
   * Invalidates the lead detail page and the activities-lead tag.
   */
  forLead: (leadId: number) => {
    revalidateTag(`activities-lead-${leadId}`);
    revalidatePath(`/crm/leads/${leadId}`, "page");
  },
};

/**
 * Revalidate product-related cache.
 * Route: /catalog/products
 */
export const productRevalidation = {
  /** Revalidate specific product detail and path. */
  product: (id: number) => revalidateEntity("product", id, { routeKey: "products" }),

  /** Revalidate products list. */
  list: () => revalidateEntity("product", undefined, { routeKey: "products" }),

  /** Revalidate specific product and products list. */
  productWithList: (id: number) =>
    revalidateEntityWithList("product", id, { routeKey: "products" }),
};

/**
 * Revalidate document-related cache.
 * NOTE: "documents" is not yet in NAVIGATION_TREE — using pathRoot fallback.
 * @todo Add "documents" to NAVIGATION_TREE and migrate to routeKey.
 */
export const documentRevalidation = {
  /** Revalidate specific document detail and path. */
  document: (id: number) => revalidateEntity("document", id, { pathRoot: "documents" }),

  /** Revalidate documents list. */
  list: () => revalidateEntity("document", undefined, { pathRoot: "documents" }),

  /** Revalidate specific document and documents list. */
  documentWithList: (id: number) =>
    revalidateEntityWithList("document", id, { pathRoot: "documents" }),
};

/**
 * Revalidate settings-related cache for the current user.
 * Route: /settings/profile
 */
export const settingsRevalidation = {
  /** Revalidate user profile tag (shared with userRevalidation). */
  profile: () => revalidateTag('user-profile'),

  /** Revalidate user settings tag. */
  settings: () => revalidateTag('user-settings'),

  /** Revalidate both profile and settings. */
  all: () => {
    revalidateTag('user-profile');
    revalidateTag('user-settings');
  },
};