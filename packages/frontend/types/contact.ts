// ============================================================================
// CONTACT TYPES
// types/contact.ts
// ============================================================================

import { Contact, CreateContactInput, UpdateContactInput } from "@mini-erp/shared/types";
import { PaginationInfo } from "./api";
import { ContactSortField, SortOrder } from "@mini-erp/shared/constants";

export type {
  Contact,
  ContactWithStats,
  ContactQueryInput,
  CreateContactInput,
  UpdateContactInput,
} from "@mini-erp/shared/types";

export type { ContactSortField } from "@mini-erp/shared/constants";

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
export interface ContactFilters {
  search?: string;
  companyId?: number;
  active?: boolean;
  isPrimaryContact?: boolean;
  department?: string;
  position?: string;
  page?: number;
}
// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Stato tabella contatti
 */
export interface ContactTableState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  filters: ContactFilters;
  sort: {
    field: ContactSortField;
    order: SortOrder;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  selectedContacts: number[];
}

/**
 * Stato form contatto
 */
export interface ContactFormState {
  values: ContactFormValues;
  errors: ContactFormErrors;
  touched: ContactFormTouched;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Errori form contatto
 */
export interface ContactFormErrors {
  companyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  position?: string;
  department?: string;
  notes?: string;
}

/**
 * Touched fields form
 */
export interface ContactFormTouched {
  companyId?: boolean;
  firstName?: boolean;
  lastName?: boolean;
  email?: boolean;
  phone?: boolean;
  mobilePhone?: boolean;
  position?: boolean;
  department?: boolean;
  notes?: boolean;
}

// ============================================================================
// MODAL & DIALOG TYPES
// ============================================================================

/**
 * Props modale contatto
 */
export interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  companyId?: number;
  mode?: ContactModalMode;
  onSuccess?: (contact: Contact) => void;
}

/**
 * Modalità modale
 */
export type ContactModalMode = "create" | "edit" | "view";

/**
 * Props dialog delete
 */
export interface ContactDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact;
  onConfirm: () => void;
  isDeleting?: boolean;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props ContactCard
 */
export interface ContactCardProps {
  contact: Contact;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onToggleActive?: (contact: Contact) => void;
  onSetPrimary?: (contact: Contact) => void;
  showActions?: boolean;
}

/**
 * Props ContactList
 */
export interface ContactListProps {
  contacts: Contact[];
  loading?: boolean;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onToggleActive?: (contact: Contact) => void;
  onSetPrimary?: (contact: Contact) => void;
  showCompany?: boolean;
}

/**
 * Props ContactTable
 */
export interface ContactTableProps {
  contacts: Contact[];
  loading?: boolean;
  onSort?: (field: ContactSortField) => void;
  sortField?: ContactSortField;
  sortOrder?: SortOrder;
  onEdit?: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
  onView?: (contact: Contact) => void;
  onToggleActive?: (contact: Contact) => void;
  onSetPrimary?: (contact: Contact) => void;
  selectable?: boolean;
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
}

/**
 * Props ContactForm
 */
export interface ContactFormProps {
  contact?: Contact | null;
  isNew?: boolean;
  //companyId?: number;
  //onSubmit: (data: CreateContactInput | UpdateContactInput) => Promise<void>;
  //onCancel: () => void;
  //isSubmitting?: boolean;
}

/**
 * Props ContactFilters
 */
export interface ContactFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
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

// ============================================================================
// HOOKS TYPES
// ============================================================================

/**
 * Return type useContacts hook
 */
export interface UseContactsReturn {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  filters: ContactFilters;
  setFilters: (filters: ContactFilters) => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
  sort: {
    field: ContactSortField;
    order: SortOrder;
  };
  setSort: (field: ContactSortField, order: SortOrder) => void;
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

/**
 * Return type useContactMutations hook
 */
export interface UseContactMutationsReturn {
  createContact: (data: CreateContactInput) => Promise<Contact>;
  updateContact: (id: number, data: UpdateContactInput) => Promise<Contact>;
  deleteContact: (id: number) => Promise<void>;
  toggleActive: (id: number, active: boolean) => Promise<Contact>;
  setPrimary: (id: number) => Promise<Contact>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isToggling: boolean;
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
// ERROR TYPES
// ============================================================================

/**
 * Errore API Contact
 */
export interface ContactApiError {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
  statusCode?: number;
}

/**
 * Tipo errore Contact
 */
export type ContactErrorType =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "DUPLICATE_EMAIL"
  | "PRIMARY_EXISTS"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN_ERROR";

/**
 * Errore dettagliato Contact
 */
export interface ContactError {
  type: ContactErrorType;
  message: string;
  field?: string;
  statusCode?: number;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard per verificare se è un Contact valido
 */
export function isContact(obj: any): obj is Contact {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.companyId === "number" &&
    typeof obj.firstName === "string" &&
    typeof obj.lastName === "string" &&
    typeof obj.email === "string" &&
    typeof obj.isPrimaryContact === "boolean" &&
    typeof obj.active === "boolean"
  );
}

/**
 * Type guard per ContactApiError
 */
export function isContactApiError(obj: any): obj is ContactApiError {
  return (
    obj &&
    typeof obj === "object" &&
    obj.success === false &&
    typeof obj.message === "string"
  );
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
  Pick<Contact, "firstName" | "lastName" | "email" | "companyId">
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
