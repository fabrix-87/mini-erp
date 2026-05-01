// ============================================================================
// DASHBOARD TYPES — aligned with actual API response shapes
// ============================================================================

import type { DocumentType, DocumentStatus } from "./document";
import {
  DashboardWidgetType,
  DashboardScope,
  DashboardPeriod,
  DashboardRoleCode,
} from "../constants/dashboard";
import { z } from "zod";
import {
  dashboardQuerySchema,
  widgetPositionSchema,
  updateLayoutSchema,
} from "../validators/dashboard";
import type { ApiResponse } from "./api";

// ============================================================================
// QUERY / INPUT TYPES
// ============================================================================

/** Input parameters for a dashboard data request */
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

/** Single widget position in the grid (12-col layout) */
export type WidgetPositionInput = z.infer<typeof widgetPositionSchema>;

/** Payload to save a user's custom layout */
export type UpdateLayoutInput = z.infer<typeof updateLayoutSchema>;

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

/**
 * Generic "widget not yet implemented" placeholder.
 * Returned by the backend for unimplemented widget types.
 */
export interface WidgetNotImplemented {
  message: string;
}

/** Checks whether a widget response is the "not implemented" placeholder */
export function isWidgetNotImplemented(val: unknown): val is WidgetNotImplemented {
  return (
    typeof val === "object" &&
    val !== null &&
    "message" in val &&
    typeof (val as WidgetNotImplemented).message === "string"
  );
}

/** Generic trend delta — used in KPI blocks that support period comparison */
export interface TrendDelta {
  current: number | string;
  previous: number | string;
  delta: number | string;
  percentageChange: number;
  trend: "up" | "down" | "stable";
}

// ============================================================================
// CRM / SALES WIDGETS
// ============================================================================

/**
 * Leads KPI summary — widget LEADS_KPI.
 * Numeric values are plain numbers; rates are stringified decimals.
 */
export interface LeadsKpiData {
  total: number;
  active: number;
  new: number;
  contacted: number;
  qualified: number;
  nurturing: number;
  converted: number;
  lost: number;
  unqualified: number;
  /** Stringified decimal, e.g. "33.3" */
  conversionRate: string;
}

/**
 * Single stage entry in the leads funnel — widget LEADS_FUNNEL.
 * stage values match LeadStatus enum from the backend.
 */
export interface LeadsFunnelItem {
  stage: string; // LeadStatus enum value
  count: number;
  /** Stringified decimal percentage, e.g. "25.0" */
  percentage: string;
}

/**
 * Lead requiring follow-up — widget LEADS_FOLLOWUP.
 */
export interface LeadsFollowUpItem {
  leadId: number;
  code: string;
  companyName: string;
  nextFollowUpDate: string; // ISO date string
  daysPastDue: number;
}

/**
 * Lead source distribution entry — widget LEADS_SOURCE.
 */
export interface LeadsSourceItem {
  source: string;
  count: number;
  percentage: string;
}

/**
 * Opportunities KPI summary — widget OPPORTUNITIES_KPI.
 */
export interface OpportunitiesKpiData {
  total: number;
  open: number;
  won: number;
  lost: number;
  pending: number;
  /** Stringified decimal */
  totalWonValue: string;
  /** Stringified decimal */
  totalPipelineValue: string;
  /** Stringified decimal, e.g. "0.0" */
  winRate: string;
}

/**
 * Single pipeline stage entry — widget OPPORTUNITIES_PIPELINE.
 */
export interface OpportunitiesPipelineItem {
  stage: string; // SalesStage enum value
  count: number;
  totalValue: string;
  weightedValue: string;
}

/**
 * Revenue forecast summary — widget OPPORTUNITIES_FORECAST.
 */
export interface OpportunitiesForecastData {
  totalPipelineValue: string;
  weightedValue: string;
  expectedCloseThisMonth: string;
  expectedCloseThisQuarter: string;
}

/**
 * Single activity in the feed — widget ACTIVITIES_FEED.
 */
export interface ActivityFeedItem {
  activityId: number;
  type: string; // ActivityType enum value
  subject: string;
  scheduledStart: string; // ISO date string
  isOverdue: boolean;
  relatedEntity: {
    type: "lead" | "opportunity" | "customer" | "company";
    id: number;
    name: string;
  } | null;
  assignedUserId: number;
  assignedUserName: string;
}

/**
 * Activities KPI summary — widget ACTIVITIES_KPI.
 */
export interface ActivitiesKpiData {
  total: number;
  overdue: number;
  today: number;
  thisWeek: number;
  completed: number;
  scheduled: number;
  inProgress: number;
}

/**
 * Activity type distribution entry — widget ACTIVITIES_BY_TYPE.
 */
export interface ActivitiesByTypeItem {
  type: string; // ActivityType enum value
  count: number;
  percentage: string;
}

/**
 * Customers KPI summary — widget CUSTOMERS_KPI.
 */
export interface CustomersKpiData {
  total: number;
  active: number;
  inactive: number;
  prospect: number;
  vip: number;
  newCustomers: number;
}

/**
 * Top customer entry — widget TOP_CUSTOMERS.
 */
export interface TopCustomerItem {
  customerId: number;
  customerName: string;
  totalRevenue: string;
  invoicesCount: number;
}

/**
 * Customer lifecycle stage entry — widget CUSTOMERS_LIFECYCLE.
 */
export interface CustomerLifecycleItem {
  stage: string;
  count: number;
  percentage: string;
}

// ============================================================================
// FINANCE / ACCOUNTING WIDGETS
// ============================================================================

/**
 * Revenue KPI summary — widget REVENUE_KPI.
 * All monetary values are stringified decimals.
 */
export interface RevenueKpiData {
  totalRevenue: string;
  paidRevenue: string;
  pendingRevenue: string;
  invoicesCount: number;
  averageInvoiceValue: string;
  /** Stringified decimal, e.g. "0.0" */
  growthRate: string;
}

/**
 * Invoice status distribution entry — widget INVOICES_STATUS.
 */
export interface InvoicesStatusItem {
  status: DocumentStatus;
  count: number;
  totalAmount: string;
}

/**
 * Overdue installment entry — widget OVERDUE_INSTALLMENTS.
 */
export interface OverdueInstallmentItem {
  documentId: number;
  documentNumber: string | null;
  customerName: string;
  installmentNumber: number;
  dueDate: string; // ISO date string
  amount: string;
  daysPastDue: number;
}

/**
 * Revenue trend data point — widget REVENUE_TREND.
 */
export interface RevenueTrendPoint {
  label: string; // e.g. "Gen 2026", "W10"
  invoicedAmount: string;
  collectedAmount: string;
  creditNotesAmount?: string;
}

/**
 * Supplier orders KPI summary — widget SUPPLIER_ORDERS_KPI.
 */
export interface SupplierOrdersKpiData {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalValue: string;
  averageOrderValue: string;
}

/**
 * Purchase trend data point — widget PURCHASE_TREND.
 */
export interface PurchaseTrendPoint {
  label: string;
  purchasedAmount: string;
  receivedAmount: string;
}

/**
 * Cash flow summary — widget CASH_FLOW.
 */
export interface CashFlowData {
  cashIn: string;
  cashOut: string;
  netCashFlow: string;
  openingBalance: string;
  closingBalance: string;
}

/**
 * Profit margin summary — widget PROFIT_MARGIN.
 */
export interface ProfitMarginData {
  revenue: string;
  costs: string;
  grossProfit: string;
  /** Stringified decimal percentage */
  profitMargin: string;
  trend: Array<{ label: string; margin: string }>;
}

/**
 * Accounts payable/receivable summary — widgets ACCOUNTS_PAYABLE / ACCOUNTS_RECEIVABLE.
 */
export interface AccountsData {
  total: string;
  current: string;
  overdue: string;
  overdueCount: number;
}

// ============================================================================
// DOCUMENTS WIDGETS
// ============================================================================

/**
 * Documents KPI summary — widget DOCUMENTS_KPI.
 */
export interface DocumentsKpiData {
  total: number;
  draft: number;
  sent: number;
  accepted: number;
  paid: number;
  overdue: number;
  totalValue: string;
  paidValue: string;
}

/**
 * Document type distribution entry — widget DOCUMENTS_BY_TYPE.
 */
export interface DocumentsByTypeItem {
  type: DocumentType;
  count: number;
  totalAmount: string;
}

/**
 * Recent document entry — widget RECENT_DOCUMENTS.
 */
export interface RecentDocumentItem {
  documentId: number;
  documentNumber: string | null;
  documentType: DocumentType;
  status: DocumentStatus;
  customerName: string;
  totalAmount: string;
  documentDate: string; // ISO date string
}

/**
 * Document fulfillment summary — widget DOCUMENTS_FULFILLMENT.
 */
export interface DocumentsFulfillmentData {
  totalOrders: number;
  fullyFulfilled: number;
  partiallyFulfilled: number;
  pending: number;
  fulfillmentRate: string;
  totalQuantity: number;
  deliveredQuantity: number;
}

/**
 * Expiring quote entry — widget EXPIRING_QUOTES.
 */
export interface ExpiringQuoteItem {
  documentId: number;
  documentNumber: string | null;
  customerName: string;
  expiryDate: string; // ISO date string
  daysUntilExpiry: number;
  totalAmount: string;
}

// ============================================================================
// WAREHOUSE / LOGISTICS WIDGETS
// ============================================================================

/**
 * Stock alert entry — widget STOCK_ALERTS.
 * Shape from actual backend response.
 */
export interface StockAlertItem {
  variantId: number;
  variantCode: string;
  productReference: string;
  productName: string;
  currentStock: number;
  alertType: "OUT_OF_STOCK" | "LOW_STOCK";
}

/**
 * Stock value summary — widget STOCK_VALUE.
 */
export interface StockValueData {
  totalValue: string;
  activeProducts: number;
  totalUnits: number;
}

/**
 * Stock movement entry — widget STOCK_MOVEMENTS.
 */
export interface StockMovementItem {
  movementId: number;
  variantCode: string;
  productName: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  date: string; // ISO date string
  warehouseName: string;
}

/**
 * Deliveries KPI summary — widget DELIVERIES_KPI.
 */
export interface DeliveriesKpiData {
  totalDeliveries: number;
  pending: number;
  inTransit: number;
  delivered: number;
  onTime: number;
  delayed: number;
}

/**
 * Delivery performance summary — widget DELIVERY_PERFORMANCE.
 */
export interface DeliveryPerformanceData {
  totalDeliveries: number;
  onTimeCount: number;
  delayedCount: number;
  onTimeRate: string;
  averageDeliveryTime: string;
}

// ============================================================================
// PRODUCTS WIDGETS
// ============================================================================

/**
 * Products KPI summary — widget PRODUCTS_KPI.
 */
export interface ProductsKpiData {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
  totalValue: string;
}

/**
 * Top selling product entry — widget TOP_SELLING_PRODUCTS.
 */
export interface TopSellingProductItem {
  productId: number;
  productCode: string;
  productName: string;
  quantitySold: number;
  totalRevenue: string;
}

/**
 * Product by category distribution entry — widget PRODUCTS_BY_CATEGORY.
 */
export interface ProductsByCategoryItem {
  categoryName: string;
  count: number;
  percentage: string;
}

/**
 * Products performance summary — widget PRODUCTS_PERFORMANCE.
 */
export interface ProductsPerformanceData {
  bestPerformer: { productName: string; revenue: string } | null;
  worstPerformer: { productName: string; revenue: string } | null;
  averageRevenue: string;
}

// ============================================================================
// TEAM / COLLABORATION WIDGETS
// ============================================================================

/**
 * Team member performance entry — widget TEAM_PERFORMANCE.
 */
export interface TeamPerformanceItem {
  userId: number;
  username: string;
  leadsCount: number;
  opportunitiesCount: number;
  activitiesCompleted: number;
  revenue: string;
}

// ============================================================================
// ALERTS WIDGET
// ============================================================================

/**
 * System alert entry — widget ALERTS.
 * severity uses HIGH/MEDIUM/LOW from backend (not info/warning/error).
 */
export interface DashboardAlertItem {
  id: string;
  type: string; // e.g. "LOW_STOCK", "OVERDUE_INVOICE"
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
  createdAt: string; // ISO date string
  relatedId?: number;
}

// ============================================================================
// WIDGET DATA MAP — maps each DashboardWidgetType to its data type
// ============================================================================

/**
 * Complete type map from widget type to its data shape.
 * Used to strongly type widget props without casting to `any`.
 */
export interface DashboardWidgetDataMap {
  [DashboardWidgetType.LEADS_KPI]: LeadsKpiData;
  [DashboardWidgetType.LEADS_FUNNEL]: LeadsFunnelItem[];
  [DashboardWidgetType.LEADS_FOLLOWUP]: LeadsFollowUpItem[];
  [DashboardWidgetType.LEADS_SOURCE]: LeadsSourceItem[];

  [DashboardWidgetType.OPPORTUNITIES_KPI]: OpportunitiesKpiData;
  [DashboardWidgetType.OPPORTUNITIES_PIPELINE]: OpportunitiesPipelineItem[];
  [DashboardWidgetType.OPPORTUNITIES_FORECAST]: OpportunitiesForecastData;

  [DashboardWidgetType.ACTIVITIES_FEED]: ActivityFeedItem[];
  [DashboardWidgetType.ACTIVITIES_KPI]: ActivitiesKpiData;
  [DashboardWidgetType.ACTIVITIES_BY_TYPE]: ActivitiesByTypeItem[];

  [DashboardWidgetType.CUSTOMERS_KPI]: CustomersKpiData;
  [DashboardWidgetType.TOP_CUSTOMERS]: TopCustomerItem[];
  [DashboardWidgetType.CUSTOMERS_LIFECYCLE]: CustomerLifecycleItem[];

  [DashboardWidgetType.REVENUE_KPI]: RevenueKpiData;
  [DashboardWidgetType.INVOICES_STATUS]: InvoicesStatusItem[];
  [DashboardWidgetType.OVERDUE_INSTALLMENTS]: OverdueInstallmentItem[];
  [DashboardWidgetType.REVENUE_TREND]: RevenueTrendPoint[];

  [DashboardWidgetType.SUPPLIER_ORDERS_KPI]: SupplierOrdersKpiData;
  [DashboardWidgetType.PURCHASE_TREND]: PurchaseTrendPoint[];

  [DashboardWidgetType.CASH_FLOW]: CashFlowData;
  [DashboardWidgetType.PROFIT_MARGIN]: ProfitMarginData;
  [DashboardWidgetType.ACCOUNTS_PAYABLE]: AccountsData;
  [DashboardWidgetType.ACCOUNTS_RECEIVABLE]: AccountsData;

  [DashboardWidgetType.DOCUMENTS_KPI]: DocumentsKpiData;
  [DashboardWidgetType.DOCUMENTS_BY_TYPE]: DocumentsByTypeItem[];
  [DashboardWidgetType.RECENT_DOCUMENTS]: RecentDocumentItem[];
  [DashboardWidgetType.DOCUMENTS_FULFILLMENT]: DocumentsFulfillmentData;
  [DashboardWidgetType.EXPIRING_QUOTES]: ExpiringQuoteItem[];

  [DashboardWidgetType.STOCK_ALERTS]: StockAlertItem[];
  [DashboardWidgetType.STOCK_VALUE]: StockValueData;
  [DashboardWidgetType.STOCK_MOVEMENTS]: StockMovementItem[];

  [DashboardWidgetType.DELIVERIES_KPI]: DeliveriesKpiData;
  [DashboardWidgetType.DELIVERY_PERFORMANCE]: DeliveryPerformanceData;

  [DashboardWidgetType.PRODUCTS_KPI]: ProductsKpiData;
  [DashboardWidgetType.TOP_SELLING_PRODUCTS]: TopSellingProductItem[];
  [DashboardWidgetType.PRODUCTS_BY_CATEGORY]: ProductsByCategoryItem[];
  [DashboardWidgetType.PRODUCTS_PERFORMANCE]: ProductsPerformanceData;

  [DashboardWidgetType.TEAM_PERFORMANCE]: TeamPerformanceItem[];

  [DashboardWidgetType.ALERTS]: DashboardAlertItem[];

  // Not yet implemented — placeholder
  [DashboardWidgetType.USER_ACTIVITY]: WidgetNotImplemented;
  [DashboardWidgetType.TASKS_OVERVIEW]: WidgetNotImplemented;
  [DashboardWidgetType.REMINDERS]: WidgetNotImplemented;
  [DashboardWidgetType.SALES_ANALYTICS]: WidgetNotImplemented;
  [DashboardWidgetType.CUSTOMER_ANALYTICS]: WidgetNotImplemented;
  [DashboardWidgetType.PERFORMANCE_SUMMARY]: WidgetNotImplemented;
}

// ============================================================================
// API RESPONSE TYPE
// ============================================================================

/**
 * Shape of the data payload from GET /api/dashboard.
 * layout contains the active widget grid (custom or role default).
 * widgets is a partial map — only enabled widgets are populated.
 */
export interface DashboardResponseData {
  period: DashboardPeriod;
  scope: DashboardScope;
  dateFrom: string | null;
  dateTo: string | null;
  /** Active layout — custom user layout or role default */
  layout: WidgetPositionInput[];
  /** Partial map: only widgets enabled for this user are present */
  widgets: Partial<DashboardWidgetDataMap>;
}

/**
 * Full API response for GET /api/dashboard.
 * Wraps DashboardResponseData in the standard ApiResponse envelope.
 */
export type DashboardApiResponse = ApiResponse<DashboardResponseData>;

// ============================================================================
// LEGACY / UNUSED — kept for reference, to be removed
// ============================================================================

/**
 * @deprecated Use DashboardResponseData instead.
 * The old DashboardData/DashboardResponse types had incorrect field names.
 */
export interface DashboardLayout {
  userId: number;
  roleCode: DashboardRoleCode;
  widgets: WidgetPositionInput[];
  savedAt: Date;
}