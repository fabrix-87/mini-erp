import { prisma } from "@/config/prisma-config";
import { sendSuccess } from "@/utils/response-utils";
import {
  AgingReportInput,
  DocumentIdParam,
  DocumentStatsInput,
  SalesReportInput,
  TopProductsReportInput,
} from "@mini-erp/shared";
import { toIntId, withSoftDelete, parseOptionalDate } from "@/helpers/prisma-helper";
import { toPagination } from "@/helpers/prisma-helper";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedQuery, getValidatedParams } from "@/helpers/validated-context";
import { Prisma } from "@/generated/prisma/client";
import { NotFoundError } from "@/utils/app-error-utils";
import { Decimal } from "@prisma/client/runtime/client";

// ============================================================================
// DOCUMENT STATS
// ============================================================================

/**
 * Returns aggregated document statistics grouped by the requested dimension.
 * Supports grouping by documentType, status, customer, or time period (day/week/month).
 * @route GET /api/documents/stats
 * @access Private
 */
export const getDocumentStats = async (c: Context<AppBindings>) => {
  const query = getValidatedQuery<DocumentStatsInput>(c);

  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
  const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

  const baseWhere: Prisma.DocumentWhereInput = {
    deletedAt: null,
    ...(dateFrom || dateTo
      ? {
          documentDate: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
    ...(query.documentType && { documentType: query.documentType }),
    ...(query.customerId && { customerId: toIntId(query.customerId, "customerId") }),
  };

  // Aggregate counts and totals grouped by requested dimension
  if (query.groupBy === "documentType") {
    const rows = await prisma.document.groupBy({
      by: ["documentType"],
      where: baseWhere,
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true },
    });

    const data = rows.map((r) => ({
      documentType: r.documentType,
      count: r._count.id,
      totalAmount: r._sum.totalAmount ?? new Decimal(0),
      paidAmount: r._sum.paidAmount ?? new Decimal(0),
    }));

    return sendSuccess(c, { groupBy: "documentType", data });
  }

  if (query.groupBy === "status") {
    const rows = await prisma.document.groupBy({
      by: ["status"],
      where: baseWhere,
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    const data = rows.map((r) => ({
      status: r.status,
      count: r._count.id,
      totalAmount: r._sum.totalAmount ?? new Decimal(0),
    }));

    return sendSuccess(c, { groupBy: "status", data });
  }

  if (query.groupBy === "customer") {
    const rows = await prisma.document.groupBy({
      by: ["customerId", "customerName"],
      where: { ...baseWhere, customerId: { not: null } },
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    });

    const data = rows.map((r) => ({
      customerId: r.customerId,
      customerName: r.customerName,
      count: r._count.id,
      totalAmount: r._sum.totalAmount ?? new Decimal(0),
      paidAmount: r._sum.paidAmount ?? new Decimal(0),
    }));

    return sendSuccess(c, { groupBy: "customer", data });
  }

  // Time period grouping: day / week / month
  const periodTruncMap: Record<string, string> = {
    day: "day",
    week: "week",
    month: "month",
  };

  const truncPeriod = periodTruncMap[query.groupBy ?? "month"] ?? "month";

  // Use raw SQL for date truncation (Prisma doesn't support DATE_TRUNC natively)
  const rows = await prisma.$queryRaw<
    { period: Date; count: bigint; total_amount: Decimal; paid_amount: Decimal }[]
  >`
    SELECT
      DATE_TRUNC(${truncPeriod}, "documentDate") AS period,
      COUNT(*)::bigint                            AS count,
      COALESCE(SUM("totalAmount"), 0)             AS total_amount,
      COALESCE(SUM("paidAmount"), 0)              AS paid_amount
    FROM "Document"
    WHERE
      "deletedAt" IS NULL
      ${dateFrom ? Prisma.sql`AND "documentDate" >= ${dateFrom}` : Prisma.empty}
      ${dateTo ? Prisma.sql`AND "documentDate" <= ${dateTo}` : Prisma.empty}
      ${query.documentType ? Prisma.sql`AND "documentType" = ${query.documentType}` : Prisma.empty}
      ${query.customerId ? Prisma.sql`AND "customerId" = ${toIntId(query.customerId, "customerId")}` : Prisma.empty}
    GROUP BY DATE_TRUNC(${truncPeriod}, "documentDate")
    ORDER BY period ASC
  `;

  const data = rows.map((r) => ({
    period: r.period,
    count: Number(r.count),
    totalAmount: r.total_amount,
    paidAmount: r.paid_amount,
  }));

  return sendSuccess(c, { groupBy: truncPeriod, data });
};

// ============================================================================
// SALES REPORT
// ============================================================================

/**
 * Generates a sales report aggregated by the requested dimension.
 * Excludes VOIDED documents unless includeVoided is true.
 * @route GET /api/documents/reports/sales
 * @access Private
 */
export const getSalesReport = async (c: Context<AppBindings>) => {
  const query = getValidatedQuery<SalesReportInput>(c);

  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
  const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;

  const baseWhere: Prisma.DocumentWhereInput = {
    deletedAt: null,
    documentType: { in: ["INVOICE", "CREDIT_NOTE"] },
    ...(query.includeVoided ? {} : { status: { not: "VOIDED" } }),
    ...(dateFrom || dateTo
      ? {
          documentDate: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
    ...(query.customerId && { customerId: toIntId(query.customerId, "customerId") }),
  };

  if (query.groupBy === "customer") {
    const rows = await prisma.document.groupBy({
      by: ["customerId", "customerName"],
      where: { ...baseWhere, customerId: { not: null } },
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true, taxAmount: true, taxableAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    });

    return sendSuccess(c, {
      groupBy: "customer",
      data: rows.map((r) => ({
        customerId: r.customerId,
        customerName: r.customerName,
        invoiceCount: r._count.id,
        totalAmount: r._sum.totalAmount ?? new Decimal(0),
        paidAmount: r._sum.paidAmount ?? new Decimal(0),
        taxAmount: r._sum.taxAmount ?? new Decimal(0),
        taxableAmount: r._sum.taxableAmount ?? new Decimal(0),
      })),
    });
  }

  if (query.groupBy === "product") {
    const rows = await prisma.documentLine.groupBy({
      by: ["productId", "nameSystem"],
      where: {
        deletedAt: null,
        productId: { not: null },
        document: baseWhere,
      },
      _sum: { quantity: true, lineTotal: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotal: "desc" } },
    });

    return sendSuccess(c, {
      groupBy: "product",
      data: rows.map((r) => ({
        productId: r.productId,
        productName: r.nameSystem,
        quantitySold: r._sum.quantity ?? new Decimal(0),
        totalAmount: r._sum.lineTotal ?? new Decimal(0),
        invoiceCount: r._count.id,
      })),
    });
  }

  // Time period grouping
  const truncPeriod = (
    ["day", "week", "month", "year"].includes(query.groupBy ?? "") ? query.groupBy : "month"
  ) as string;

  const rows = await prisma.$queryRaw<
    {
      period: Date;
      count: bigint;
      total_amount: Decimal;
      taxable_amount: Decimal;
      tax_amount: Decimal;
    }[]
  >`
    SELECT
      DATE_TRUNC(${truncPeriod}, "documentDate")     AS period,
      COUNT(*)::bigint                               AS count,
      COALESCE(SUM("totalAmount"), 0)                AS total_amount,
      COALESCE(SUM("taxableAmount"), 0)              AS taxable_amount,
      COALESCE(SUM("taxAmount"), 0)                  AS tax_amount
    FROM "Document"
    WHERE
      "deletedAt"    IS NULL
      AND "documentType" IN ('INVOICE', 'CREDIT_NOTE')
      ${!query.includeVoided ? Prisma.sql`AND "status" != 'VOIDED'` : Prisma.empty}
      ${dateFrom ? Prisma.sql`AND "documentDate" >= ${dateFrom}` : Prisma.empty}
      ${dateTo ? Prisma.sql`AND "documentDate" <= ${dateTo}` : Prisma.empty}
      ${query.customerId ? Prisma.sql`AND "customerId" = ${toIntId(query.customerId, "customerId")}` : Prisma.empty}
    GROUP BY DATE_TRUNC(${truncPeriod}, "documentDate")
    ORDER BY period ASC
  `;

  return sendSuccess(c, {
    groupBy: truncPeriod,
    data: rows.map((r) => ({
      period: r.period,
      count: Number(r.count),
      totalAmount: r.total_amount,
      taxableAmount: r.taxable_amount,
      taxAmount: r.tax_amount,
    })),
  });
};

// ============================================================================
// AGING REPORT
// ============================================================================

/**
 * Generates an accounts receivable aging report as of a reference date.
 * Documents are bucketed into configurable overdue intervals (default: 30/60/90/120 days).
 * @route GET /api/documents/reports/aging
 * @access Private
 */
export const getAgingReport = async (c: Context<AppBindings>) => {
  const query = getValidatedQuery<AgingReportInput>(c);

  const asOfDate = query.asOfDate ? new Date(query.asOfDate) : new Date();
  const intervals = query.intervals ?? [30, 60, 90, 120];

  const where: Prisma.DocumentWhereInput = {
    deletedAt: null,
    documentType: { in: ["INVOICE", "DEBIT_NOTE"] },
    status: { notIn: ["VOIDED", "PAID", "CLOSED"] },
    dueDate: { lte: asOfDate },
    ...(query.customerId && { customerId: toIntId(query.customerId, "customerId") }),
  };

  const overdueDocuments = await prisma.document.findMany({
    where,
    select: {
      id: true,
      documentNumber: true,
      customerId: true,
      customerName: true,
      dueDate: true,
      totalAmount: true,
      paidAmount: true,
    },
    orderBy: { dueDate: "asc" },
  });

  // Sort intervals ascending and add an "over max" bucket
  const sortedIntervals = [...intervals].sort((a, b) => a - b);

  // Build bucket labels: ["0-30", "31-60", "61-90", "91-120", "120+"]
  const buckets = sortedIntervals.map((days, i) => ({
    label: i === 0 ? `0-${days}` : `${sortedIntervals[i - 1] + 1}-${days}`,
    maxDays: days,
    minDays: i === 0 ? 0 : sortedIntervals[i - 1] + 1,
    amount: new Decimal(0),
    count: 0,
  }));
  buckets.push({
    label: `${sortedIntervals[sortedIntervals.length - 1]}+`,
    maxDays: Infinity,
    minDays: sortedIntervals[sortedIntervals.length - 1] + 1,
    amount: new Decimal(0),
    count: 0,
  });

  let totalOutstanding = new Decimal(0);

  // Per-customer aggregation
  const byCustomer = new Map<
    number,
    {
      customerId: number;
      customerName: string;
      totalOutstanding: Decimal;
      byBucket: Map<string, Decimal>;
      oldestDueDate: Date;
    }
  >();

  for (const doc of overdueDocuments) {
    const outstanding = doc.totalAmount.sub(doc.paidAmount);
    if (outstanding.lessThanOrEqualTo(0)) continue;

    const daysOverdue = Math.floor(
      (asOfDate.getTime() - doc.dueDate!.getTime()) / (1000 * 60 * 60 * 24),
    );

    // Assign to bucket
    const bucket =
      buckets.find((b) => daysOverdue >= b.minDays && daysOverdue <= b.maxDays) ??
      buckets[buckets.length - 1];

    bucket.amount = bucket.amount.add(outstanding);
    bucket.count += 1;
    totalOutstanding = totalOutstanding.add(outstanding);

    // Per-customer
    if (doc.customerId) {
      if (!byCustomer.has(doc.customerId)) {
        byCustomer.set(doc.customerId, {
          customerId: doc.customerId,
          customerName: doc.customerName,
          totalOutstanding: new Decimal(0),
          byBucket: new Map(),
          oldestDueDate: doc.dueDate!,
        });
      }

      const entry = byCustomer.get(doc.customerId)!;
      entry.totalOutstanding = entry.totalOutstanding.add(outstanding);

      const current = entry.byBucket.get(bucket.label) ?? new Decimal(0);
      entry.byBucket.set(bucket.label, current.add(outstanding));

      if (doc.dueDate! < entry.oldestDueDate) {
        entry.oldestDueDate = doc.dueDate!;
      }
    }
  }

  const reportBuckets = buckets.map((b) => ({
    label: b.label,
    amount: b.amount,
    count: b.count,
    percentage: totalOutstanding.greaterThan(0)
      ? b.amount.div(totalOutstanding).mul(100).toDecimalPlaces(1).toNumber()
      : 0,
  }));

  const reportByCustomer = Array.from(byCustomer.values()).map((entry) => ({
    customerId: entry.customerId,
    customerName: entry.customerName,
    totalOutstanding: entry.totalOutstanding,
    byBucket: Object.fromEntries(entry.byBucket),
    oldestDueDateDaysAgo: Math.floor(
      (asOfDate.getTime() - entry.oldestDueDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  }));

  return sendSuccess(c, {
    asOfDate,
    totalOutstanding,
    buckets: reportBuckets,
    byCustomer: reportByCustomer,
  });
};

// ============================================================================
// TOP PRODUCTS
// ============================================================================

/**
 * Returns the top N products by revenue in a given date range.
 * Considers only lines on non-voided INVOICE documents.
 * @route GET /api/documents/reports/top-products
 * @access Private
 */
export const getTopProducts = async (c: Context<AppBindings>) => {
  const query = getValidatedQuery<TopProductsReportInput>(c);

  const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
  const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
  const limit = query.limit ?? 10;

  const rows = await prisma.documentLine.groupBy({
    by: ["productId", "productVariantId", "nameSystem"],
    where: {
      deletedAt: null,
      productId: { not: null },
      document: {
        deletedAt: null,
        documentType: "INVOICE",
        status: { not: "VOIDED" },
        ...(dateFrom || dateTo
          ? {
              documentDate: {
                ...(dateFrom && { gte: dateFrom }),
                ...(dateTo && { lte: dateTo }),
              },
            }
          : {}),
      },
    },
    _sum: {
      quantity: true,
      lineTotal: true,
      lineTotalWithTax: true,
    },
    _count: { id: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: limit,
  });

  const data = rows.map((r, index) => ({
    rank: index + 1,
    productId: r.productId,
    productVariantId: r.productVariantId,
    productName: r.nameSystem,
    quantitySold: r._sum.quantity ?? new Decimal(0),
    revenueNet: r._sum.lineTotal ?? new Decimal(0),
    revenueGross: r._sum.lineTotalWithTax ?? new Decimal(0),
    invoiceLineCount: r._count.id,
  }));

  return sendSuccess(c, { dateFrom, dateTo, limit, data });
};

// ============================================================================
// DOCUMENT TIMELINE (per single document)
// ============================================================================

/**
 * Returns the status change history for a single document.
 * Data is read from the JSON statusHistory field.
 * @route GET /api/documents/:id/timeline
 * @access Private
 */
export const getDocumentTimeline = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<DocumentIdParam>(c);

  const document = await prisma.document.findUnique({
    where: withSoftDelete({ id: toIntId(id) }) as Prisma.DocumentWhereUniqueInput,
    select: {
      id: true,
      documentType: true,
      documentNumber: true,
      status: true,
      statusHistory: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!document) {
    throw new NotFoundError("Documento non trovato");
  }

  // statusHistory is stored as JSON array of DocumentStatusHistoryEntry
  const timeline = Array.isArray(document.statusHistory) ? document.statusHistory : [];

  return sendSuccess(c, {
    documentId: document.id,
    currentStatus: document.status,
    timeline,
  });
};

// ============================================================================
// OVERDUE INSTALLMENTS REPORT
// ============================================================================

/**
 * Returns all overdue installments with aging information.
 * Useful for collections/AR dashboards.
 * @route GET /api/documents/reports/overdue-installments
 * @access Private
 */
export const getOverdueInstallments = async (c: Context<AppBindings>) => {
  const today = new Date();

  const overdueInstallments = await prisma.documentPaymentInstallment.findMany({
    where: {
      status: { in: ["PENDING", "PARTIAL"] },
      dueDate: { lt: today },
      document: { deletedAt: null },
    },
    include: {
      document: {
        select: {
          id: true,
          documentNumber: true,
          documentType: true,
          customerId: true,
          customerName: true,
        },
      },
      paymentMethod: { select: { id: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const data = overdueInstallments.map((inst) => ({
    installmentId: inst.id,
    documentId: inst.document.id,
    documentNumber: inst.document.documentNumber,
    documentType: inst.document.documentType,
    customerId: inst.document.customerId,
    customerName: inst.document.customerName,
    installmentNumber: inst.installmentNumber,
    amount: inst.amount,
    paidAmount: inst.paidAmount,
    outstanding: inst.amount.sub(inst.paidAmount),
    dueDate: inst.dueDate,
    daysOverdue: Math.floor((today.getTime() - inst.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
    status: inst.status,
    paymentMethod: inst.paymentMethod ?? null,
  }));

  const totalOutstanding = data.reduce((sum, d) => sum.add(d.outstanding), new Decimal(0));

  return sendSuccess(c, {
    asOfDate: today,
    totalOutstanding,
    count: data.length,
    installments: data,
  });
};
