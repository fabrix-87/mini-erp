// ============================================================================
// COMPANY TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Country } from "./country";
import type { User } from "./user";
import type { Activity } from "./activity";
import type { Document } from "./document";
import type { TenantSettings } from "./tenant";
import Decimal from "decimal.js";
import {
  baseCompanySchema,
  updateCompanySchema,
  companyQueryBaseSchema,
  companyIdSchema,
  companyIdAsCompanyIdSchema,
  createCompanyNoteSchema,
  updateCompanyNoteSchema,
  companyFiltersSchema,
} from "../validators/company";

import { Address } from "./address";
import { Contact } from "./contact";
import { CompanyStatus, CompanyTypeEntity } from "../constants";
import { companyFormSchema } from "../validators";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Company entity (base for Customer and Supplier)
 */
export type Company = Omit<CreateCompanyInput, "legalAddress"> & {
  id: number;
  code: string;
  country: Country;
  assignedUser?: User | null;
  activities: Activity[];
  addresses: Address[];
  legalAddress: Address;
  contacts: Contact[];
  tenants: TenantSettings[];
  documents: Document[];
  notes: CompanyNote[];
  createdAt: Date;
  updatedAt: Date;
};

/** Input type — use with zodResolver in useForm<> generic */
export type CompanyFormInput = z.input<typeof companyFormSchema>;

/** Output type — use everywhere else (mapper, tabs, actions) */
export type CompanyFormValues = z.output<typeof companyFormSchema>;

/**
 * Company Note entity
 */
export type CompanyNote = {
  id: number;
  companyId: number;
  company: Company;
  title: string;
  content: string;
  authorId: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// FILTERS (using z.infer)
// ============================================================================

export type CompanyFilters = z.output<typeof companyFiltersSchema>;

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateCompanyInput = z.infer<typeof baseCompanySchema>;
export type CreateCompanyForm = z.input<typeof baseCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type CreateCompanyNoteInput = z.infer<typeof createCompanyNoteSchema>;
export type UpdateCompanyNoteInput = z.infer<typeof updateCompanyNoteSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type CompanyQueryInput = z.infer<typeof companyQueryBaseSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type CompanyIdParam = z.infer<typeof companyIdSchema>;
export type CompanyIdAsCompanyIdParam = z.infer<typeof companyIdAsCompanyIdSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Company with primary contact
 */
export type CompanyWithPrimaryContact = Company & {
  primaryContact?: Contact;
};

/**
 * Company with full address details
 */
export type CompanyWithAddresses = Company & {
  legalAddress?: Address;
  billingAddress?: Address;
  shippingAddress?: Address;
};

/**
 * Simplified company for list views
 */
export type CompanyListItem = {
  id: number;
  code: string;
  companyName: string;
  tradeName: string | null;
  vatNumber: string | null;
  taxCode: string | null;
  countryCode: string;
  status: CompanyStatus;
  entityType: CompanyTypeEntity;
  mainEmail: string | null;
  mainPhone: string | null;
  totalOrders: number;
  totalRevenue: Decimal;
};

/**
 * Company search result
 */
export type CompanySearchResult = {
  id: number;
  code: string;
  companyName: string;
  vatNumber: string | null;
  taxCode: string | null;
  city: string | null;
  countryCode: string;
};
