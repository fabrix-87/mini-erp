// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import { Company } from "./company";
import {
  createCustomerSchema,
  updateCustomerSchema,
  updateCustomerCompanySchema,
  customerQuerySchema,
  customerIdSchema,
  customerFiltersSchema,
} from "../validators/customer";
import { Document } from "./document";
import { Opportunity } from "./opportunity";
import { Activity } from "./activity";
import { TaxRule } from "./tax";
import {
  CreditCheckStatus,
  CustomerPriority,
  CustomerSegment,
  CustomerSize,
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
export type Customer = {
  id: string;
  companyId: string;
  company: Company;
  // Dati specifici Cliente/CRM
  priority: CustomerPriority;
  segment: CustomerSegment;
  size: CustomerSize;
  type: CustomerType;
  creditStatus: CreditCheckStatus;

  // Dati Commerciali
  defaultPriceListId?: string | null;
  defaultPriceList?: PriceList | null;
  customerTaxRuleId?: number | null;
  customerTaxRule?: TaxRule | null;
  paymentMethodId?: string | null;
  paymentMethod?: PaymentMethod | null;

  creditLimit?: Decimal | null;

  // Tracking fields from schema
  firstSaleDate: Date | null;
  lastSaleDate: Date | null;
  totalSales: number;
  totalRevenue: Decimal;

  // Date estese
  customerSince: Date | null;
  lastInteractionAt: Date | null;

  // Metriche calcolate
  averageOrderValue: Decimal;
  lifetimeValue: Decimal;

  // Score predittivi
  churnRisk: number;
  healthScore: number;

  // NPS e soddisfazione
  npsScore: number | null;
  satisfactionRate: Decimal | null;
  lastSurveyDate: Date | null;

  // Relazioni a documenti e attività di Vendita
  documentsOut: Document[];
  opportunities: Opportunity[];
  activities: Activity[];

  // Relazioni tra clienti (gruppi e gerarchie)
  parentCustomerId?: string | null;
  parentCustomer?: Customer;
  subsidiaries?: Customer[];

  // Lead convertita in questo customer
  convertedFromLead?: Lead | null;

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Safe delete
  deletedBy?: number | null;
  deletedByUser?: User | null;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateCustomerForm = z.input<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type UpdateCustomerCompanyInput = z.infer<typeof updateCustomerCompanySchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
export type CustomerFilters = z.output<typeof customerFiltersSchema>;

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
