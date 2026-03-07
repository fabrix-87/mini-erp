// ============================================================================
// UNIFIED DASHBOARD CONTROLLER
// ============================================================================

import { Response } from "express";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import { sendSuccess, sendFail } from "@/utils/response";
import {
  DashboardQueryInput,
  UpdateLayoutInput,
  DashboardWidgetType,
  DEFAULT_WIDGET_LAYOUTS,
  DASHBOARD_LAYOUT_SETTING_KEY,
  DashboardScope,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-client";
import {
  periodToDateRange,
  isScopeAllowedForRoles,
  getPrimaryRole,
  getAllowedWidgets,
} from "@/helpers/dashboard";
import { Prisma } from "@/generated/prisma/client";
import * as dashboardServices from "@/services/dashboard";

/**
 * @desc   Get unified dashboard data with all authorized widgets
 * @route  GET /api/dashboard
 * @access Private (all authenticated users)
 */
export const getUnifiedDashboard = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { period, scope, targetUserId, customFrom, customTo, feedLimit } =
      req.validatedQuery as DashboardQueryInput;

    const currentUser = req.user!;
    const userRoles = currentUser.roles; // Array<{ id, code, name }>

    // 1. Scope authorization
    if (!isScopeAllowedForRoles(userRoles, scope)) {
      sendFail(res, {
        statusCode: 403,
        message: `I tuoi ruoli non hanno accesso allo scope ${scope}`,
      });
      return;
    }

    // 2. Determine effective user ID
    let effectiveUserId = currentUser.userId;
    if (scope === DashboardScope.TEAM || scope === DashboardScope.ALL) {
      effectiveUserId = targetUserId ?? currentUser.userId;
    }

    // 3. Get date range
    const [dateFrom, dateTo] = periodToDateRange(
      period,
      customFrom ?? undefined,
      customTo ?? undefined,
    );

    // 4. Load user's custom layout or default
    const layoutSetting = await prisma.userSetting.findUnique({
      where: {
        userId_key: {
          userId: currentUser.userId,
          key: DASHBOARD_LAYOUT_SETTING_KEY,
        },
      },
    });

    const customLayout = layoutSetting?.value as
      | Array<{ widgetType: DashboardWidgetType; visible: boolean }>
      | undefined;

    // 5. Determine which widgets to show
    const allowedWidgets = getAllowedWidgets(userRoles);
    const enabledWidgets = customLayout
      ? customLayout
          .filter((w) => w.visible && allowedWidgets.includes(w.widgetType))
          .map((w) => w.widgetType)
      : allowedWidgets;

    // 6. Get default layout for primary role
    const primaryRole = getPrimaryRole(userRoles);
    const defaultLayout = DEFAULT_WIDGET_LAYOUTS[primaryRole];

    // 7. Fetch data for each enabled widget
    const widgets: Record<string, unknown> = {};

    for (const widgetType of enabledWidgets) {
      try {
        widgets[widgetType] = await fetchWidgetData(
          widgetType,
          effectiveUserId,
          dateFrom,
          dateTo,
          feedLimit,
          scope,
        );
      } catch (err) {
        console.error(`Error fetching widget ${widgetType}:`, err);
        widgets[widgetType] = { error: "Impossibile caricare i dati" };
      }
    }

    sendSuccess(res, {
      period,
      scope,
      dateFrom,
      dateTo,
      layout: customLayout ?? defaultLayout,
      widgets,
    });
  },
);

/**
 * @desc   Save or update user's custom dashboard layout
 * @route  PUT /api/dashboard/layout
 * @access Private (all authenticated users)
 */
export const updateDashboardLayout = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { widgets } = req.validatedBody as UpdateLayoutInput;
    const userId = req.user!.userId;
    const userRoles = req.user!.roles;

    // Validate that all widgets are allowed for user's roles
    const allowedWidgets = getAllowedWidgets(userRoles);
    const invalidWidgets = widgets.filter(
      (w) => !allowedWidgets.includes(w.widgetType),
    );

    if (invalidWidgets.length > 0) {
      sendFail(res, {
        statusCode: 403,
        message: `Widget non autorizzati: ${invalidWidgets.map((w) => w.widgetType).join(", ")}`,
      });
      return;
    }

    // Upsert UserSetting
    await prisma.userSetting.upsert({
      where: {
        userId_key: {
          userId,
          key: DASHBOARD_LAYOUT_SETTING_KEY,
        },
      },
      update: {
        value: widgets as unknown as Prisma.InputJsonValue,
      },
      create: {
        userId,
        key: DASHBOARD_LAYOUT_SETTING_KEY,
        value: widgets as unknown as Prisma.InputJsonValue,
      },
    });

    sendSuccess(res, { message: "Layout salvato con successo" });
  },
);

/**
 * @desc   Reset user's dashboard layout to role default
 * @route  DELETE /api/dashboard/layout
 * @access Private (all authenticated users)
 */
export const resetDashboardLayout = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await prisma.userSetting.deleteMany({
      where: {
        userId,
        key: DASHBOARD_LAYOUT_SETTING_KEY,
      },
    });

    sendSuccess(res, { message: "Layout ripristinato al default" });
  },
);

// ============================================================================
// WIDGET DATA DISPATCHER
// ============================================================================

/**
 * Dispatcher that routes to the appropriate widget service
 */
async function fetchWidgetData(
  widgetType: DashboardWidgetType,
  userId: number,
  dateFrom: Date | null,
  dateTo: Date | null,
  feedLimit: number,
  scope: DashboardScope,
): Promise<unknown> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferredLanguageId: true },
  });
  const preferredLanguageId = user?.preferredLanguageId ?? 1;

  switch (widgetType) {
    // ── CRM / SALES ───────────────────────────────────────────────────────
    case DashboardWidgetType.LEADS_KPI:
      return dashboardServices.fetchLeadsKPI(userId, dateFrom, dateTo, scope);
    case DashboardWidgetType.LEADS_FUNNEL:
      return dashboardServices.fetchLeadsFunnel(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.LEADS_FOLLOWUP:
      return dashboardServices.fetchLeadsFollowUp(userId, feedLimit, scope);
    case DashboardWidgetType.LEADS_SOURCE:
      return dashboardServices.fetchLeadsSourceDistribution(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    case DashboardWidgetType.OPPORTUNITIES_KPI:
      return dashboardServices.fetchOpportunitiesKPI(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.OPPORTUNITIES_PIPELINE:
      return dashboardServices.fetchOpportunitiesPipeline(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.OPPORTUNITIES_FORECAST:
      return dashboardServices.fetchOpportunitiesForecast(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    case DashboardWidgetType.ACTIVITIES_FEED:
      return dashboardServices.fetchActivitiesFeed(userId, feedLimit, scope);
    case DashboardWidgetType.ACTIVITIES_KPI:
      return dashboardServices.fetchActivitiesKPI(userId, scope);
    case DashboardWidgetType.ACTIVITIES_BY_TYPE:
      return dashboardServices.fetchActivitiesByType(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    case DashboardWidgetType.CUSTOMERS_KPI:
      return dashboardServices.fetchCustomersKPI(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.TOP_CUSTOMERS:
      return dashboardServices.fetchTopCustomers(feedLimit, dateFrom, dateTo);
    case DashboardWidgetType.CUSTOMERS_LIFECYCLE:
      return dashboardServices.fetchCustomerLifecycle(dateFrom, dateTo);

    // ── FINANCE / ACCOUNTING ──────────────────────────────────────────────
    case DashboardWidgetType.REVENUE_KPI:
      return dashboardServices.fetchRevenueKPI(userId, dateFrom, dateTo, scope);
    case DashboardWidgetType.INVOICES_STATUS:
      return dashboardServices.fetchInvoicesStatus(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.OVERDUE_INSTALLMENTS:
      return dashboardServices.fetchOverdueInstallments(
        userId,
        feedLimit,
        scope,
      );
    case DashboardWidgetType.REVENUE_TREND:
      return dashboardServices.fetchRevenueTrend(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    case DashboardWidgetType.SUPPLIER_ORDERS_KPI:
      return dashboardServices.fetchSupplierOrdersKPI(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.PURCHASE_TREND:
      return dashboardServices.fetchPurchaseTrend(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    case DashboardWidgetType.CASH_FLOW:
      return dashboardServices.fetchCashFlow(userId, dateFrom, dateTo, scope);
    case DashboardWidgetType.PROFIT_MARGIN:
      return dashboardServices.fetchProfitMargin(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.ACCOUNTS_PAYABLE:
      return dashboardServices.fetchAccountsPayable(userId, scope);
    case DashboardWidgetType.ACCOUNTS_RECEIVABLE:
      return dashboardServices.fetchAccountsReceivable(userId, scope);

    // ── DOCUMENTS ─────────────────────────────────────────────────────────
    case DashboardWidgetType.DOCUMENTS_KPI:
      return dashboardServices.fetchDocumentsKPI(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.DOCUMENTS_BY_TYPE:
      return dashboardServices.fetchDocumentsByType(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.RECENT_DOCUMENTS:
      return dashboardServices.fetchRecentDocuments(userId, feedLimit, scope);
    case DashboardWidgetType.DOCUMENTS_FULFILLMENT:
      return dashboardServices.fetchDocumentsFulfillment(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.EXPIRING_QUOTES:
      return dashboardServices.fetchExpiringQuotes(userId, feedLimit, scope);

    // ── WAREHOUSE / LOGISTICS ─────────────────────────────────────────────
    case DashboardWidgetType.STOCK_ALERTS:
      return dashboardServices.fetchStockAlerts(feedLimit);
    case DashboardWidgetType.STOCK_VALUE:
      return dashboardServices.fetchStockValue();
    case DashboardWidgetType.STOCK_MOVEMENTS:
      return dashboardServices.fetchStockMovements(feedLimit);

    case DashboardWidgetType.DELIVERIES_KPI:
      return dashboardServices.fetchDeliveriesKPI(
        userId,
        dateFrom,
        dateTo,
        scope,
      );
    case DashboardWidgetType.DELIVERY_PERFORMANCE:
      return dashboardServices.fetchDeliveryPerformance(
        userId,
        dateFrom,
        dateTo,
        scope,
      );

    // ── PRODUCTS ──────────────────────────────────────────────────────────
    case DashboardWidgetType.PRODUCTS_KPI:
      return dashboardServices.fetchProductsKPI();
    case DashboardWidgetType.TOP_SELLING_PRODUCTS:
      return dashboardServices.fetchTopSellingProducts(
        feedLimit,
        dateFrom,
        dateTo,
        preferredLanguageId,
      );
    case DashboardWidgetType.PRODUCTS_BY_CATEGORY:
      return dashboardServices.fetchProductsByCategory();
    case DashboardWidgetType.PRODUCTS_PERFORMANCE:
      return dashboardServices.fetchProductsPerformance(dateFrom, dateTo);

    // ── TEAM / COLLABORATION ──────────────────────────────────────────────
    case DashboardWidgetType.TEAM_PERFORMANCE:
      return dashboardServices.fetchTeamPerformance(
        dateFrom,
        dateTo,
        feedLimit,
      );

    // ── ALERTS / NOTIFICATIONS ────────────────────────────────────────────
    case DashboardWidgetType.ALERTS:
      return dashboardServices.fetchAlerts(userId, feedLimit, scope);

    // ── PLACEHOLDERS (to implement later) ────────────────────────────────
    case DashboardWidgetType.USER_ACTIVITY:
    case DashboardWidgetType.TASKS_OVERVIEW:
    case DashboardWidgetType.REMINDERS:
    case DashboardWidgetType.SALES_ANALYTICS:
    case DashboardWidgetType.CUSTOMER_ANALYTICS:
    case DashboardWidgetType.PERFORMANCE_SUMMARY:
      return { message: "Widget non ancora implementato" };

    default:
      return { message: "Widget sconosciuto" };
  }
}
