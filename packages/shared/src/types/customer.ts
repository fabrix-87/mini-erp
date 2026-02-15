// ============================================================================
// TYPE EXPORTS
// ============================================================================

import {z} from "zod";
import { Company } from "./company";
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerCompanySchema,
  customerQuerySchema,
  customerIdSchema,
} from "../validators/customer";
import { Document } from "./document";
import { Opportunity } from "./opportunity";
import { Activity } from "./activity";
import { TaxRule } from "./tax";
import {
  CreditCheckStatus,
  CustomerPriority,
  CustomerSegment,
  CustomerType,
} from "../constants/customer";
import { PriceList } from "./pricelist";
import { PaymentMethod } from "./payment";
import Decimal from "decimal.js";
import { User } from "./user";
import { Lead } from "./lead";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Customer entity
 */
export type Customer = Omit<CreateCustomerInput, "company"> & {
  id: number;
  companyId: number;
  company: Company;
  // Dati Commerciali
  defaultPriceList?: PriceList | null;
  customerTaxRule?: TaxRule | null;
  paymentMethod?: PaymentMethod | null;
  // Relazioni a documenti e attività di Vendita
  documentsOut: Document[];
  opportunities: Opportunity[];
  activities: Activity[];

  convertedFromLead?: Lead | null;
  deletedBy?: number | null;
  deletedByUser?: User | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Tracking fields from schema
  firstSaleDate: Date | null;
  lastSaleDate: Date | null;
  totalSales: number;
  totalRevenue: Decimal;
  customerSince: Date | null;
  lastInteractionAt: Date | null;
  averageOrderValue: Decimal;
  lifetimeValue: Decimal;
  churnRisk: number;
  healthScore: number;
  npsScore: number | null;
  satisfactionRate: Decimal | null;
  lastSurveyDate: Date | null;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerCompanyInput = z.infer<
  typeof updateCustomerCompanySchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type CustomerIdParam = z.infer<typeof customerIdSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Customer with company details
 */
export type CustomerWithCompany = Customer & {
  company: Company;
};

/**
 * Simplified customer for list views
 */
export type CustomerListItem = {
  id: number;
  companyId: number;
  companyName: string;
  tradeName: string | null;
  type: CustomerType;
  priority: CustomerPriority;
  segment: CustomerSegment;
  creditStatus: CreditCheckStatus;
  totalSales: number;
  totalRevenue: Decimal;
  lastSaleDate: Date | null;
  healthScore: number;
  countryCode: string;
};

/**
 * Customer statistics
 */
export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalRevenue: Decimal;
  averageOrderValue: Decimal;
  averageLifetimeValue: Decimal;
  bySegment: Record<CustomerSegment, number>;
  byPriority: Record<CustomerPriority, number>;
  churnRate: number;
}

/**
 * Customer health metrics
 */
export interface CustomerHealthMetrics {
  customerId: number;
  healthScore: number;
  churnRisk: number;
  lastInteractionDays: number;
  daysSinceLastOrder: number;
  orderFrequency: number;
  averageOrderValue: Decimal;
  totalRevenue: Decimal;
  npsScore: number | null;
  satisfactionRate: Decimal | null;
}

/**
 * Customer conversion funnel
 */
export interface CustomerConversionFunnel {
  leads: number;
  prospects: number;
  customers: number;
  partners: number;
  conversionRate: number;
  averageConversionTime: number; // days
}