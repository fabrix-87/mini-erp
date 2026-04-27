// ============================================================================
// TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import Decimal from "decimal.js";
import {
  createSupplierSchema,
  updateSupplierSchema,
  updateSupplierCompanySchema,
  updateSupplierRatingSchema,
  supplierQuerySchema,
  supplierIdSchema,
} from "../validators/supplier";
import { Company } from "./company";
import { Document } from "./document";
import { TaxRule } from "./tax";
import { Product } from "./product";
import { User } from "./user";
import { StockBatch } from "./warehouse";

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Supplier entity
 */
export type Supplier = Omit<CreateSupplierInput, "company"> & {
  id: number;
  companyId: number;
  company: Company;
  supplierTaxRule?: TaxRule | null;
  documentsIn: Document[];
  products: Product[];
  stockBatchs: StockBatch[];
  deletedBy?: number | null;
  deletedByUser?: User | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Tracking fields from schema
  firstOrderDate: Date | null;
  lastOrderDate: Date | null;
  totalOrders: number;
  totalSpent: Decimal;
  rating: number | null;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type CreateSupplierForm = z.input<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type UpdateSupplierCompanyInput = z.infer<
  typeof updateSupplierCompanySchema
>;
export type UpdateSupplierRatingInput = z.infer<
  typeof updateSupplierRatingSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type SupplierIdParam = z.infer<typeof supplierIdSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Supplier with company details
 */
export type SupplierWithCompany = Supplier & {
  company: Company;
};

/**
 * Simplified supplier for list views
 */
export type SupplierListItem = {
  id: number;
  companyId: number;
  companyName: string;
  tradeName: string | null;
  rating: number | null;
  leadTimeDays: number | null;
  totalOrders: number;
  totalSpent: Decimal;
  lastOrderDate: Date | null;
  countryCode: string;
};

/**
 * Supplier performance metrics
 */
export interface SupplierPerformanceMetrics {
  supplierId: number;
  rating: number;
  onTimeDeliveryRate: number; // percentage
  qualityScore: number; // 0-100
  averageLeadTime: number; // days
  totalOrders: number;
  totalSpent: Decimal;
  averageOrderValue: Decimal;
  lastOrderDate: Date | null;
  defectRate: number; // percentage
  responseTime: number; // hours
}

/**
 * Supplier statistics
 */
export interface SupplierStats {
  totalSuppliers: number;
  activeSuppliers: number;
  averageRating: number;
  totalSpent: Decimal;
  averageLeadTime: number;
  byRating: Record<number, number>; // rating (1-5) -> count
  byCountry: Record<string, number>; // countryCode -> count
}

/**
 * Supplier comparison
 */
export interface SupplierComparison {
  supplierId: number;
  companyName: string;
  rating: number | null;
  leadTimeDays: number | null;
  averagePrice: Decimal;
  onTimeDeliveryRate: number;
  qualityScore: number;
  totalOrders: number;
}

/**
 * Supplier evaluation criteria
 */
export interface SupplierEvaluationCriteria {
  priceWeight: number; // 0-100
  qualityWeight: number; // 0-100
  deliveryWeight: number; // 0-100
  serviceWeight: number; // 0-100
}

/**
 * Supplier evaluation result
 */
export interface SupplierEvaluationResult {
  supplierId: number;
  totalScore: number; // 0-100
  priceScore: number;
  qualityScore: number;
  deliveryScore: number;
  serviceScore: number;
  recommendation: "excellent" | "good" | "acceptable" | "poor";
}
