import { BaseCompany, CompanyStatus, CompanyType } from "./company";

// Customer specific fields
export interface Customer extends BaseCompany {
  companyId: number;
  priority: CustomerPriority;
  segment: CustomerSegment;
  leadStatus: LeadStatus;
  size: CustomerSize;
  type: CompanyType;
  creditStatus: CreditCheckStatus;
  creditLimit?: number;

  // Relations
  defaultPriceListId?: number;
  customerTaxRuleId?: number;
  paymentMethodId?: number;

  // Tracking
  firstSaleDate?: string;
  lastSaleDate?: string;
  totalSales: number;
  totalRevenue: string;

  company?: BaseCompany;
}

// Stats interfaces
export interface CustomerStats {
  total: number;
  byType: Record<CompanyType, number>;
  bySegment: Record<CustomerSegment, number>;
  byLeadStatus: Record<LeadStatus, number>;
  totalRevenue: number;
  avgOrderValue: number;
}

// Customer specific types
export type CustomerPriority = "LOW" | "MEDIUM" | "HIGH";

export type CustomerSegment = "VIP" | "GOLD" | "SILVER" | "BRONZE" | "STANDARD";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "PROPOSAL"
  | "NEGOTIATION"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export type CreditCheckStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "IN_PROGRESS";

export type CustomerSize =
  | "MICRO"
  | "SMALL"
  | "MEDIUM"
  | "LARGE"
  | "ENTERPRISE";

// Query params
export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  entityType?: CompanyStatus;
  countryCode?: string;
  assignedUserId?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  type?: CompanyType;
  priority?: CustomerPriority;
  segment?: CustomerSegment;
  leadStatus?: LeadStatus;
  creditStatus?: CreditCheckStatus;
  size?: CustomerSize;
  priceListId?: number;
  hasOrders?: "true" | "false";
  hasOpportunities?: "true" | "false";
}
