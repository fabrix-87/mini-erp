import type { DocumentStatus, DocumentType, InstallmentStatus } from "./enum";

/** Calendar periods supported by sales reports. */
export type ReportPeriod = "day" | "week" | "month" | "year";

/** Calendar periods supported by generic document statistics. */
export type DocumentStatisticsPeriod = Exclude<ReportPeriod, "year">;

/** Pagination metadata embedded in document report payloads. */
export interface DocumentReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Document count and monetary totals for a statistics group. */
export interface DocumentStatisticsTotals<TAmount = string> {
  count: number;
  totalAmount: TAmount;
  paidAmount: TAmount;
}

/** Document statistics grouped by document type. */
export interface DocumentTypeStatisticsItem<
  TAmount = string,
> extends DocumentStatisticsTotals<TAmount> {
  documentType: DocumentType;
}

/** Document statistics grouped by lifecycle status. */
export interface DocumentStatusStatisticsItem<
  TAmount = string,
> extends DocumentStatisticsTotals<TAmount> {
  status: DocumentStatus;
}

/** Document statistics grouped by customer identity. */
export interface CustomerDocumentStatisticsItem<
  TAmount = string,
> extends DocumentStatisticsTotals<TAmount> {
  customerId: string;
  customerName: string | null;
}

/** Document statistics grouped by calendar period. */
export interface PeriodDocumentStatisticsItem<
  TAmount = string,
  TDate = string,
> extends DocumentStatisticsTotals<TAmount> {
  period: TDate;
}

/** Generic grouped report preserving its grouping discriminator. */
export interface GroupedDocumentReport<TGroup extends string, TItem> {
  groupBy: TGroup;
  data: TItem[];
}

/** Document statistics with a result shape determined by groupBy. */
export type DocumentStatisticsReport<TAmount = string, TDate = string> =
  | GroupedDocumentReport<"documentType", DocumentTypeStatisticsItem<TAmount>>
  | GroupedDocumentReport<"status", DocumentStatusStatisticsItem<TAmount>>
  | GroupedDocumentReport<"customer", CustomerDocumentStatisticsItem<TAmount>>
  | GroupedDocumentReport<DocumentStatisticsPeriod, PeriodDocumentStatisticsItem<TAmount, TDate>>;

/** Sales totals grouped by customer identity. */
export interface CustomerSalesReportItem<TAmount = string> {
  customerId: string;
  customerName: string | null;
  documentCount: number;
  totalAmount: TAmount;
  paidAmount: TAmount;
  taxableAmount: TAmount;
  taxAmount: TAmount;
}

/**
 * Sales totals grouped by product variant.
 * Quantity is expressed in base units and monetary totals are net of credit notes.
 */
export interface ProductSalesReportItem<TAmount = string> {
  productVariantId: string;
  productName: string;
  quantitySold: TAmount;
  revenueNet: TAmount;
  revenueGross: TAmount;
  lineCount: number;
}

/** Sales totals grouped by calendar period. */
export interface PeriodSalesReportItem<TAmount = string, TDate = string> {
  period: TDate;
  count: number;
  totalAmount: TAmount;
  taxableAmount: TAmount;
  taxAmount: TAmount;
}

/** Sales report with a result shape determined by groupBy. */
export type SalesReport<TAmount = string, TDate = string> =
  | GroupedDocumentReport<"customer", CustomerSalesReportItem<TAmount>>
  | GroupedDocumentReport<"product", ProductSalesReportItem<TAmount>>
  | GroupedDocumentReport<ReportPeriod, PeriodSalesReportItem<TAmount, TDate>>;

/** Outstanding installment totals within one aging interval. */
export interface AgingBucketReportItem<TAmount = string> {
  label: string;
  amount: TAmount;
  count: number;
  percentage: number;
}

/** Outstanding installment totals grouped by customer identity. */
export interface AgingCustomerReportItem<TAmount = string> {
  customerId: string;
  customerName: string | null;
  totalOutstanding: TAmount;
  oldestDueDateDaysAgo: number;
}

/**
 * Receivables aging based on current outstanding installment balances.
 * Global totals and buckets are independent of customer pagination.
 */
export interface AgingReport<TAmount = string> {
  /** Rome-local civil date in YYYY-MM-DD format. */
  asOfDate: string;
  totalOutstanding: TAmount;
  installmentCount: number;
  buckets: AgingBucketReportItem<TAmount>[];
  byCustomer: AgingCustomerReportItem<TAmount>[];
  pagination: DocumentReportPagination;
}

/** Product variant with its position in the revenue ranking. */
export interface TopProductReportItem<TAmount = string> extends ProductSalesReportItem<TAmount> {
  rank: number;
}

/** Ranked product variants within the requested reporting range. */
export interface TopProductsReport<TAmount = string> {
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  limit: number;
  data: TopProductReportItem<TAmount>[];
}

/** Overdue installment enriched with document and customer information. */
export interface OverdueInstallmentReportItem<TAmount = string, TDate = string> {
  installmentId: string;
  documentId: string;
  documentNumber: string | null;
  documentType: DocumentType;
  customerId: string | null;
  customerName: string | null;
  installmentNumber: number;
  amount: TAmount;
  paidAmount: TAmount;
  outstanding: TAmount;
  dueDate: TDate;
  daysOverdue: number;
  status: InstallmentStatus;
  paymentMethodCode: string | null;
}

/** Paginated overdue installments with global count and outstanding balance. */
export interface OverdueInstallmentsReport<TAmount = string, TDate = string> {
  /** Rome-local civil date in YYYY-MM-DD format. */
  asOfDate: string;
  totalOutstanding: TAmount;
  count: number;
  installments: OverdueInstallmentReportItem<TAmount, TDate>[];
  pagination: DocumentReportPagination;
}
