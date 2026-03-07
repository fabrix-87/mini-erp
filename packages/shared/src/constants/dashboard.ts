// ============================================================================
// DASHBOARD CONSTANTS
// ============================================================================

/**
 * All available widget types across all roles.
 * Organized by functional area for better maintainability.
 */
export enum DashboardWidgetType {
  // ══════════════════════════════════════════════════════════════════════════
  // CRM / SALES WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  // Leads
  LEADS_KPI = "LEADS_KPI", // Overview: total, active, conversion rate
  LEADS_FUNNEL = "LEADS_FUNNEL", // Funnel visualization (NEW → CONTACTED → QUALIFIED → CONVERTED)
  LEADS_FOLLOWUP = "LEADS_FOLLOWUP", // Leads requiring follow-up (no recent contact)
  LEADS_SOURCE = "LEADS_SOURCE", // Distribution by source (website, referral, etc.)

  // Opportunities
  OPPORTUNITIES_KPI = "OPPORTUNITIES_KPI", // Overview: total, open, won, lost, win rate
  OPPORTUNITIES_PIPELINE = "OPPORTUNITIES_PIPELINE", // Pipeline by stage with values
  OPPORTUNITIES_FORECAST = "OPPORTUNITIES_FORECAST", // Weighted forecast with expected close dates

  // Activities
  ACTIVITIES_FEED = "ACTIVITIES_FEED", // Recent activities feed
  ACTIVITIES_KPI = "ACTIVITIES_KPI", // Overview: total, overdue, today, completed
  ACTIVITIES_BY_TYPE = "ACTIVITIES_BY_TYPE", // Distribution by type (call, meeting, email)

  // Customers
  CUSTOMERS_KPI = "CUSTOMERS_KPI", // Overview: total, active, new, VIP
  TOP_CUSTOMERS = "TOP_CUSTOMERS", // Top customers by revenue
  CUSTOMERS_LIFECYCLE = "CUSTOMERS_LIFECYCLE", // Distribution by lifecycle stage

  // ══════════════════════════════════════════════════════════════════════════
  // FINANCE / ACCOUNTING WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  // Revenue & Invoicing
  REVENUE_KPI = "REVENUE_KPI", // Total revenue, paid, pending, growth
  INVOICES_STATUS = "INVOICES_STATUS", // Invoices by status distribution
  OVERDUE_INSTALLMENTS = "OVERDUE_INSTALLMENTS", // Payment installments past due
  REVENUE_TREND = "REVENUE_TREND", // Revenue trend over time (monthly)

  // Purchasing
  SUPPLIER_ORDERS_KPI = "SUPPLIER_ORDERS_KPI", // Supplier orders overview
  PURCHASE_TREND = "PURCHASE_TREND", // Purchase trend over time

  // Financial Health
  CASH_FLOW = "CASH_FLOW", // Cash flow analysis (in/out)
  PROFIT_MARGIN = "PROFIT_MARGIN", // Profit margin trends
  ACCOUNTS_PAYABLE = "ACCOUNTS_PAYABLE", // Outstanding payables summary
  ACCOUNTS_RECEIVABLE = "ACCOUNTS_RECEIVABLE", // Outstanding receivables summary

  // ══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  DOCUMENTS_KPI = "DOCUMENTS_KPI", // Documents overview (draft, sent, paid)
  DOCUMENTS_BY_TYPE = "DOCUMENTS_BY_TYPE", // Distribution by type (quote, order, invoice)
  RECENT_DOCUMENTS = "RECENT_DOCUMENTS", // Latest documents feed
  DOCUMENTS_FULFILLMENT = "DOCUMENTS_FULFILLMENT", // Order fulfillment status
  EXPIRING_QUOTES = "EXPIRING_QUOTES", // Quotes expiring soon

  // ══════════════════════════════════════════════════════════════════════════
  // WAREHOUSE / LOGISTICS WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  // Inventory
  STOCK_ALERTS = "STOCK_ALERTS", // Low stock & out of stock alerts
  STOCK_VALUE = "STOCK_VALUE", // Total inventory value
  STOCK_MOVEMENTS = "STOCK_MOVEMENTS", // Recent stock movements

  // Deliveries
  DELIVERIES_KPI = "DELIVERIES_KPI", // Deliveries overview (pending, in transit, delivered)
  DELIVERY_PERFORMANCE = "DELIVERY_PERFORMANCE", // On-time delivery rate

  // ══════════════════════════════════════════════════════════════════════════
  // PRODUCTS WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  PRODUCTS_KPI = "PRODUCTS_KPI", // Products overview (total, active, low stock)
  TOP_SELLING_PRODUCTS = "TOP_SELLING_PRODUCTS", // Best selling products by quantity/revenue
  PRODUCTS_BY_CATEGORY = "PRODUCTS_BY_CATEGORY", // Product distribution by category
  PRODUCTS_PERFORMANCE = "PRODUCTS_PERFORMANCE", // Product performance metrics

  // ══════════════════════════════════════════════════════════════════════════
  // TEAM / COLLABORATION WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  TEAM_PERFORMANCE = "TEAM_PERFORMANCE", // Team member performance metrics
  USER_ACTIVITY = "USER_ACTIVITY", // Recent user activity log
  TASKS_OVERVIEW = "TASKS_OVERVIEW", // Tasks/activities assigned to team

  // ══════════════════════════════════════════════════════════════════════════
  // ALERTS / NOTIFICATIONS WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  ALERTS = "ALERTS", // System alerts & notifications (overdue, low stock, etc.)
  REMINDERS = "REMINDERS", // Upcoming reminders & deadlines

  // ══════════════════════════════════════════════════════════════════════════
  // ANALYTICS / REPORTING WIDGETS
  // ══════════════════════════════════════════════════════════════════════════

  SALES_ANALYTICS = "SALES_ANALYTICS", // Advanced sales analytics
  CUSTOMER_ANALYTICS = "CUSTOMER_ANALYTICS", // Customer behavior analytics
  PERFORMANCE_SUMMARY = "PERFORMANCE_SUMMARY", // Overall business performance summary
}

/**
 * Data scope for dashboard queries.
 * OWN: current user only (default).
 * TEAM: current user's team (MANAGER only — future use).
 * ALL: all users (ADMIN only).
 */
export enum DashboardScope {
  OWN = "OWN",
  TEAM = "TEAM",
  ALL = "ALL",
}

/**
 * Time period options for KPI calculations.
 */
export enum DashboardPeriod {
  CURRENT_MONTH = "CURRENT_MONTH",
  LAST_MONTH = "LAST_MONTH",
  LAST_3_MONTHS = "LAST_3_MONTHS",
  CURRENT_QUARTER = "CURRENT_QUARTER",
  LAST_QUARTER = "LAST_QUARTER",
  CURRENT_YEAR = "CURRENT_YEAR",
  LAST_YEAR = "LAST_YEAR",
  CUSTOM = "CUSTOM",
}

/**
 * Dashboard role codes — must match Role.code in the database exactly.
 */
export const DASHBOARD_ROLE_CODES = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  SALES: "SALES",
  WAREHOUSE: "WAREHOUSE",
  USER: "USER",
} as const;

export type DashboardRoleCode =
  (typeof DASHBOARD_ROLE_CODES)[keyof typeof DASHBOARD_ROLE_CODES];

/**
 * Widgets allowed per role.
 * The backend filters the response; the frontend renders only authorized widgets.
 */
export const ROLE_WIDGET_ALLOWLIST: Record<
  DashboardRoleCode,
  DashboardWidgetType[]
> = {
  [DASHBOARD_ROLE_CODES.ADMIN]: Object.values(DashboardWidgetType),

  [DASHBOARD_ROLE_CODES.MANAGER]: [
    DashboardWidgetType.LEADS_KPI,
    DashboardWidgetType.LEADS_FUNNEL,
    DashboardWidgetType.LEADS_FOLLOWUP,
    DashboardWidgetType.OPPORTUNITIES_KPI,
    DashboardWidgetType.OPPORTUNITIES_PIPELINE,
    DashboardWidgetType.OPPORTUNITIES_FORECAST,
    DashboardWidgetType.ACTIVITIES_FEED,
    DashboardWidgetType.ACTIVITIES_KPI,
    DashboardWidgetType.REVENUE_KPI,
    DashboardWidgetType.INVOICES_STATUS,
    DashboardWidgetType.OVERDUE_INSTALLMENTS,
    DashboardWidgetType.REVENUE_TREND,
    DashboardWidgetType.SUPPLIER_ORDERS_KPI,
    DashboardWidgetType.TEAM_PERFORMANCE,
    DashboardWidgetType.RECENT_DOCUMENTS,
    DashboardWidgetType.ALERTS,
  ],

  [DASHBOARD_ROLE_CODES.SALES]: [
    DashboardWidgetType.LEADS_KPI,
    DashboardWidgetType.LEADS_FUNNEL,
    DashboardWidgetType.LEADS_FOLLOWUP,
    DashboardWidgetType.OPPORTUNITIES_KPI,
    DashboardWidgetType.OPPORTUNITIES_PIPELINE,
    DashboardWidgetType.OPPORTUNITIES_FORECAST,
    DashboardWidgetType.ACTIVITIES_FEED,
    DashboardWidgetType.ACTIVITIES_KPI,
    DashboardWidgetType.RECENT_DOCUMENTS,
    DashboardWidgetType.ALERTS,
  ],

  [DASHBOARD_ROLE_CODES.WAREHOUSE]: [
    DashboardWidgetType.DELIVERIES_KPI,
    DashboardWidgetType.STOCK_ALERTS,
    DashboardWidgetType.DOCUMENTS_FULFILLMENT,
    DashboardWidgetType.RECENT_DOCUMENTS,
    DashboardWidgetType.ALERTS,
  ],

  [DASHBOARD_ROLE_CODES.USER]: [
    DashboardWidgetType.ACTIVITIES_FEED,
    DashboardWidgetType.ACTIVITIES_KPI,
    DashboardWidgetType.RECENT_DOCUMENTS,
    DashboardWidgetType.ALERTS,
  ],
};

/**
 * Default widget layout grid positions per role (12-column grid).
 * col/row are 0-indexed; w/h are in grid units.
 * Saved to UserSetting as "dashboard.layout" when the user first opens the dashboard.
 */
export const DEFAULT_WIDGET_LAYOUTS: Record<
  DashboardRoleCode,
  Array<{
    widgetType: DashboardWidgetType;
    col: number;
    row: number;
    w: number;
    h: number;
  }>
> = {
  [DASHBOARD_ROLE_CODES.ADMIN]: [
    { widgetType: DashboardWidgetType.LEADS_KPI, col: 0, row: 0, w: 3, h: 1 },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_KPI,
      col: 3,
      row: 0,
      w: 3,
      h: 1,
    },
    { widgetType: DashboardWidgetType.REVENUE_KPI, col: 6, row: 0, w: 3, h: 1 },
    {
      widgetType: DashboardWidgetType.ACTIVITIES_KPI,
      col: 9,
      row: 0,
      w: 3,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_PIPELINE,
      col: 0,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.REVENUE_TREND,
      col: 6,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.LEADS_FUNNEL,
      col: 0,
      row: 3,
      w: 4,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.ACTIVITIES_FEED,
      col: 4,
      row: 3,
      w: 4,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.OVERDUE_INSTALLMENTS,
      col: 8,
      row: 3,
      w: 4,
      h: 2,
    },
  ],

  [DASHBOARD_ROLE_CODES.MANAGER]: [
    { widgetType: DashboardWidgetType.LEADS_KPI, col: 0, row: 0, w: 3, h: 1 },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_KPI,
      col: 3,
      row: 0,
      w: 3,
      h: 1,
    },
    { widgetType: DashboardWidgetType.REVENUE_KPI, col: 6, row: 0, w: 3, h: 1 },
    {
      widgetType: DashboardWidgetType.TEAM_PERFORMANCE,
      col: 9,
      row: 0,
      w: 3,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_PIPELINE,
      col: 0,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.REVENUE_TREND,
      col: 6,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.LEADS_FOLLOWUP,
      col: 0,
      row: 3,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.OVERDUE_INSTALLMENTS,
      col: 6,
      row: 3,
      w: 6,
      h: 2,
    },
  ],

  [DASHBOARD_ROLE_CODES.SALES]: [
    { widgetType: DashboardWidgetType.LEADS_KPI, col: 0, row: 0, w: 4, h: 1 },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_KPI,
      col: 4,
      row: 0,
      w: 4,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.ACTIVITIES_KPI,
      col: 8,
      row: 0,
      w: 4,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.OPPORTUNITIES_PIPELINE,
      col: 0,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.LEADS_FUNNEL,
      col: 6,
      row: 1,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.LEADS_FOLLOWUP,
      col: 0,
      row: 3,
      w: 6,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.ACTIVITIES_FEED,
      col: 6,
      row: 3,
      w: 6,
      h: 2,
    },
  ],

  [DASHBOARD_ROLE_CODES.WAREHOUSE]: [
    {
      widgetType: DashboardWidgetType.DELIVERIES_KPI,
      col: 0,
      row: 0,
      w: 4,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.DOCUMENTS_FULFILLMENT,
      col: 4,
      row: 0,
      w: 4,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.STOCK_ALERTS,
      col: 8,
      row: 0,
      w: 4,
      h: 1,
    },
    {
      widgetType: DashboardWidgetType.RECENT_DOCUMENTS,
      col: 0,
      row: 1,
      w: 8,
      h: 2,
    },
    { widgetType: DashboardWidgetType.ALERTS, col: 8, row: 1, w: 4, h: 2 },
  ],

  [DASHBOARD_ROLE_CODES.USER]: [
    {
      widgetType: DashboardWidgetType.ACTIVITIES_KPI,
      col: 0,
      row: 0,
      w: 6,
      h: 1,
    },
    { widgetType: DashboardWidgetType.ALERTS, col: 6, row: 0, w: 6, h: 1 },
    {
      widgetType: DashboardWidgetType.ACTIVITIES_FEED,
      col: 0,
      row: 1,
      w: 8,
      h: 2,
    },
    {
      widgetType: DashboardWidgetType.RECENT_DOCUMENTS,
      col: 8,
      row: 1,
      w: 4,
      h: 2,
    },
  ],
};

/** Key used in UserSetting table to store the dashboard layout JSON */
export const DASHBOARD_LAYOUT_SETTING_KEY = "dashboard.layout" as const;
