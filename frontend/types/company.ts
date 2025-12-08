import { Address } from "./address";
import { CreditCheckStatus, CustomerPriority, CustomerSegment, CustomerSize, LeadStatus } from "./customer";

export type CompanyEntityType = "JURIDICAL" | "NATURAL" | "FOREIGN";
export type CompanyStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
export type CompanyType =
  | "LEAD"
  | "PROSPECT"
  | "CUSTOMER"
  | "PARTNER"
  | "OTHER"
  | "SUPPLIER";

// Base Company interface (shared between Customer and Supplier)
export interface BaseCompany {
  id: number;
  code: string;
  companyName: string;
  tradeName?: string;
  legalForm?: string;
  status: CompanyStatus;
  entityType: CompanyEntityType;
  
  // Fiscal data
  vatNumber?: string;
  taxCode?: string;
  sdiCode?: string;
  pec?: string;
  eoriNumber?: string;
  vatId?: string;
  countryCode: string;
  
  // Contact info
  mainEmail?: string;
  mainPhone?: string;
  
  // Legal address (snapshot)
  legalAddressId?: number;
  legalAddress?: Partial<Address>;
  
  // Metadata
  customFields?: any;
  createdAt: string;
  updatedAt: string;
}

// Form data (used in the form component)
export interface CompanyFormData {
  // Company base
  companyName: string;
  tradeName?: string;
  legalForm?: string;
  entityType: CompanyEntityType;
  status: CompanyStatus;
  
  // Fiscal data
  vatNumber?: string;
  taxCode?: string;
  sdiCode?: string;
  pec?: string;
  eoriNumber?: string;
  vatId?: string;
  countryCode: string;
  
  // Contact info
  mainEmail?: string;
  mainPhone?: string;
  
  // Legal address
  legalAddressId?: number;
  legalAddress?: Partial<Address>;
  
  // Customer specific
  priority?: CustomerPriority;
  segment?: CustomerSegment;
  leadStatus?: LeadStatus;
  size?: CustomerSize;
  type?: CompanyType;
  creditStatus?: CreditCheckStatus;
  creditLimit?: number;
  
  // Supplier specific
  paymentTerms?: string;
  leadTimeDays?: number;
  rating?: number;
  
  // Tracking (read-only in form)
  totalSales?: number;
  totalRevenue?: string;
  totalOrders?: number;
  totalSpent?: string;
  
  // Metadata
  customFields?: any;
}