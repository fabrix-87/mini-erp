// ============================================================================
// DASHBOARD HELPERS
// ============================================================================

import {
  DashboardPeriod,
  DashboardScope,
  DASHBOARD_ROLE_CODES,
  ROLE_WIDGET_ALLOWLIST,
  DashboardRoleCode,
  DashboardWidgetType,
} from "@mini-erp/shared";

/**
 * Converts a DashboardPeriod enum to a date range (from, to).
 * Returns [null, null] when period is CUSTOM (caller provides customFrom/customTo).
 */
export function periodToDateRange(
  period: DashboardPeriod,
  customFrom?: string,
  customTo?: string,
): [Date | null, Date | null] {
  const now = new Date();
  let from: Date | null = null;
  let to: Date | null = new Date(now);

  switch (period) {
    case DashboardPeriod.CURRENT_MONTH: {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case DashboardPeriod.LAST_MONTH: {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      from = lastMonth;
      to = new Date(now.getFullYear(), now.getMonth(), 0);
      break;
    }
    case DashboardPeriod.LAST_3_MONTHS: {
      from = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    }
    case DashboardPeriod.CURRENT_QUARTER: {
      const quarter = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    }
    case DashboardPeriod.LAST_QUARTER: {
      const quarter = Math.floor(now.getMonth() / 3);
      const prevQuarter = quarter === 0 ? 3 : quarter - 1;
      const prevYear = quarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      from = new Date(prevYear, prevQuarter * 3, 1);
      to = new Date(prevYear, prevQuarter * 3 + 3, 0);
      break;
    }
    case DashboardPeriod.CURRENT_YEAR: {
      from = new Date(now.getFullYear(), 0, 1);
      break;
    }
    case DashboardPeriod.LAST_YEAR: {
      from = new Date(now.getFullYear() - 1, 0, 1);
      to = new Date(now.getFullYear() - 1, 11, 31);
      break;
    }
    case DashboardPeriod.CUSTOM: {
      from = customFrom ? new Date(customFrom) : null;
      to = customTo ? new Date(customTo) : null;
      break;
    }
  }

  return [from, to];
}

/**
 * Role hierarchy for determining primary role when user has multiple roles.
 * Higher index = higher priority.
 */
const ROLE_HIERARCHY: DashboardRoleCode[] = [
  DASHBOARD_ROLE_CODES.USER,
  DASHBOARD_ROLE_CODES.WAREHOUSE,
  DASHBOARD_ROLE_CODES.SALES,
  DASHBOARD_ROLE_CODES.MANAGER,
  DASHBOARD_ROLE_CODES.ADMIN,
];

/**
 * Determines the "primary" role for dashboard layout based on hierarchy.
 * Returns the highest-priority role from the user's role list.
 */
export function getPrimaryRole(
  userRoles: Array<{ code: string }>,
): DashboardRoleCode {
  const roleCodes = userRoles.map((r) => r.code);

  // Find highest role in hierarchy
  for (let i = ROLE_HIERARCHY.length - 1; i >= 0; i--) {
    if (roleCodes.includes(ROLE_HIERARCHY[i])) {
      return ROLE_HIERARCHY[i];
    }
  }

  // Fallback to USER if no recognized role
  return DASHBOARD_ROLE_CODES.USER;
}

/**
 * Returns the union of all widgets allowed by the user's roles.
 * If user has multiple roles, they get widgets from all of them.
 */
export function getAllowedWidgets(
  userRoles: Array<{ code: string }>,
): DashboardWidgetType[] {
  const widgetSet = new Set<DashboardWidgetType>();

  for (const role of userRoles) {
    const widgets = ROLE_WIDGET_ALLOWLIST[role.code as DashboardRoleCode] ?? [];
    widgets.forEach((w) => widgetSet.add(w));
  }

  return Array.from(widgetSet);
}

/**
 * Checks if the user's roles allow viewing data for the requested scope.
 */
export function isScopeAllowedForRoles(
  userRoles: Array<{ code: string }>,
  requestedScope: DashboardScope,
): boolean {
  const roleCodes = userRoles.map((r) => r.code);

  if (requestedScope === DashboardScope.OWN) {
    return true; // All roles can view their own data
  }

  if (requestedScope === DashboardScope.TEAM) {
    return (
      roleCodes.includes(DASHBOARD_ROLE_CODES.MANAGER) ||
      roleCodes.includes(DASHBOARD_ROLE_CODES.ADMIN)
    );
  }

  if (requestedScope === DashboardScope.ALL) {
    return roleCodes.includes(DASHBOARD_ROLE_CODES.ADMIN);
  }

  return false;
}
