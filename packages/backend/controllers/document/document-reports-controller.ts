// document-reports-controller.ts
import type { Context } from "hono";
import type { AppBindings } from "@/lib/hono-app";
import type {
  AgingReportInput,
  DocumentStatsInput,
  OverdueInstallmentsQueryInput,
  SalesReportInput,
  TopProductsReportInput,
} from "@mini-erp/shared";
import { getValidatedQuery } from "@/helpers/validated-context";
import { requireDocumentContext } from "@/helpers/document/document-context";
import { sendSuccess } from "@/utils/response-utils";
import {
  getDocumentStatistics,
  getSalesReport as getSalesReportService,
  getAgingReport as getAgingReportService,
  getTopProducts as getTopProductsService,
  getOverdueInstallments as getOverdueInstallmentsService,
} from "@/services/document";

/**
 * Aggregates document counts and amounts by type, status, customer or period.
 * @route GET /api/documents/reports/statistics
 * @access Private (report:read | document:manage)
 */
export const getDocumentStats = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const input = getValidatedQuery<DocumentStatsInput>(c);
  return sendSuccess(c, await getDocumentStatistics({ input, tenantId }));
};

/**
 * Sales report on invoices and credit notes, grouped by customer, product or period.
 * @route GET /api/documents/reports/sales
 * @access Private (report:read | document:manage)
 */
export const getSalesReport = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const input = getValidatedQuery<SalesReportInput>(c);
  return sendSuccess(c, await getSalesReportService({ input, tenantId }));
};

/**
 * Receivables aging on overdue sales invoices.
 * @route GET /api/documents/reports/aging
 * @access Private (report:read | document:manage)
 */
export const getAgingReport = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const input = getValidatedQuery<AgingReportInput>(c);
  return sendSuccess(c, await getAgingReportService({ input, tenantId }));
};

/**
 * Top products by net revenue on sales invoices.
 * @route GET /api/documents/reports/top-products
 * @access Private (report:read | document:manage)
 */
export const getTopProducts = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const input = getValidatedQuery<TopProductsReportInput>(c);
  return sendSuccess(c, await getTopProductsService({ input, tenantId }));
};

/**
 * Overdue payment installments of payable documents.
 * @route GET /api/documents/reports/overdue-installments
 * @access Private (report:read | document:manage)
 */
export const getOverdueInstallments = async (c: Context<AppBindings>) => {
  const { tenantId } = requireDocumentContext(c);
  const input = getValidatedQuery<OverdueInstallmentsQueryInput>(c);
  return sendSuccess(c, await getOverdueInstallmentsService({ input, tenantId }));
};
