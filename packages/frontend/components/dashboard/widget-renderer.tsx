// packages/frontend/components/dashboard/widget-renderer.tsx
import { DashboardWidgetType, type DashboardWidgetDataMap } from "@mini-erp/shared";
import { WidgetWrapper } from "./widget-wrapper";
import { LeadsKpiWidget } from "./widgets/leads-kpi-widget";
import { OpportunitiesKpiWidget } from "./widgets/opportunities-kpi-widget";
import { RevenueKpiWidget } from "./widgets/revenue-kpi-widget";
import { ActivitiesKpiWidget } from "./widgets/activities-kpi-widget";
import { ActivitiesFeedWidget } from "./widgets/activities-feed-widget";
import { LeadsFunnelWidget } from "./widgets/leads-funnel-widget";
import { RevenueTrendWidget } from "./widgets/revenue-trend-widget";
import { OpportunitiesPipelineWidget } from "./widgets/opportunities-pipeline-widget";
import { OverdueInstallmentsWidget } from "./widgets/overdue-installments-widget";
import { StockAlertsWidget } from "./widgets/stock-alerts-widget";
import { AlertsWidget } from "./widgets/alerts-widget";

interface WidgetRendererProps {
  widgetType: DashboardWidgetType;
  data: Partial<DashboardWidgetDataMap>[DashboardWidgetType] | undefined;
  isLoading: boolean;
  isEditMode: boolean;
}

/**
 * Dispatches each DashboardWidgetType to its concrete React component.
 * Unrecognised or not-yet-implemented types render a placeholder.
 */
export function WidgetRenderer({ widgetType, data, isLoading, isEditMode }: WidgetRendererProps) {
  const common = { isLoading, isEditMode };

  switch (widgetType) {
    case DashboardWidgetType.LEADS_KPI:
      return (
        <LeadsKpiWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.LEADS_KPI]}
          {...common}
        />
      );
    case DashboardWidgetType.OPPORTUNITIES_KPI:
      return (
        <OpportunitiesKpiWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.OPPORTUNITIES_KPI]}
          {...common}
        />
      );
    case DashboardWidgetType.REVENUE_KPI:
      return (
        <RevenueKpiWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.REVENUE_KPI]}
          {...common}
        />
      );
    case DashboardWidgetType.ACTIVITIES_KPI:
      return (
        <ActivitiesKpiWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.ACTIVITIES_KPI]}
          {...common}
        />
      );
    case DashboardWidgetType.ACTIVITIES_FEED:
      return (
        <ActivitiesFeedWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.ACTIVITIES_FEED]}
          {...common}
        />
      );
    case DashboardWidgetType.LEADS_FUNNEL:
      return (
        <LeadsFunnelWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.LEADS_FUNNEL]}
          {...common}
        />
      );
    case DashboardWidgetType.REVENUE_TREND:
      return (
        <RevenueTrendWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.REVENUE_TREND]}
          {...common}
        />
      );
    case DashboardWidgetType.OPPORTUNITIES_PIPELINE:
      return (
        <OpportunitiesPipelineWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.OPPORTUNITIES_PIPELINE]}
          {...common}
        />
      );
    case DashboardWidgetType.OVERDUE_INSTALLMENTS:
      return (
        <OverdueInstallmentsWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.OVERDUE_INSTALLMENTS]}
          {...common}
        />
      );
    case DashboardWidgetType.STOCK_ALERTS:
      return (
        <StockAlertsWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.STOCK_ALERTS]}
          {...common}
        />
      );
    case DashboardWidgetType.ALERTS:
      return (
        <AlertsWidget
          data={data as DashboardWidgetDataMap[DashboardWidgetType.ALERTS]}
          {...common}
        />
      );
    default:
      return (
        <WidgetWrapper title={widgetType} isEditMode={isEditMode}>
          <p className="text-xs text-muted-foreground pt-2">Widget non ancora implementato.</p>
        </WidgetWrapper>
      );
  }
}
