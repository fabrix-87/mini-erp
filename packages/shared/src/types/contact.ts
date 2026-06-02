// ============================================================================
// TYPE EXPORTS — contact.ts
// ============================================================================

import { z } from "zod";
import {
  checkEmailSchema,
  companyContactFieldsSchema,
  contactIdSchema,
  contactQuerySchema,
  createCompanyContactSchema,
  createContactSchema,
  toggleContactActiveSchema,
  updateCompanyContactSchema,
  updateContactSchema,
} from "../validators";
import { Activity, ActivityParticipant } from "./activity";
import { Company } from "./company";
import { Document } from "./document";

// ============================================================================
// COMPANY CONTACT (join table)
// ============================================================================

/**
 * Contextual data for a Contact in the scope of a specific Company.
 * Reflects the CompanyContact join table.
 */
export type CompanyContactContext = {
  id: number;
  contactId: number;
  companyId: number;
  isPrimaryContact: boolean;
  position: string | null;
  department: string | null;
  company: Company;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Minimal company reference embedded inside CompanyContactContext.
 * Used when returning a contact with its associated companies.
 */
export type CompanyContactSummary = Pick<
  CompanyContactContext,
  "id" | "companyId" | "isPrimaryContact" | "position" | "department"
> & {
  company: Company;
};

// ============================================================================
// CONTACT
// ============================================================================

/**
 * Full Contact entity as returned by the API.
 * companies contains the list of CompanyContact relations with contextual data.
 */
export type Contact = {
  id: number;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  mobilePhone: string | null;
  active: boolean;
  notes: string | null;
  companies: CompanyContactSummary[];
  documents: Document[];
  activities: Activity[];
  activityParticipants: ActivityParticipant[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Contact with aggregated stats for list views.
 */
export type ContactWithStats = Contact & {
  documentCount: number;
  lastContactDate?: string | null;
};

// ============================================================================
// INPUT TYPES (inferred from validators)
// ============================================================================

export type CreateContactInput = z.output<typeof createContactSchema>;
export type CreateContactForm = z.input<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateCompanyContactInput = z.infer<typeof createCompanyContactSchema>;
export type UpdateCompanyContactInput = z.infer<typeof updateCompanyContactSchema>;
export type CompanyContactFields = z.infer<typeof companyContactFieldsSchema>;

// ============================================================================
// QUERY & PARAM TYPES
// ============================================================================

export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
export type ContactIdParam = z.infer<typeof contactIdSchema>;
export type CheckEmailInput = z.infer<typeof checkEmailSchema>;
export type ToggleContactActiveInput = z.infer<typeof toggleContactActiveSchema>;
