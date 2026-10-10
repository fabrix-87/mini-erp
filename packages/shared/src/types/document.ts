// ============================================================================
// DOCUMENT TYPE EXPORTS
// ============================================================================

import { z } from "zod";
import type { Customer } from "./customer";
import type { Supplier } from "./supplier";
import type { Contact } from "./contact";
import type { Opportunity } from "./opportunity";
import type { Lead } from "./lead";
import type { Warehouse } from "./warehouse";
import type { Currency } from "./currency";
import type { User } from "./user";
import type { ProductVariant, Product } from "./product";
import type { PaymentMethod } from "./payment";
import type { TaxRule } from "./tax";
import type { StockMovement, StockReservation } from "./warehouse";
import type { IntrastatTransaction } from "./intrastat";
import Decimal from "decimal.js";
import {
  documentStatusCategorySchema,
  documentRelationTypeSchema,
  installmentStatusSchema,
  createDocumentLineSchema,
  updateDocumentLineSchema,
  createInstallmentSchema,
  updateInstallmentSchema,
  createDocumentSchema,
  updateDocumentSchema,
  updateDocumentStatusSchema,
  documentAttachmentIdParamSchema,  
  documentDirectionSchema,
  matchStatusSchema,
  voidDocumentSchema,
  documentCustomerIdParamSchema,
  documentSupplierIdParamSchema,
  quantityDeliveredSchema,
  payInstallmentSchema,
  generateInstallmentPlanSchema,
  approveDocumentSchema,
  rejectDocumentSchema,
  sendDocumentSchema,
  convertDocumentSchema,
  cloneDocumentSchema,
  createDocumentRelationSchema,
  bulkUpdateDocumentsStatusSchema,
  bulkDeleteDocumentsSchema,
  bulkSendDocumentsSchema,
  documentQuerySchema,
  documentLineQuerySchema,
  installmentQuerySchema,
  documentStatsSchema,
  salesReportSchema,
  agingReportSchema,
  topProductsReportSchema,
  documentIdParamSchema,
  documentLineIdParamSchema,
  installmentIdParamSchema,
} from "../validators/document";
import { DOCUMENT_LINE_TYPES, DOCUMENT_PARTY_ROLES, DOCUMENT_STATUSES, DOCUMENT_TYPES } from "../constants";
import { BankAccount } from "./bank";
import { Carrier } from "./carrier";

// ============================================================================
// ENUM TYPES
// ============================================================================

export type DocumentType = keyof typeof DOCUMENT_TYPES;
export type DocumentStatus = keyof typeof DOCUMENT_STATUSES;
export type DocumentDirection = z.infer<typeof documentDirectionSchema>;
export type MatchStatus = z.infer<typeof matchStatusSchema>;
export type DocumentPartyRole = (typeof DOCUMENT_PARTY_ROLES)[keyof typeof DOCUMENT_PARTY_ROLES];
export type DocumentStatusCategory = z.infer<typeof documentStatusCategorySchema>;
export type DocumentRelationType = z.infer<typeof documentRelationTypeSchema>;
export type DocumentLineType = (typeof DOCUMENT_LINE_TYPES)[keyof typeof DOCUMENT_LINE_TYPES];
export type InstallmentStatus = z.infer<typeof installmentStatusSchema>;

// ============================================================================
// ENTITY TYPES
// ============================================================================

/**
 * Document-owned party snapshot. One row per document and role.
 * Output (PDF, XML) must read these values, never the live source records.
 */
export type DocumentParty = {
  tenantId: string;
  documentId: string;
  role: DocumentPartyRole;
  code: string | null;
  name: string;
  entityType: "JURIDICAL" | "NATURAL" | "FOREIGN" | null;
  legalForm: string | null;
  vatNumber: string | null;
  taxCode: string | null;
  vatId: string | null;
  eoriNumber: string | null;
  taxRegime: string | null;
  pec: string | null;
  sdiCode: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  province: string | null;
  countryCode: string | null;
  email: string | null;
  phone: string | null;
  reaOffice: string | null;
  reaNumber: string | null;
  reaShareCapital: Decimal | null;
  reaShareholderType: "SU" | "SM" | null;
  reaLiquidationStatus: "LS" | "LN" | null;
  sourceCompanyId: string | null;
  sourceAddressId: string | null;
  companyVersionId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Document line entity. */
export type DocumentLine = {
  id: string;
  tenantId: string;
  documentId: string;
  document?: Document;
  productVariantId: string | null;
  productVariant?: ProductVariant | null;
  productId: string | null;
  product?: Product | null;
  lineNumber: number;
  lineType: DocumentLineType;
  code: string | null;
  nameSystem: string;
  descriptionSystem: string | null;
  nameCustomer: string | null;
  descriptionCustomer: string | null;
  quantity: Decimal;
  unit: string;
  unitPrice: Decimal;
  unitCost: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  lineTotal: Decimal;
  taxRuleId: number | null;
  taxRule?: TaxRule | null;
  taxPercent: Decimal;
  taxAmount: Decimal;
  vatNatureCode: string | null;
  vatNormReference: string | null;
  isReverseCharge: boolean;
  isSelfInvoice: boolean;
  /** Only populated on SUPPLIER_INVOICE lines. */
  matchStatus: MatchStatus | null;
  lineTotalWithTax: Decimal;
  notes: string | null;
  customFields: Record<string, unknown> | null;
  intrastatTransactions?: IntrastatTransaction[];
  warehouseId: string | null;
  warehouse?: Warehouse | null;
  stockReservations?: StockReservation[];
  stockMovements?: StockMovement[];
  parentLineId: string | null;
  parentLine?: DocumentLine | null;
  componentLines?: DocumentLine[];
  isComponent: boolean;
  quantityInvoiced: Decimal;
  quantityDelivered: Decimal;
  quantityReturned: Decimal;
  originalUnitPrice: Decimal | null;
  priceOverrideReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Payment installment entity. */
export type DocumentPaymentInstallment = {
  id: string;
  tenantId: string;
  documentId: string;
  document?: Document;
  installmentNumber: number;
  percentage: Decimal;
  amount: Decimal;
  dueDate: Date;
  paidDate: Date | null;
  paidAmount: Decimal;
  status: InstallmentStatus;
  notes: string | null;
  paymentMethodId: string | null;
  paymentMethod?: PaymentMethod | null;
  paymentReference: string | null;
  bankTransactionId: string | null;
  paymentBatchId: string | null;
  remindersSent: number;
  lastReminderAt: Date | null;
  lateFeeAmount: Decimal;
  createdAt: Date;
  updatedAt: Date;
};

/** Append-only audit record of a document status transition. */
export type DocumentStatusHistory = {
  id: number;
  documentId: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  changedBy: string;
  user?: User;
  reason: string | null;
  changedAt: Date;
};

/** Document entity. Party identity and addresses live in `parties`. */
export type Document = {
  id: string;
  tenantId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  direction: DocumentDirection;

  // Outbound numbering
  documentNumber: string | null;
  sequenceNumber: number | null;
  documentYear: number;
  // Inbound numbering
  counterpartyDocumentNumber: string | null;
  // VAT register
  vatRegisterProtocol: number | null;
  vatRegisterYear: number | null;

  // Counterparties
  customerId: string | null;
  customer?: Customer | null;
  supplierId: string | null;
  supplier?: Supplier | null;
  contactId: string | null;
  contact?: Contact | null;
  opportunityId: string | null;
  opportunity?: Opportunity | null;
  leadId: string | null;
  lead?: Lead | null;
  warehouseId: string | null;
  warehouse?: Warehouse | null;
  parties?: DocumentParty[];

  // Dates
  documentDate: Date;
  dueDate: Date | null;
  deliveryDate: Date | null;
  validUntil: Date | null;
  sentDate: Date | null;
  receivedDate: Date | null;
  registrationDate: Date | null;

  // Relations
  relatedDocuments?: DocumentRelation[];
  relatedToDocuments?: DocumentRelation[];

  // Amounts (document currency)
  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  shippingCost: Decimal;
  shippingTaxAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
  netPayableAmount: Decimal;
  paidAmount: Decimal;
  currencyCode: string;
  currency?: Currency;
  exchangeRate: Decimal;
  exchangeRateDate: Date;
  baseCurrencyCode: string;

  // Logistics
  carrierId: string | null;
  carrier?: Carrier | null;
  trackingNumber: string | null;

  // Payment snapshot
  paymentMethodId: string | null;
  paymentMethodRel?: PaymentMethod | null;
  paymentMethodCode: string;
  paymentTermsLabel: string | null;

  // Bank snapshot (source of truth for payment execution)
  bankName: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  bankAccountHolder: string | null;
  /** Traceability only: never read it to execute a payment. */
  paymentBankAccountId: string | null;
  paymentBankAccount?: BankAccount | null;
  bankDetailsMismatch: boolean;
  bankDetailsVerifiedByUserId: string | null;
  bankDetailsVerifiedAt: Date | null;

  // Notes
  notes: string | null;
  internalNotes: string | null;
  termsAndConditions: string | null;

  // Withholding tax and social security (INBOUND)
  withholdingTaxTypeId: string | null;
  withholdingTaxTypeCode: string | null;
  withholdingTaxBase: Decimal | null;
  withholdingTaxPercent: Decimal | null;
  withholdingTaxAmount: Decimal | null;
  contributionPercent: Decimal | null;
  contributionAmount: Decimal | null;

  // Ownership
  createdByUserId: string;
  createdBy?: User;
  assignedUserId: string | null;
  assignedUser?: User | null;
  deletedBy: string | null;
  deletedByUser?: User | null;

  customFields: Record<string, unknown> | null;
  statusHistory?: DocumentStatusHistory[];

  // Lifecycle timestamps
  approvedAt: Date | null;
  invoicedAt: Date | null;
  deliveredAt: Date | null;
  closedAt: Date | null;
  voidedAt: Date | null;
  voidedReason: string | null;
  snapshotLockedAt: Date | null;

  lines?: DocumentLine[];
  installments?: DocumentPaymentInstallment[];
  stockMovements?: StockMovement[];
  stockReservations?: StockReservation[];
  intrastatTransactions?: IntrastatTransaction[];

  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/** Per-tenant, per-type, per-year sequence counter. */
export type DocumentSequence = {
  id: number;
  tenantId: string;
  documentType: DocumentType;
  year: number;
  lastNumber: number;
  prefix: string | null;
  updatedAt: Date;
};

/** Directed edge between two documents. */
export type DocumentRelation = {
  sourceDocumentId: string;
  sourceDocument?: Document;
  targetDocumentId: string;
  targetDocument?: Document;
  relationType: DocumentRelationType;
  createdAt: Date;
};

// ============================================================================
// INPUT TYPES (using z.infer)
// ============================================================================

export type CreateDocumentLineInput = z.infer<typeof createDocumentLineSchema>;
export type UpdateDocumentLineInput = z.infer<typeof updateDocumentLineSchema>;
export type UpdateLineDeliveredQuantity = z.infer<typeof quantityDeliveredSchema>;

export type CreateInstallmentInput = z.infer<typeof createInstallmentSchema>;
export type UpdateInstallmentInput = z.infer<typeof updateInstallmentSchema>;
export type PayInstallmentInput = z.infer<typeof payInstallmentSchema>;
export type GenerateInstallmentPlanInput = z.infer<typeof generateInstallmentPlanSchema>;

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
export type ApproveDocumentInput = z.infer<typeof approveDocumentSchema>;
export type RejectDocumentInput = z.infer<typeof rejectDocumentSchema>;
export type SendDocumentInput = z.infer<typeof sendDocumentSchema>;
export type ConvertDocumentInput = z.infer<typeof convertDocumentSchema>;
export type CloneDocumentInput = z.infer<typeof cloneDocumentSchema>;

export type CreateDocumentRelationInput = z.infer<typeof createDocumentRelationSchema>;

export type BulkUpdateDocumentsStatusInput = z.infer<typeof bulkUpdateDocumentsStatusSchema>;
export type BulkDeleteDocumentsInput = z.infer<typeof bulkDeleteDocumentsSchema>;
export type BulkSendDocumentsInput = z.infer<typeof bulkSendDocumentsSchema>;

// ============================================================================
// QUERY TYPES (using z.infer)
// ============================================================================

export type DocumentQueryInput = z.infer<typeof documentQuerySchema>;
export type DocumentLineQueryInput = z.infer<typeof documentLineQuerySchema>;
export type InstallmentQueryInput = z.infer<typeof installmentQuerySchema>;
export type DocumentStatsInput = z.infer<typeof documentStatsSchema>;
export type SalesReportInput = z.infer<typeof salesReportSchema>;
export type AgingReportInput = z.infer<typeof agingReportSchema>;
export type TopProductsReportInput = z.infer<typeof topProductsReportSchema>;

// ============================================================================
// PARAM TYPES (using z.infer)
// ============================================================================

export type DocumentIdParam = z.infer<typeof documentIdParamSchema>;
export type DocumentLineIdParam = DocumentIdParam & z.infer<typeof documentLineIdParamSchema>;
export type InstallmentIdParam = DocumentIdParam & z.infer<typeof installmentIdParamSchema>;
export type DocumentSupplierIdParam = z.infer<typeof documentSupplierIdParamSchema>;
export type DocumentCustomerIdParam = z.infer<typeof documentCustomerIdParamSchema>;
export type VoidDocumentInput = z.infer<typeof voidDocumentSchema>;
export type DocumentAttachmentIdParam = DocumentIdParam & z.infer<typeof documentAttachmentIdParamSchema>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Document list item (simplified)
 */
export type DocumentListItem = {
  id: string;
  documentType: DocumentType;
  documentNumber: string | null;
  status: DocumentStatus;
  statusCategory: DocumentStatusCategory;
  documentDate: Date;
  dueDate: Date | null;
  customerName: string;
  totalAmount: Decimal;
  paidAmount: Decimal;
  currencyCode: string;
  createdAt: Date;
};

/**
 * Document with full details
 */
export type DocumentComplete = Document & {
  lines: DocumentLine[];
  installments: DocumentPaymentInstallment[];
  relatedDocuments: DocumentRelation[];
  stockMovements: StockMovement[];
};

/**
 * Status history entry
 */
export interface DocumentStatusHistoryEntry {
  from: DocumentStatus;
  to: DocumentStatus;
  by: number;
  username: string;
  at: Date;
  reason: string | null;
}

/**
 * Document totals calculation
 */
export interface DocumentTotals {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  shippingCost: Decimal;
  shippingTaxAmount: Decimal;
  totalAmount: Decimal;
  totalWithoutTax: Decimal;
  totalTax: Decimal;
  byTaxRate: {
    taxPercent: Decimal;
    taxableAmount: Decimal;
    taxAmount: Decimal;
  }[];
}

/**
 * Document statistics
 */
export interface DocumentStats {
  totalDocuments: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  totalAmount: Decimal;
  totalPaidAmount: Decimal;
  totalUnpaidAmount: Decimal;
  averageAmount: Decimal;
  overdueDocuments: number;
  overdueAmount: Decimal;
  documentsTrend: {
    period: string;
    count: number;
    amount: Decimal;
  }[];
}

/**
 * Sales report summary
 */
export interface SalesReportSummary {
  period: {
    from: Date;
    to: Date;
  };
  totalRevenue: Decimal;
  totalInvoiced: Decimal;
  totalPaid: Decimal;
  totalOutstanding: Decimal;
  numberOfInvoices: number;
  numberOfCustomers: number;
  averageInvoiceAmount: Decimal;
  topCustomers: {
    customerId: number;
    customerName: string;
    totalAmount: Decimal;
    numberOfInvoices: number;
  }[];
  topProducts: {
    productId: number;
    productName: string;
    quantitySold: Decimal;
    totalAmount: Decimal;
  }[];
  byPeriod: {
    period: string;
    revenue: Decimal;
    numberOfInvoices: number;
  }[];
}

/**
 * Aging report (accounts receivable)
 */
export interface AgingReport {
  asOfDate: Date;
  totalOutstanding: Decimal;
  intervals: {
    label: string;
    days: number;
    amount: Decimal;
    count: number;
    percentage: number;
  }[];
  byCustomer: {
    customerId: number;
    customerName: string;
    totalOutstanding: Decimal;
    current: Decimal;
    overdue: Decimal;
    byInterval: Record<string, Decimal>;
    oldestInvoiceDate: Date;
    oldestInvoiceDays: number;
  }[];
}

/**
 * Document conversion result
 */
export interface DocumentConversionResult {
  sourceDocument: Document;
  targetDocument: Document;
  linesConverted: number;
  installmentsConverted: number;
  relation: DocumentRelation;
}

/**
 * Document PDF export options
 */
export interface DocumentPdfOptions {
  language: string;
  template: string;
  includeLogo: boolean;
  includeSignature: boolean;
  watermark: string | null;
  orientation: "portrait" | "landscape";
  pageSize: "A4" | "Letter";
}

/**
 * Document XML export (FatturaPA)
 */
export interface DocumentXmlExport {
  documentId: number;
  xmlContent: string;
  filename: string;
  generatedAt: Date;
  transmissionId: string;
  validated: boolean;
  validationErrors: string[];
}

/**
 * Document send result
 */
export interface DocumentSendResult {
  documentId: number;
  sent: boolean;
  sentAt: Date;
  recipient: string;
  subject: string;
  attachments: string[];
  error: string | null;
}

/**
 * Document fulfillment status
 */
export interface DocumentFulfillmentStatus {
  documentId: number;
  documentType: DocumentType;
  totalLines: number;
  fulfilledLines: number;
  partiallyFulfilledLines: number;
  unfulfilledLines: number;
  fulfillmentPercentage: number;
  canClose: boolean;
  lineDetails: {
    lineId: number;
    lineNumber: number;
    productName: string;
    quantityOrdered: Decimal;
    quantityDelivered: Decimal;
    quantityInvoiced: Decimal;
    quantityRemaining: Decimal;
    status: "fulfilled" | "partial" | "pending";
  }[];
}

/**
 * Payment status summary
 */
export interface PaymentStatusSummary {
  documentId: number;
  totalAmount: Decimal;
  paidAmount: Decimal;
  remainingAmount: Decimal;
  paymentPercentage: number;
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  nextDueDate: Date | null;
  nextDueAmount: Decimal | null;
  installmentDetails: {
    installmentId: number;
    installmentNumber: number;
    amount: Decimal;
    paidAmount: Decimal;
    dueDate: Date;
    status: InstallmentStatus;
    daysOverdue: number | null;
  }[];
}

/**
 * Document validation result
 */
export interface DocumentValidationResult {
  valid: boolean;
  errors: {
    field: string;
    message: string;
    severity: "error" | "warning";
  }[];
  warnings: string[];
  canSave: boolean;
  canSend: boolean;
  canInvoice: boolean;
}

/**
 * Document workflow state
 */
export interface DocumentWorkflowState {
  documentId: number;
  currentStatus: DocumentStatus;
  currentCategory: DocumentStatusCategory;
  availableTransitions: {
    status: DocumentStatus;
    category: DocumentStatusCategory;
    label: string;
    requiresApproval: boolean;
    requiresConfirmation: boolean;
  }[];
  availableActions: {
    action: string;
    label: string;
    icon: string;
    requiresPermission: string;
  }[];
  canEdit: boolean;
  canDelete: boolean;
  canVoid: boolean;
  canConvert: boolean;
  canClone: boolean;
}

/**
 * Document chain (parent/child relationships)
 */
export interface DocumentChain {
  rootDocument: DocumentListItem;
  chain: {
    level: number;
    document: DocumentListItem;
    relationType: DocumentRelationType | "child";
    children: DocumentChain[];
  }[];
  totalDocuments: number;
  totalAmount: Decimal;
}

/**
 * Document dashboard metrics
 */
export interface DocumentDashboardMetrics {
  today: {
    created: number;
    sent: number;
    totalAmount: Decimal;
  };
  thisWeek: {
    created: number;
    sent: number;
    paid: number;
    totalAmount: Decimal;
  };
  thisMonth: {
    created: number;
    revenue: Decimal;
    outstanding: Decimal;
    overdueAmount: Decimal;
    trend: "up" | "down" | "stable";
    percentageChange: number;
  };
  pendingActions: {
    pendingApproval: number;
    overdueInvoices: number;
    expiringSoonQuotes: number;
    unfulfilledOrders: number;
  };
  recentDocuments: DocumentListItem[];
}

/**
 * Line price breakdown
 */
export interface LinePriceBreakdown {
  lineId: number;
  quantity: Decimal;
  unitPrice: Decimal;
  subtotal: Decimal;
  discountPercent: Decimal;
  discountAmount: Decimal;
  netPrice: Decimal;
  taxPercent: Decimal;
  taxAmount: Decimal;
  total: Decimal;
  unitCost: Decimal;
  margin: Decimal;
  marginPercent: Decimal;
}

/**
 * Document profitability analysis
 */
export interface DocumentProfitability {
  documentId: number;
  totalRevenue: Decimal;
  totalCost: Decimal;
  grossProfit: Decimal;
  grossMargin: Decimal;
  byLine: {
    lineId: number;
    lineNumber: number;
    productName: string;
    revenue: Decimal;
    cost: Decimal;
    profit: Decimal;
    margin: Decimal;
  }[];
}

/**
 * Document approval workflow
 */
export interface DocumentApprovalWorkflow {
  documentId: number;
  requiresApproval: boolean;
  approvers: {
    userId: number;
    username: string;
    role: string;
    status: "pending" | "approved" | "rejected";
    approvedAt: Date | null;
    comments: string | null;
  }[];
  currentApprover: number | null;
  approvalChain: number[];
  finalApprover: boolean;
}
