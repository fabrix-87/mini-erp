// ============================================================================
// INTRASTAT TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Document, DocumentLine } from "./document";
import type { ProductVariant } from "./product";
import Decimal from "decimal.js";
import {
  intrastatFlowSchema,
  transportModeSchema,
  reportingFrequencySchema,
  createIntrastatTransactionSchema,
  updateIntrastatTransactionSchema,
  createTransactionCodeSchema,
  updateTransactionCodeSchema,
  createCommodityCodeSchema,
  updateCommodityCodeSchema,
  bulkCreateTransactionsSchema,
  bulkUpdateTransactionsSchema,
  bulkDeleteTransactionsSchema,
  intrastatTransactionQuerySchema,
  commodityCodeQuerySchema,
  transactionCodeQuerySchema,
  intrastatTransactionIdParamSchema,
  transactionCodeParamSchema,
  commodityCodeParamSchema,
  intrastatReportQuerySchema,
  intrastatDeclarationSchema,
  validateTransactionsSchema,
  intrastatStatsSchema,
} from "../validators/intrastat";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type IntrastatFlow = z.infer<typeof intrastatFlowSchema>;
export type TransportMode = z.infer<typeof transportModeSchema>;
export type ReportingFrequency = z.infer<typeof reportingFrequencySchema>;

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Intrastat Transaction entity
 */
export type IntrastatTransaction = {
  id: number;
  documentId: number;
  document: Document;
  documentLineId: number;
  documentLine: DocumentLine;
  flow: IntrastatFlow;
  transactionDate: Date;
  transactionCode: string;
  transCodeRel: IntrastatTransactionCode;
  commodityCode: string;
  commCodeRel: IntrastatCommodityCode;
  partnerCountryCode: string;
  invoicedValue: Decimal;
  statisticalValue: Decimal;
  netMass: Decimal;
  supplementaryUnits: number | null;
  modeOfTransport: string | null;
  isCorrection: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Intrastat Transaction Code entity
 */
export type IntrastatTransactionCode = {
  code: string;
  descriptionIT: string;
  descriptionEN: string;
  transactions: IntrastatTransaction[];
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Intrastat Commodity Code entity (NC8)
 */
export type IntrastatCommodityCode = {
  code: string;
  descriptionIT: string;
  descriptionEN: string;
  productVariants: ProductVariant[];
  transactions: IntrastatTransaction[];
  createdAt: Date;
  updatedAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateIntrastatTransactionInput = z.infer<
  typeof createIntrastatTransactionSchema
>;
export type UpdateIntrastatTransactionInput = z.infer<
  typeof updateIntrastatTransactionSchema
>;

export type CreateTransactionCodeInput = z.infer<
  typeof createTransactionCodeSchema
>;
export type UpdateTransactionCodeInput = z.infer<
  typeof updateTransactionCodeSchema
>;

export type CreateCommodityCodeInput = z.infer<
  typeof createCommodityCodeSchema
>;
export type UpdateCommodityCodeInput = z.infer<
  typeof updateCommodityCodeSchema
>;

export type BulkCreateTransactionsInput = z.infer<
  typeof bulkCreateTransactionsSchema
>;
export type BulkUpdateTransactionsInput = z.infer<
  typeof bulkUpdateTransactionsSchema
>;
export type BulkDeleteTransactionsInput = z.infer<
  typeof bulkDeleteTransactionsSchema
>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type IntrastatTransactionQueryInput = z.infer<
  typeof intrastatTransactionQuerySchema
>;
export type CommodityCodeQueryInput = z.infer<typeof commodityCodeQuerySchema>;
export type TransactionCodeQueryInput = z.infer<
  typeof transactionCodeQuerySchema
>;
export type IntrastatReportQueryInput = z.infer<
  typeof intrastatReportQuerySchema
>;
export type IntrastatDeclarationInput = z.infer<
  typeof intrastatDeclarationSchema
>;
export type ValidateTransactionsInput = z.infer<
  typeof validateTransactionsSchema
>;
export type IntrastatStatsInput = z.infer<typeof intrastatStatsSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type IntrastatTransactionIdParam = z.infer<
  typeof intrastatTransactionIdParamSchema
>;
export type TransactionCodeParam = z.infer<typeof transactionCodeParamSchema>;
export type CommodityCodeParam = z.infer<typeof commodityCodeParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Intrastat Transaction list item (simplified)
 */
export type IntrastatTransactionListItem = {
  id: number;
  flow: IntrastatFlow;
  transactionDate: Date;
  documentNumber: string | null;
  partnerCountryCode: string;
  commodityCode: string;
  commodityDescription: string;
  invoicedValue: Decimal;
  statisticalValue: Decimal;
  netMass: Decimal;
  isCorrection: boolean;
};

/**
 * Intrastat Transaction with full details
 */
export type IntrastatTransactionComplete = IntrastatTransaction & {
  document: Document;
  documentLine: DocumentLine;
  transCodeRel: IntrastatTransactionCode;
  commCodeRel: IntrastatCommodityCode;
};

/**
 * Reporting period
 */
export interface IntrastatReportingPeriod {
  year: number;
  month?: number;
  quarter?: number;
  startDate: Date;
  endDate: Date;
  periodLabel: string; // e.g., "Gennaio 2026", "Q1 2026"
}

/**
 * Intrastat report summary
 */
export interface IntrastatReportSummary {
  flow: IntrastatFlow;
  period: IntrastatReportingPeriod;
  totalTransactions: number;
  totalInvoicedValue: Decimal;
  totalStatisticalValue: Decimal;
  totalNetMass: Decimal;
  corrections: number;
  countries: number;
  commodityCodes: number;
  byCountry: {
    countryCode: string;
    countryName: string;
    transactions: number;
    invoicedValue: Decimal;
    statisticalValue: Decimal;
    netMass: Decimal;
    percentage: number;
  }[];
  byCommodityCode: {
    commodityCode: string;
    description: string;
    transactions: number;
    invoicedValue: Decimal;
    statisticalValue: Decimal;
    netMass: Decimal;
    percentage: number;
  }[];
  byTransactionCode: {
    transactionCode: string;
    description: string;
    transactions: number;
    invoicedValue: Decimal;
  }[];
}

/**
 * Intrastat declaration
 */
export interface IntrastatDeclaration {
  id: number;
  flow: IntrastatFlow;
  period: IntrastatReportingPeriod;
  companyVatNumber: string;
  declarantName: string;
  declarantEmail: string;
  declarantPhone: string | null;
  status: "draft" | "submitted" | "accepted" | "rejected";
  submittedAt: Date | null;
  submittedBy: number | null;
  protocolNumber: string | null;
  transactions: IntrastatTransaction[];
  summary: IntrastatReportSummary;
  validationErrors: IntrastatValidationError[];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Validation error
 */
export interface IntrastatValidationError {
  transactionId: number | null;
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
  code: string;
}

/**
 * Intrastat statistics
 */
export interface IntrastatStats {
  period: {
    from: Date;
    to: Date;
  };
  arrivals: {
    totalTransactions: number;
    totalValue: Decimal;
    totalMass: Decimal;
    averageValue: Decimal;
    topCountries: string[];
    topCommodities: string[];
  };
  dispatches: {
    totalTransactions: number;
    totalValue: Decimal;
    totalMass: Decimal;
    averageValue: Decimal;
    topCountries: string[];
    topCommodities: string[];
  };
  tradeBalance: Decimal; // dispatches - arrivals
  growthRate: {
    arrivals: number; // percentage
    dispatches: number;
  };
  complianceStatus: {
    aboveThreshold: boolean;
    reportingRequired: boolean;
    frequency: ReportingFrequency;
    nextDeadline: Date | null;
  };
}

/**
 * Transaction validation result
 */
export interface TransactionValidationResult {
  transactionId: number;
  valid: boolean;
  errors: IntrastatValidationError[];
  warnings: IntrastatValidationError[];
  checks: {
    hasValidCommodityCode: boolean;
    hasValidTransactionCode: boolean;
    hasValidCountryCode: boolean;
    hasRequiredFields: boolean;
    statisticalValueValid: boolean;
    netMassValid: boolean;
  };
}

/**
 * Commodity code suggestion
 */
export interface CommodityCodeSuggestion {
  code: string;
  descriptionIT: string;
  descriptionEN: string;
  confidence: number; // 0-1
  reason: string;
  alternativeCodes: string[];
}

/**
 * Threshold monitoring
 */
export interface ThresholdMonitoring {
  year: number;
  flow: IntrastatFlow;
  currentTotal: Decimal;
  threshold: Decimal;
  percentageReached: number;
  projectedYearEnd: Decimal;
  willExceedThreshold: boolean;
  reportingRequired: boolean;
  estimatedMonthsToThreshold: number | null;
}

/**
 * Country trade summary
 */
export interface CountryTradeSummary {
  countryCode: string;
  countryName: string;
  arrivals: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
    topCommodities: {
      code: string;
      description: string;
      value: Decimal;
      percentage: number;
    }[];
  };
  dispatches: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
    topCommodities: {
      code: string;
      description: string;
      value: Decimal;
      percentage: number;
    }[];
  };
  tradeBalance: Decimal;
  trend: "increasing" | "stable" | "decreasing";
}

/**
 * Commodity trade analysis
 */
export interface CommodityTradeAnalysis {
  commodityCode: string;
  description: string;
  section: string;
  chapter: string;
  arrivals: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
    averageUnitValue: Decimal;
    topCountries: {
      countryCode: string;
      countryName: string;
      value: Decimal;
      percentage: number;
    }[];
  };
  dispatches: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
    averageUnitValue: Decimal;
    topCountries: {
      countryCode: string;
      countryName: string;
      value: Decimal;
      percentage: number;
    }[];
  };
  priceIndex: Decimal; // dispatch avg / arrival avg
  competitiveness: "high" | "medium" | "low";
}

/**
 * Monthly trend data
 */
export interface MonthlyTrendData {
  year: number;
  month: number;
  monthLabel: string;
  arrivals: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
  };
  dispatches: {
    transactions: number;
    value: Decimal;
    mass: Decimal;
  };
  tradeBalance: Decimal;
  growth: {
    arrivalsValue: number; // percentage vs previous month
    dispatchesValue: number;
  };
}

/**
 * Intrastat dashboard metrics
 */
export interface IntrastatDashboardMetrics {
  currentMonth: {
    arrivals: number;
    dispatches: number;
    totalValue: Decimal;
  };
  currentQuarter: {
    arrivals: number;
    dispatches: number;
    totalValue: Decimal;
    comparedToLastQuarter: number; // percentage change
  };
  currentYear: {
    arrivals: number;
    dispatches: number;
    totalValue: Decimal;
    thresholdStatus: {
      arrivals: ThresholdMonitoring;
      dispatches: ThresholdMonitoring;
    };
  };
  pendingDeclarations: {
    count: number;
    nextDeadline: Date | null;
    overdueCount: number;
  };
  recentTransactions: IntrastatTransactionListItem[];
  topTradingPartners: {
    countryCode: string;
    countryName: string;
    totalValue: Decimal;
    trend: "up" | "down" | "stable";
  }[];
  alerts: {
    type: "threshold" | "deadline" | "validation" | "missing_data";
    severity: "high" | "medium" | "low";
    message: string;
    actionRequired: boolean;
  }[];
}

/**
 * Export file result
 */
export interface IntrastatExportResult {
  filename: string;
  format: "csv" | "xml" | "pdf" | "xlsx";
  size: number; // bytes
  recordCount: number;
  generatedAt: Date;
  downloadUrl: string;
  expiresAt: Date;
}

/**
 * XML declaration structure (for electronic submission)
 */
export interface IntrastatXmlDeclaration {
  header: {
    declarantVat: string;
    declarantName: string;
    declarationPeriod: string; // YYYY-MM
    flowType: "A" | "D"; // A=Arrival, D=Dispatch
    declarationType: "N" | "C"; // N=Normal, C=Correction
    softwareName: string;
    softwareVersion: string;
  };
  records: {
    recordNumber: number;
    commodityCode: string;
    partnerCountry: string;
    transactionCode: string;
    modeOfTransport: string;
    invoicedValue: number;
    statisticalValue: number;
    netMass: number;
    supplementaryUnits: number | null;
  }[];
  summary: {
    totalRecords: number;
    totalInvoicedValue: number;
    totalStatisticalValue: number;
  };
}

/**
 * Correction tracking
 */
export interface CorrectionTracking {
  originalTransactionId: number;
  correctionTransactionId: number;
  correctionDate: Date;
  correctedBy: number;
  correctionReason: string;
  fieldsCorrected: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  declarationImpact: {
    requiresNewDeclaration: boolean;
    affectedPeriod: IntrastatReportingPeriod;
  };
}

/**
 * Audit trail entry
 */
export interface IntrastatAuditEntry {
  id: string;
  transactionId: number | null;
  declarationId: number | null;
  action: "create" | "update" | "delete" | "submit" | "export" | "validate";
  performedBy: number;
  performedAt: Date;
  changes: Record<string, any>;
  ipAddress: string | null;
  userAgent: string | null;
}
