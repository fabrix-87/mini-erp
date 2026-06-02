// ============================================================================
// CONTACT TYPES
// types/contact.ts
// ============================================================================

import { Contact, CreateContactInput, UpdateContactInput } from "@mini-erp/shared/types";
import { ApiResponse, PaginatedResponse, PaginationInfo } from "./api";
import { ContactSortField, SortOrder } from "@mini-erp/shared/constants";
import { ContactQueryInput } from "@mini-erp/shared";

export type {
  Contact,
  ContactWithStats,
  ContactQueryInput,
  CreateContactInput,
  UpdateContactInput,
} from "@mini-erp/shared/types";

export type { ContactSortField } from "@mini-erp/shared/constants";

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export type ContactListApiResponse = PaginatedResponse<Contact>;
export interface ContactSingleApiResponse extends ApiResponse<Contact> {}
export interface ContactOperationApiResponse extends ApiResponse<Contact> {}
export interface ContactDeleteApiResponse extends ApiResponse<null> {}

/**
 * Company info minima per Contact
 */
export interface ContactCompany {
  id: number;
  code: string;
  companyName: string;
  tradeName?: string | null;
  mainEmail?: string | null;
  mainPhone?: string | null;
}

/**
 * Document info minima per Contact
 */
export interface ContactDocument {
  id: number;
  documentNumber?: string | null;
  documentType: string;
  documentDate: string;
  totalAmount: number;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

/**
 * Form values per Contact
 */
export interface ContactFormValues {
  companyId: string; // String per select/input
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobilePhone: string;
  position: string;
  department: string;
  isPrimaryContact: boolean;
  active: boolean;
  notes: string;
}

// ============================================================================
// QUERY & FILTER TYPES
// ============================================================================

/**
 * Filtri per Contact
 */
export interface ContactFiltersType {
  search?: string;
  companyId?: number;
  active?: boolean;
  isPrimaryContact?: boolean;
  department?: string;
  position?: string;
  page?: number;
}

/**
 * Props ContactForm
 */
export interface ContactFormProps {
  contact?: Contact | null;
  isNew?: boolean;
  companyId?: string;
}

/**
 * Props ContactFilters
 */
export interface ContactFiltersProps {
  filters: ContactQueryInput;
  onFiltersChange: (filters: ContactFiltersType) => void;
  onReset: () => void;
  showCompanyFilter?: boolean;
}

/**
 * Props ContactSearch
 */
export interface ContactSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Return type useContact hook
 */
export interface UseContactReturn {
  contact: Contact | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Opzione select per Contact
 */
export interface ContactOption {
  value: number;
  label: string;
  email: string;
  isPrimary: boolean;
  active: boolean;
}

/**
 * Dati aggregati per statistiche
 */
export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  primary: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
}

/**
 * Validazione email
 */
export interface ContactValidation {
  isEmailUnique: (
    email: string,
    companyId: number,
    contactId?: number,
  ) => Promise<boolean>;
  isPrimaryExists: (companyId: number, contactId?: number) => Promise<boolean>;
}

/**
 * Export dati contatto
 */
export interface ContactExport {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  position?: string;
  department?: string;
  companyName: string;
  isPrimary: string;
  status: string;
  createdAt: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Contatto parziale per update
 */
export type PartialContact = Partial<Contact>;

/**
 * Contatto senza metadati
 */
export type ContactData = Omit<Contact, "id" | "createdAt" | "updatedAt">;

/**
 * Contatto con campi required
 */
export type RequiredContact = Required<
  Pick<Contact, "firstName" | "lastName" | "email">
>;

/**
 * Tipo per bulk operations
 */
export interface ContactBulkOperation {
  contactIds: number[];
  operation: "activate" | "deactivate" | "delete";
}

/**
 * Risultato bulk operation
 */
export interface ContactBulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: string[];
}
