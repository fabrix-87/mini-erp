import { z } from "zod";
import { companyContactSortFieldSchema, contactSortFieldSchema } from "../validators";

/**
 * Campi ordinabili per Contact
 */
export type ContactSortField = z.infer<typeof contactSortFieldSchema>;
export type CompanyContactSortField = z.infer<typeof companyContactSortFieldSchema>;
export const CONTACT_SORT_FIELDS: Readonly<Set<ContactSortField>> = new Set(
  contactSortFieldSchema.options,
);
