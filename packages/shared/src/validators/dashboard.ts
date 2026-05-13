// ============================================================================
// DASHBOARD VALIDATORS
// ============================================================================

import { z } from "zod";
import { DashboardScope, DashboardPeriod, DashboardWidgetType } from "../constants/dashboard";
import { createIdSchema } from "./primitives/id";
import { isoDateSchema } from "./primitives/date";
import { queryNumberRangeSchema } from "./query/params";

/**
 * Query parameters for fetching dashboard data (GET /api/dashboard).
 * All fields are optional — defaults match the most common use case.
 */
export const dashboardQuerySchema = z
  .object({
    /** Time period for KPI aggregation. Defaults to the current month. */
    period: z.enum(DashboardPeriod).default(DashboardPeriod.CURRENT_MONTH),

    /**
     * Data scope. Default is OWN (current user's data).
     * TEAM requires MANAGER role; ALL requires ADMIN role.
     * Scope enforcement happens at controller level.
     */
    scope: z.enum(DashboardScope).default(DashboardScope.OWN),

    /**
     * Target user ID — used only when scope is TEAM or ALL.
     * Ignored when scope is OWN.
     */
    targetUserId: createIdSchema("Target user ID non valido").optional(),

    /**
     * Range start — required only when period is CUSTOM.
     * Must be a valid ISO 8601 datetime string.
     */
    customFrom: isoDateSchema({ required: false }),

    /**
     * Range end — required only when period is CUSTOM.
     * Must be a valid ISO 8601 datetime string.
     */
    customTo: isoDateSchema({ required: false }),

    /**
     * Maximum number of items in feed/list widgets (activities, alerts, documents).
     * Accepted range: 5–50.
     */
    feedLimit: queryNumberRangeSchema(5, 50, {
      range: "feedLimit deve essere tra 5 e 50",
    }).transform((val) => val ?? 10),
  })
  .refine(
    (data) =>
      data.period !== DashboardPeriod.CUSTOM || (data.customFrom != null && data.customTo != null),
    {
      message: "customFrom e customTo sono obbligatori quando period è CUSTOM",
      path: ["customFrom"],
    },
  );

/**
 * Schema for a single widget configuration within the layout grid.
 * Grid uses 12 columns; rows are unbounded.
 */
export const widgetPositionSchema = z.object({
  /** Widget type identifier */
  widgetType: z.enum(DashboardWidgetType),

  /** Column start, 0-indexed (0–11) */
  col: z.number().int().min(0).max(11),

  /** Row start, 0-indexed */
  row: z.number().int().min(0),

  /** Width in grid units (1–12) */
  w: z.number().int().min(1).max(12),

  /** Height in grid units (1–6) */
  h: z.number().int().min(1).max(6),

  /** Whether the widget is rendered */
  visible: z.boolean().default(true),

  /**
   * Optional per-widget overrides (e.g. a custom period independent of
   * the global dashboard period).
   */
  overrides: z
    .object({
      period: z.enum(DashboardPeriod).optional(),
      feedLimit: queryNumberRangeSchema(5, 50, {
        range: "feedLimit deve essere tra 5 e 50",
      }).optional(),
    })
    .optional(),
});

/**
 * Payload for saving or resetting a user's custom dashboard layout.
 * Sent as JSON body to PUT /api/dashboard/layout.
 */
export const updateLayoutSchema = z.object({
  /** Array of widget configurations. At least 1, maximum 20. */
  widgets: z.array(widgetPositionSchema).min(1).max(20),
});

/**
 * Route param schema for admin-scoped endpoints (e.g. GET /api/dashboard/:userId).
 */
export const dashboardUserParamSchema = z.object({
  userId: createIdSchema("User ID non valido"),
});
