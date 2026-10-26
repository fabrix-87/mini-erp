import Decimal from "decimal.js";
import { DocumentRelationType, DocumentStatus, DocumentStatusCategory, DocumentType, InstallmentStatus } from "./enum";
import { Document, DocumentRelation } from "./entity";

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
