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
} from "../validators/company";

import { Address } from "./address";
import { Contact } from "./contact";
import { CompanyStatus, CompanyTypeEntity } from "../constants";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Company entity (base for Customer and Supplier)
 */
export type Company = CreateCompanyInput & {
  id: number;
  code: string;
  country: Country;
  assignedUser?: User | null;
  activities: Activity[];
  addresses: Address[];
  contacts: Contact[];
  customers: Customer[];
  suppliers: Supplier[];
  tenants: TenantSettings[];
  documents: Document[];
  notes: CompanyNote[];
  createdAt: Date;
  updatedAt: Date;
  firstOrderDate: Date | null;
  totalOrders: number;
  totalRevenue: Decimal;
};

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
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateCompanyInput = z.infer<typeof baseCompanySchema>;
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
export type CompanyIdAsCompanyIdParam = z.infer<
  typeof companyIdAsCompanyIdSchema
>;
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

// Forward declarations for circular dependencies
type Customer = any; // Will be defined in customer.ts
type Supplier = any; // Will be defined in supplier.ts
