// ============================================================================
// TYPES & INTERFACES
// ============================================================================

import { ValidationError } from "@mini-erp/shared";

export interface CompanyFilters {
  search?: string;
  status?: string;
  entityType?: string;
  countryCode?: string;
  assignedUserId?: number;
}

export interface CustomerFilters extends CompanyFilters {
  type?: string;
  priority?: string;
  segment?: string;
  leadStatus?: string;
  creditStatus?: string;
}

export interface SupplierFilters extends CompanyFilters {
  minRating?: number;
  hasProducts?: boolean;
}

export interface AddressFilters {
  companyId?: number;
  addressType?: string;
  countryCode?: string;
  isPrimary?: boolean;
}

// Interfacce di ritorno per le utility di validazione
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}