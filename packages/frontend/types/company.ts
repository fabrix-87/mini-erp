import { Address } from "./address";
import { CompanyStatus, CompanyEntityType } from "./company";
import {
  CreditCheckStatus,
  CustomerPriority,
  CustomerSegment,
  CustomerSize,
  LeadStatus,
} from "./customer";

export type {
  CompanyQueryInput,
  CompanyStatus,
  CompanyEntityType,
  Company
} from "@mini-erp/shared/types";

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
  creditStatus?: CreditCheckStatus;
  creditLimit: number;

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
