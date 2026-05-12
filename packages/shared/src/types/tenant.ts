// ============================================================================
// TENANT SETTINGS TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Company } from "./company";
import type { TaxRule } from "./tax";
import type { Language } from "./language";
import {
  createTenantSettingsSchema,
  updateTenantSettingsSchema,
  updateTaxDefaultsSchema,
  updateSdiConfigSchema,
  updateRegionalSettingsSchema,
  tenantSettingsQuerySchema,
  tenantIdParamSchema,
  tenantCodeParamSchema,
  testSdiConfigSchema,
} from "../validators/tenant";
import type { SdiTransmissionFormat, TenantStatus, TenantPlan, TaxRegime } from "../constants";

// ============================================================================
// BASE ENTITY TYPE  (mirrors Prisma model Tenant)
// ============================================================================

/**
 * Core Tenant entity — mirrors the Prisma `Tenant` model.
 * Represents the SaaS operational identity that owns documents and numeric sequences.
 */
export interface Tenant {
  id: number;
  code: string;
  status: TenantStatus;
  plan: TenantPlan;
  companyId: number;
  taxRegime: TaxRegime;
  defaultSalesTaxRuleId: number | null;
  defaultPurchasesTaxRuleId: number | null;
  defaultCurrency: string;
  defaultLanguageId: number | null;
  sdiTransmissionFormat: SdiTransmissionFormat | null;
  sdiCertificatePath: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tenant with all related entities eagerly loaded.
 */
export interface TenantWithRelations extends Tenant {
  company: Company;
  defaultSalesTaxRule: TaxRule | null;
  defaultPurchasesTaxRule: TaxRule | null;
  defaultLanguage: Language | null;
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Tenant Settings entity (represents the company that issues invoices)
 */
export type TenantSettings = Omit<CreateTenantSettingsInput, "tenantCode"> & {
  id: number;
  tenantCode: string | null;
  company?: Company | null;
  defaultSalesTaxRule?: TaxRule | null;
  defaultPurchasesTaxRule?: TaxRule | null;
  defaultLanguage?: Language | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateTenantSettingsInput = z.infer<typeof createTenantSettingsSchema>;
export type UpdateTenantSettingsInput = z.infer<typeof updateTenantSettingsSchema>;
export type UpdateTaxDefaultsInput = z.infer<typeof updateTaxDefaultsSchema>;
export type UpdateSdiConfigInput = z.infer<typeof updateSdiConfigSchema>;
export type UpdateRegionalSettingsInput = z.infer<typeof updateRegionalSettingsSchema>;
export type TestSdiConfigInput = z.infer<typeof testSdiConfigSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type TenantSettingsQueryInput = z.infer<typeof tenantSettingsQuerySchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type TenantIdParam = z.infer<typeof tenantIdParamSchema>;
export type TenantCodeParam = z.infer<typeof tenantCodeParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Tenant Settings with full company details
 */
export type TenantSettingsWithCompany = TenantSettings & {
  company: Company;
};

/**
 * Tenant Settings with all defaults loaded
 */
export type TenantSettingsComplete = TenantSettings & {
  company: Company;
  defaultSalesTaxRule: TaxRule;
  defaultPurchasesTaxRule: TaxRule;
  defaultLanguage: Language;
};

/**
 * Tenant configuration summary
 */
export interface TenantConfigSummary {
  tenantId: number;
  tenantCode: string | null;
  companyName: string;
  companyVatNumber: string | null;
  companyTaxCode: string | null;
  countryCode: string;
  defaultCurrency: string;
  defaultLanguage: string | null;
  taxRegime: TaxRegime | null;
  hasSdiConfiguration: boolean;
  hasDefaultSalesTaxRule: boolean;
  hasDefaultPurchasesTaxRule: boolean;
  isConfigurationComplete: boolean;
  missingConfigurations: string[];
}

/**
 * Tenant invoice settings
 */
export interface TenantInvoiceSettings {
  tenantId: number;
  // Company data (from related Company)
  companyName: string;
  vatNumber: string | null;
  taxCode: string | null;
  sdiCode: string | null;
  pec: string | null;
  fiscalAddress: string | null;
  // Tax settings
  taxRegime: string | null;
  defaultSalesTaxRule: TaxRule | null;
  defaultPurchasesTaxRule: TaxRule | null;
  // SDI configuration
  sdiTransmissionFormat: SdiTransmissionFormat | null;
  sdiCertificatePath: string | null;
  isSdiEnabled: boolean;
}

/**
 * Tenant regional settings
 */
export interface TenantRegionalSettings {
  tenantId: number;
  defaultCurrency: string;
  defaultCurrencySymbol: string;
  defaultLanguage: Language | null;
  defaultLanguageCode: string | null;
  countryCode: string;
  timezone: string | null;
  dateFormat: string;
  timeFormat: string;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
}

/**
 * Tenant onboarding status
 */
export interface TenantOnboardingStatus {
  tenantId: number;
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  pendingSteps: string[];
  isComplete: boolean;
  completionPercentage: number;
  steps: {
    companyInfo: boolean;
    fiscalData: boolean;
    taxDefaults: boolean;
    regionalSettings: boolean;
    sdiConfiguration: boolean;
    documentNumbering: boolean;
  };
}

/**
 * SDI configuration validation result
 */
export interface SdiConfigValidation {
  isValid: boolean;
  hasCertificate: boolean;
  hasTransmissionFormat: boolean;
  certificateExpiry: Date | null;
  certificateValid: boolean;
  errors: string[];
  warnings: string[];
  lastTestDate: Date | null;
  lastTestSuccess: boolean;
}

/**
 * Tenant statistics
 */
export interface TenantStats {
  tenantId: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  totalInvoicesIssued: number;
  totalInvoicesReceived: number;
  totalRevenue: number;
  totalExpenses: number;
  activeUsers: number;
  storageUsed: number; // in bytes
  apiCallsThisMonth: number;
  createdAt: Date;
  daysActive: number;
}

/**
 * Multi-tenant context (if using multi-tenancy)
 */
export interface TenantContext {
  tenantId: number;
  tenantCode: string;
  companyId: number;
  companyName: string;
  settings: TenantSettings;
  permissions: string[];
  features: string[];
}

/**
 * Tenant feature flags
 */
export interface TenantFeatureFlags {
  tenantId: number;
  features: {
    electronicInvoicing: boolean;
    multiCurrency: boolean;
    multiWarehouse: boolean;
    advancedReporting: boolean;
    apiAccess: boolean;
    customFields: boolean;
    webhooks: boolean;
    automation: boolean;
    aiAssistant: boolean;
  };
  limits: {
    maxUsers: number;
    maxCustomers: number;
    maxProducts: number;
    maxInvoicesPerMonth: number;
    maxStorageGB: number;
    maxApiCallsPerDay: number;
  };
  plan: TenantPlan;
}

/**
 * Tenant backup configuration
 */
export interface TenantBackupConfig {
  tenantId: number;
  autoBackupEnabled: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  retentionDays: number;
  lastBackupDate: Date | null;
  lastBackupSize: number | null; // in bytes
  backupLocation: string | null;
  encryptionEnabled: boolean;
}
