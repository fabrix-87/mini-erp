// ============================================================================
// DASHBOARD TYPES
// ============================================================================

import type Decimal from "decimal.js";
import type { ActivityType } from "./activity";
import type { DocumentType, DocumentStatus } from "./document";
import type { LeadStatus, LeadQuality } from "../constants/lead";
import type { OpportunityStatus, SalesStage } from "../constants/opportunity";
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

// ============================================================================
// QUERY / INPUT TYPES
// ============================================================================

/** Input parameters for a dashboard data request */
export type DashboardQueryInput = z.infer<typeof dashboardQuerySchema>;

/** Single widget position in the grid */
export type WidgetPositionInput = z.infer<typeof widgetPositionSchema>;

/** Payload to save a user's custom layout */
export type UpdateLayoutInput = z.infer<typeof updateLayoutSchema>;

// ============================================================================
// WIDGET LAYOUT
// ============================================================================

/**
 * Persisted configuration for a single widget in the user's layout.
 * Stored as JSON in a future UserDashboardLayout table or user settings.
 */
export interface DashboardWidgetConfig {
  /** Unique widget type identifier */
  widgetType: DashboardWidgetType;
  /** Column start (0-indexed, 12-col grid) */
  col: number;
  /** Row start (0-indexed) */
  row: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Whether the widget is visible */
  visible: boolean;
  /** Optional widget-level overrides (e.g. custom period) */
  overrides?: {
    period?: DashboardPeriod;
    limit?: number;
  };
}

/**
 * Complete saved layout for a user.
 * One row per user in UserDashboardLayout (future table).
 */
export interface DashboardLayout {
  userId: number;
  roleCode: DashboardRoleCode;
  widgets: DashboardWidgetConfig[];
  /** ISO timestamp of last manual save */
  savedAt: Date;
}

// ============================================================================
// KPI DOMAIN TYPES
// ============================================================================

/** Period metadata returned with every KPI block */
export interface PeriodMeta {
  period: DashboardPeriod;
  from: Date;
  to: Date;
  /** Optional comparison with previous equivalent period */
  comparison?: {
    from: Date;
    to: Date;
  };
}

/** Generic trend delta */
export interface TrendDelta {
  current: number | Decimal;
  previous: number | Decimal;
  /** Change in absolute value */
  delta: number | Decimal;
  /** Percentage change — positive = growth */
  percentageChange: number;
  trend: "up" | "down" | "stable";
}

// ─── SALES KPIs ────────────────────────────────────────────────────────────

/** KPI block for leads — widget LEADS_KPI */
export interface LeadsKpi {
  total: number;
  newThisPeriod: number;
  converted: number;
  conversionRate: number;
  lost: number;
  needFollowUp: number;
  overdueFollowUp: number;
  averageScore: number;
  byStatus: Partial<Record<LeadStatus, number>>;
  byQuality: Partial<Record<LeadQuality, number>>;
  trend: TrendDelta;
}

/** KPI block for opportunities — widget OPPORTUNITIES_KPI */
export interface OpportunitiesKpi {
  totalOpen: number;
  totalPipelineValue: Decimal;
  weightedPipelineValue: Decimal;
  wonThisPeriod: number;
  wonValue: Decimal;
  winRate: number;
  averageDealSize: Decimal;
  averageSalesCycle: number; // days
  byStatus: Partial<Record<OpportunityStatus, number>>;
  trend: TrendDelta;
}

/** Pipeline data by stage — widget OPPORTUNITIES_PIPELINE */
export interface PipelineStageSnapshot {
  stage: SalesStage;
  count: number;
  totalValue: Decimal;
  weightedValue: Decimal;
  averageDaysInStage: number;
  stagnantCount: number; // >30 days in stage without activity
}

/** Forecast block — widget OPPORTUNITIES_FORECAST */
export interface ForecastKpi {
  period: string;
  bestCase: Decimal;
  mostLikely: Decimal;
  worstCase: Decimal;
  closingThisMonth: number;
  closingThisQuarter: number;
}

/** Activities summary — widget ACTIVITIES_KPI */
export interface ActivitiesKpi {
  totalScheduled: number;
  dueToday: number;
  overdue: number;
  completedThisPeriod: number;
  completionRate: number;
  byType: Partial<Record<ActivityType, number>>;
}

// ─── ACCOUNTING KPIs ────────────────────────────────────────────────────────

/** Revenue KPIs — widget REVENUE_KPI */
export interface RevenueKpi {
  invoicedAmount: Decimal; // Fatturato emesso nel periodo
  collectedAmount: Decimal; // Effettivamente incassato
  outstandingAmount: Decimal; // Da incassare (non scaduto)
  overdueAmount: Decimal; // Scaduto e non pagato
  creditNotesAmount: Decimal; // Note credito emesse
  netRevenue: Decimal; // invoicedAmount - creditNotesAmount
  trend: TrendDelta;
}

/** Invoice status breakdown — widget INVOICES_STATUS */
export interface InvoicesStatusKpi {
  byStatus: Partial<Record<DocumentStatus, number>>;
  totalCount: number;
  totalAmount: Decimal;
  overdueCount: number;
  overdueAmount: Decimal;
}

/** Overdue installment alert — widget OVERDUE_INSTALLMENTS */
export interface OverdueInstallmentItem {
  documentId: number;
  documentNumber: string | null;
  customerName: string;
  installmentNumber: number;
  dueDate: Date;
  amount: Decimal;
  daysPastDue: number;
}

/** Revenue trend per time bucket — widget REVENUE_TREND */
export interface RevenueTrendPoint {
  label: string; // e.g. "Gen 2026", "W10"
  invoicedAmount: Decimal;
  collectedAmount: Decimal;
  creditNotesAmount: Decimal;
}

// ─── LOGISTICS KPIs ─────────────────────────────────────────────────────────

/** Deliveries summary — widget DELIVERIES_KPI */
export interface DeliveriesKpi {
  inTransit: number;
  deliveredThisPeriod: number;
  pendingPreparation: number; // Status PREPARING
  lateDeliveries: number; // Past deliveryDate and not DELIVERED
  onTimeRate: number;
}

/** Orders to fulfill — widget DOCUMENTS_FULFILLMENT */
export interface DocumentFulfillmentItem {
  documentId: number;
  documentNumber: string | null;
  documentType: DocumentType;
  customerName: string;
  status: DocumentStatus;
  expectedDate: Date | null;
  totalLines: number;
  fulfilledLines: number;
}

// ─── PURCHASING KPIs ────────────────────────────────────────────────────────

/** Supplier orders summary — widget SUPPLIER_ORDERS_KPI */
export interface SupplierOrdersKpi {
  openOrders: number;
  totalOpenValue: Decimal;
  expectedThisWeek: number;
  overdueOrders: number;
  receivedThisPeriod: number;
}

/** Purchase trend point — widget PURCHASE_TREND */
export interface PurchaseTrendPoint {
  label: string;
  purchasedAmount: Decimal;
  receivedAmount: Decimal;
}

// ─── CROSS-CUTTING ──────────────────────────────────────────────────────────

/** Activity feed item — widget ACTIVITIES_FEED */
export interface ActivityFeedItem {
  activityId: number;
  type: ActivityType;
  subject: string;
  scheduledStart: Date;
  isOverdue: boolean;
  relatedEntity: {
    type: "lead" | "opportunity" | "customer" | "company";
    id: number;
    name: string;
  } | null;
  assignedUserId: number;
  assignedUserName: string;
}

/** Stock alert item — widget STOCK_ALERTS */
export interface StockAlertItem {
  productId: number;
  productCode: string;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  currentStock: Decimal;
  minimumStock: Decimal;
  shortage: Decimal;
}

/** Recent document entry — widget RECENT_DOCUMENTS */
export interface RecentDocumentItem {
  documentId: number;
  documentNumber: string | null;
  documentType: DocumentType;
  status: DocumentStatus;
  customerName: string;
  totalAmount: Decimal;
  documentDate: Date;
}

/** Generic system alert — widget ALERTS */
export interface DashboardAlert {
  id: string; // deterministic key (e.g. "overdue_invoice_123")
  severity: "info" | "warning" | "error";
  category: DashboardWidgetType;
  message: string;
  entityId?: number;
  entityType?: string;
  actionUrl?: string;
  createdAt: Date;
}

// ============================================================================
// AGGREGATED DASHBOARD RESPONSE
// ============================================================================

/**
 * Full dashboard data payload returned by GET /api/dashboard.
 * Each key is optional — only widgets in the user's allowlist are populated.
 */
export interface DashboardData {
  meta: {
    userId: number;
    roleCode: DashboardRoleCode;
    scope: DashboardScope;
    periodMeta: PeriodMeta;
    generatedAt: Date;
  };

  // Sales
  leadsKpi?: LeadsKpi;
  leadsFunnel?: Array<{
    status: LeadStatus;
    count: number;
    percentage: number;
  }>;
  leadsFollowUp?: Array<{
    leadId: number;
    code: string;
    companyName: string;
    nextFollowUpDate: Date;
    daysPastDue: number;
  }>;
  opportunitiesKpi?: OpportunitiesKpi;
  pipeline?: PipelineStageSnapshot[];
  forecast?: ForecastKpi;
  activitiesKpi?: ActivitiesKpi;
  activitiesFeed?: ActivityFeedItem[];

  // Accounting
  revenueKpi?: RevenueKpi;
  invoicesStatus?: InvoicesStatusKpi;
  overdueInstallments?: OverdueInstallmentItem[];
  revenueTrend?: RevenueTrendPoint[];

  // Logistics
  deliveriesKpi?: DeliveriesKpi;
  documentsFulfillment?: DocumentFulfillmentItem[];

  // Purchasing
  supplierOrdersKpi?: SupplierOrdersKpi;
  purchaseTrend?: PurchaseTrendPoint[];

  // Cross-cutting
  stockAlerts?: StockAlertItem[];
  recentDocuments?: RecentDocumentItem[];
  alerts?: DashboardAlert[];
}

/** API response wrapper for GET /api/dashboard */
export interface DashboardResponse {
  success: true;
  data: DashboardData;
  layout: DashboardLayout;
}
