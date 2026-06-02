import { revalidateEntity, revalidateEntityWithList, revalidatePath, revalidateTag } from ".";

// ============================================================================
// Common Entity Revalidators
// ============================================================================

/**
 * Revalidate user-related cache
 */
export const userRevalidation = {
  /** Revalidate specific user detail and path */
  user: (id: number) => revalidateEntity("user", id, { pathRoot: "settings/users" }),

  /** Revalidate users list */
  list: () => revalidateEntity("users", undefined, { pathRoot: "settings/users" }),

  /** Revalidate specific user + list */
  userWithList: (id: number) =>
    revalidateEntityWithList("user", id, {
      tagPrefix: "user",
      pathRoot: "settings/users",
    }),

  /** Revalidate user profile (no path needed) */
  profile: () => revalidateTag("user-profile"),
};

/**
 * Revalidate product-related cache
 */
export const productRevalidation = {
  product: (id: number) => revalidateEntity("product", id),
  list: () => revalidateEntity("products"),
  productWithList: (id: number) => revalidateEntityWithList("product", id),
};

/**
 * Revalidate document-related cache
 */
export const documentRevalidation = {
  document: (id: number) => revalidateEntity("document", id),
  list: () => revalidateEntity("documents"),
  documentWithList: (id: number) => revalidateEntityWithList("document", id),
};

/**
 * Revalidate customer-related cache
 */
export const customerRevalidation = {
  customer: (id: number) => revalidateEntity("customer", id),
  list: () => revalidateEntity("customers"),
  customerWithList: (id: number) => revalidateEntityWithList("customer", id),
};

/**
 * Revalidate supplier-related cache
 */
export const supplierRevalidation = {
  supplier: (id: number) => revalidateEntity("supplier", id),
  list: () => revalidateEntity("suppliers"),
  supplierWithList: (id: number) => revalidateEntityWithList("supplier", id),
};

/**
 * Revalidate role-related cache
 */
export const roleRevalidation = {
  /** Revalidate specific role and roles list */
  role: (id: number) =>
    revalidateEntityWithList("role", id, {
      tagPrefix: "role",
      pathRoot: "settings/roles",
    }),

  /** Revalidate roles list only */
  list: () => revalidateEntity("roles", undefined, { pathRoot: "settings/roles" }),
};

/**
 * Revalidate lead-related cache
 */
export const leadRevalidation = {
  lead: (id: number) => revalidateEntityWithList("lead", id, { pathRoot: "leads" }),
  list: () => revalidateEntity("leads", undefined, { pathRoot: "leads" }),
};

/**
 * Revalidate activity-related cache
 */
export const activityRevalidation = {
  /** Revalidate specific activity detail + lists */
  activity: (id: number) => revalidateEntityWithList("activity", id, { pathRoot: "activities" }),

  /** Revalidate activities list */
  list: () => revalidateEntity("activities", undefined, { pathRoot: "activities" }),

  /** Revalidate activities belonging to a lead (revalidates lead detail page) */
  forLead: (leadId: number) => {
    revalidateTag(`activities-lead-${leadId}`);
    revalidatePath(`/leads/${leadId}`, "page");
  },
};

/**
 * Revalidate contact-related cache
 */
export const contactRevalidation = {
  contact: (id: number) => revalidateEntity("contact", id),
  list: () => revalidateEntity("contacts"),
  contactWithList: (id: number) => revalidateEntityWithList("contact", id),
};