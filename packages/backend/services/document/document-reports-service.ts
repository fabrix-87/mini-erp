import { Prisma, type DocumentType } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
    normalizeToMidnight,
  PAYABLE_DOCUMENT_TYPES,
  SALES_DOCUMENT_TYPES,
  type AgingReportInput,
  type DocumentStatsInput,
  type OverdueInstallmentsQueryInput,
  type SalesReportInput,
  type TopProductsReportInput,
} from "@mini-erp/shared";
import { prisma } from "@/config/prisma-config";
import { dateRange, withSoftDelete, withTenantId } from "@/helpers/prisma-helper";

const zero = new Decimal(0);

/** Runs the time-series query shared by statistics and sales, with the given filters. */
async function timeSeries(args: {
  tenantId: string;
  trunc: "day" | "week" | "month" | "year";
  from?: Date;
  to?: Date;
  documentTypes: DocumentType[];
  customerId?: string | null;
  includeVoided?: boolean;
}) {
  const { tenantId, trunc, from, to, documentTypes, customerId, includeVoided } = args;
  const rows = await prisma.$queryRaw<
    {
      period: Date;
      count: bigint;
      total_amount: Decimal;
      paid_amount: Decimal;
      taxable_amount: Decimal;
      tax_amount: Decimal;
    }[]
  >`
    SELECT
      DATE_TRUNC(${Prisma.sql.raw(`'${trunc}'`)}, "document_date") AS period,
      COUNT(*)::bigint AS count,
      COALESCE(SUM("total_amount"), 0) AS total_amount,
      COALESCE(SUM("paid_amount"), 0) AS paid_amount,
      COALESCE(SUM("taxable_amount"), 0) AS taxable_amount,
      COALESCE(SUM("tax_amount"), 0) AS tax_amount
    FROM "documents"
    WHERE "tenant_id" = ${tenantId}
      AND "deleted_at" IS NULL
      AND "document_type" IN (${Prisma.join(documentTypes)})
      ${!includeVoided ? Prisma.sql`AND "status" <> 'VOIDED'` : Prisma.empty}
      ${from ? Prisma.sql`AND "document_date" >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND "document_date" <= ${to}` : Prisma.empty}
      ${customerId ? Prisma.sql`AND "customer_id" = ${customerId}` : Prisma.empty}
    GROUP BY 1
    ORDER BY 1 ASC
  `;
  return rows.map((row) => ({
    period: row.period,
    count: Number(row.count),
    totalAmount: row.total_amount,
    paidAmount: row.paid_amount,
    taxableAmount: row.taxable_amount,
    taxAmount: row.tax_amount,
  }));
}

/**
 * Aggregates document counts and amounts by type, status, customer or period.
 * Customer rows use the company name; period rows use the document date truncated in SQL
 * (day/week/month), with the tenant filter applied through Prisma.
 *
 * @param args - Validated input and tenant ID
 * @returns Rows in the requested grouping, ordered by count (type/status) or amount (customer)
 * or period (time)
 */
export async function getDocumentStatistics(args: { input: DocumentStatsInput; tenantId: string }) {
  const { input, tenantId } = args;
  const documentDate = dateRange(input.dateFrom, input.dateTo);
  const where = withSoftDelete(
    withTenantId(
      {
        ...(documentDate && { documentDate }),
        ...(input.documentType && { documentType: input.documentType }),
        ...(input.customerId && { customerId: input.customerId }),
      },
      tenantId,
    ),
  ) as Prisma.DocumentWhereInput;

  if (input.groupBy === "documentType" || input.groupBy === "status") {
    const by =
      input.groupBy === "documentType" ? (["documentType"] as const) : (["status"] as const);
    const rows = await prisma.document.groupBy({
      by,
      where,
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true },
      orderBy: { _count: { id: "desc" } },
    });
    return {
      groupBy: input.groupBy,
      data: rows.map((row) => ({
        ...(input.groupBy === "documentType"
          ? { documentType: row.documentType }
          : { status: row.status }),
        count: row._count.id,
        totalAmount: row._sum.totalAmount ?? zero,
        paidAmount: row._sum.paidAmount ?? zero,
      })),
    };
  }

  if (input.groupBy === "customer") {
    const rows = await prisma.document.groupBy({
      by: ["customerId", "customerName"],
      where: { ...where, customerId: { not: null } },
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    });
    return {
      groupBy: "customer",
      data: rows.map((row) => ({
        customerId: row.customerId,
        customerName: row.customerName,
        count: row._count.id,
        totalAmount: row._sum.totalAmount ?? zero,
        paidAmount: row._sum.paidAmount ?? zero,
      })),
    };
  }

  const trunc = input.groupBy === "day" || input.groupBy === "week" ? input.groupBy : "month";
  const rows = await timeSeries({
    tenantId,
    trunc,
    from: documentDate?.gte,
    to: documentDate?.lte,
    documentTypes: input.documentType ? [input.documentType] : Object.values(DocumentType),
    customerId: input.customerId,
    includeVoided: true,
  });
  return {
    groupBy: trunc,
    data: rows.map(({ period, count, totalAmount, paidAmount }) => ({
      period,
      count,
      totalAmount,
      paidAmount,
    })),
  };
}

/**
 * Sales report on invoices and credit notes, grouped by customer, product or period.
 * Credit notes carry negative line amounts, so totals are already net of credits.
 *
 * @param args - Validated input and tenant ID
 * @returns Rows in the requested grouping, ordered by amount (customer/product) or period (time)
 */
export async function getSalesReport(args: { input: SalesReportInput; tenantId: string }) {
  const { input, tenantId } = args;
  const documentDate = dateRange(input.dateFrom, input.dateTo);
  const where = withSoftDelete(
    withTenantId(
      {
        documentType: { in: SALES_DOCUMENT_TYPES },
        ...(input.includeVoided ? {} : { status: { not: "VOIDED" as const } }),
        ...(documentDate && { documentDate }),
        ...(input.customerId && { customerId: input.customerId }),
      },
      tenantId,
    ),
  ) as Prisma.DocumentWhereInput;

  if (input.groupBy === "customer") {
    const rows = await prisma.document.groupBy({
      by: ["customerId", "customerName"],
      where: { ...where, customerId: { not: null } },
      _count: { id: true },
      _sum: { totalAmount: true, paidAmount: true, taxAmount: true, taxableAmount: true },
      orderBy: { _sum: { totalAmount: "desc" } },
    });
    return {
      groupBy: "customer",
      data: rows.map((row) => ({
        customerId: row.customerId,
        customerName: row.customerName,
        documentCount: row._count.id,
        totalAmount: row._sum.totalAmount ?? zero,
        paidAmount: row._sum.paidAmount ?? zero,
        taxAmount: row._sum.taxAmount ?? zero,
        taxableAmount: row._sum.taxableAmount ?? zero,
      })),
    };
  }

  if (input.groupBy === "product") {
    const rows = await prisma.documentLine.groupBy({
      by: ["productVariantId", "nameSystem"],
      where: {
        tenantId,
        deletedAt: null,
        lineType: "PRODUCT",
        productVariantId: { not: null },
        document: where,
      },
      _sum: { quantity: true, lineTotal: true, lineTotalWithTax: true },
      _count: { id: true },
      orderBy: { _sum: { lineTotal: "desc" } },
    });
    return {
      groupBy: "product",
      data: rows.map((row) => ({
        productVariantId: row.productVariantId,
        productName: row.nameSystem,
        quantitySold: row._sum.quantity ?? zero,
        revenueNet: row._sum.lineTotal ?? zero,
        revenueGross: row._sum.lineTotalWithTax ?? zero,
        lineCount: row._count.id,
      })),
    };
  }

  const trunc = (
    ["day", "week", "month", "year"].includes(input.groupBy) ? input.groupBy : "month"
  ) as "day" | "week" | "month" | "year";
  const rows = await timeSeries({
    tenantId,
    trunc,
    from: documentDate?.gte,
    to: documentDate?.lte,
    documentTypes: SALES_DOCUMENT_TYPES,
    customerId: input.customerId,
    includeVoided: input.includeVoided,
  });
  return {
    groupBy: trunc,
    data: rows.map(({ period, count, totalAmount, taxableAmount, taxAmount }) => ({
      period,
      count,
      totalAmount,
      taxableAmount,
      taxAmount,
    })),
  };
}

/**
 * Receivables aging on overdue sales invoices, with configurable buckets.
 * Outstanding is `netPayableAmount - paidAmount`; credit notes are not considered.
 *
 * @param args - Validated input and tenant ID
 * @returns Bucket totals, per-customer breakdown (paginated) and the overall outstanding
 */
export async function getAgingReport(args: { input: AgingReportInput; tenantId: string }) {
  const { input, tenantId } = args;
  const asOf = normalizeToMidnight(new Date(input.asOfDate));
  const intervals = [...input.intervals].sort((a, b) => a - b);

  const documents = await prisma.document.findMany({
    where: withSoftDelete(
      withTenantId(
        {
          documentType: "INVOICE",
          status: { in: ["UNPAID", "PARTIALLY_PAID", "OVERDUE"] as const },
          dueDate: { lte: asOf },
          ...(input.customerId && { customerId: input.customerId }),
        },
        tenantId,
      ),
    ) as Prisma.DocumentWhereInput,
    select: {
      id: true,
      customerId: true,
      customerName: true,
      dueDate: true,
      netPayableAmount: true,
      paidAmount: true,
    },
    orderBy: { dueDate: "asc" },
    skip: (input.page - 1) * input.limit,
    take: input.limit,
  });

  const buckets = intervals.map((days, index) => ({
    label: index === 0 ? `0-${days}` : `${intervals[index - 1] + 1}-${days}`,
    minDays: index === 0 ? 0 : intervals[index - 1] + 1,
    maxDays: days,
    amount: new Decimal(0),
    count: 0,
  }));
  buckets.push({
    label: `${intervals[intervals.length - 1]}+`,
    minDays: intervals[intervals.length - 1] + 1,
    maxDays: Number.MAX_SAFE_INTEGER,
    amount: new Decimal(0),
    count: 0,
  });

  const byCustomer = new Map<
    string,
    {
      customerId: string;
      customerName: string | null;
      totalOutstanding: Decimal;
      oldestDueDate: Date;
    }
  >();
  let totalOutstanding = new Decimal(0);

  for (const document of documents) {
    const outstanding = document.netPayableAmount.minus(document.paidAmount);
    if (!document.dueDate || outstanding.lessThanOrEqualTo(0)) continue;

    const daysOverdue = Math.floor(
      (asOf.getTime() - normalizeToMidnight(document.dueDate).getTime()) / 86_400_000,
    );
    const bucket =
      buckets.find((b) => daysOverdue >= b.minDays && daysOverdue <= b.maxDays) ??
      buckets[buckets.length - 1];
    bucket.amount = bucket.amount.plus(outstanding);
    bucket.count += 1;
    totalOutstanding = totalOutstanding.plus(outstanding);

    if (document.customerId) {
      const entry = byCustomer.get(document.customerId) ?? {
        customerId: document.customerId,
        customerName: document.customerName,
        totalOutstanding: new Decimal(0),
        oldestDueDate: document.dueDate,
      };
      entry.totalOutstanding = entry.totalOutstanding.plus(outstanding);
      if (document.dueDate < entry.oldestDueDate) entry.oldestDueDate = document.dueDate;
      byCustomer.set(document.customerId, entry);
    }
  }

  return {
    asOfDate: asOf,
    totalOutstanding,
    buckets: buckets.map((bucket) => ({
      label: bucket.label,
      amount: bucket.amount,
      count: bucket.count,
      percentage: totalOutstanding.greaterThan(0)
        ? bucket.amount.div(totalOutstanding).times(100).toDecimalPlaces(1).toNumber()
        : 0,
    })),
    byCustomer: Array.from(byCustomer.values()).map((entry) => ({
      customerId: entry.customerId,
      customerName: entry.customerName,
      totalOutstanding: entry.totalOutstanding,
      oldestDueDateDaysAgo: Math.floor(
        (asOf.getTime() - normalizeToMidnight(entry.oldestDueDate).getTime()) / 86_400_000,
      ),
    })),
  };
}

/**
 * Top products by net revenue on sales invoices (credit notes carry negative amounts).
 *
 * @param args - Validated input and tenant ID
 * @returns Ranked products by net revenue, limited to `limit`
 */
export async function getTopProducts(args: { input: TopProductsReportInput; tenantId: string }) {
  const { input, tenantId } = args;
  const documentDate = dateRange(input.dateFrom, input.dateTo);
  const rows = await prisma.documentLine.groupBy({
    by: ["productVariantId", "nameSystem"],
    where: {
      tenantId,
      deletedAt: null,
      lineType: "PRODUCT",
      productVariantId: { not: null },
      document: withSoftDelete(
        withTenantId(
          {
            documentType: "INVOICE",
            status: { not: "VOIDED" as const },
            ...(documentDate && { documentDate }),
          },
          tenantId,
        ),
      ) as Prisma.DocumentWhereInput,
    },
    _sum: { quantity: true, lineTotal: true, lineTotalWithTax: true },
    _count: { id: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: input.limit,
  });
  return {
    dateFrom: input.dateFrom ?? null,
    dateTo: input.dateTo ?? null,
    limit: input.limit,
    data: rows.map((row, index) => ({
      rank: index + 1,
      productVariantId: row.productVariantId,
      productName: row.nameSystem,
      quantitySold: row._sum.quantity ?? zero,
      revenueNet: row._sum.lineTotal ?? zero,
      revenueGross: row._sum.lineTotalWithTax ?? zero,
      lineCount: row._count.id,
    })),
  };
}

/**
 * Overdue payment installments of payable documents (INVOICE, DEBIT_NOTE), with the document
 * not voided. Includes installments still PENDING or PARTIAL past their due date, even when the
 * daily job has not run yet.
 *
 * @param args - Validated input and tenant ID
 * @returns Paginated installments with aging and the overall outstanding
 */
export async function getOverdueInstallments(args: {
  input: OverdueInstallmentsQueryInput;
  tenantId: string;
}) {
  const { input, tenantId } = args;
  const today = normalizeToMidnight(new Date());
  const where = {
    tenantId,
    status: { in: ["PENDING", "PARTIAL", "OVERDUE"] as const },
    dueDate: { lt: today },
    document: withSoftDelete(
      withTenantId(
        {
          documentType: { in: PAYABLE_DOCUMENT_TYPES },
          status: { not: "VOIDED" as const },
          ...(input.customerId && { customerId: input.customerId }),
          ...(input.documentType && { documentType: input.documentType }),
        },
        tenantId,
      ),
    ) as Prisma.DocumentWhereInput,
  } satisfies Prisma.DocumentPaymentInstallmentWhereInput;

  const [installments, total] = await Promise.all([
    prisma.documentPaymentInstallment.findMany({
      where,
      select: {
        id: true,
        installmentNumber: true,
        amount: true,
        paidAmount: true,
        dueDate: true,
        status: true,
        paymentMethod: { select: { code: true } },
        document: {
          select: {
            id: true,
            documentNumber: true,
            documentType: true,
            customerId: true,
            customerName: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
    prisma.documentPaymentInstallment.count({ where }),
  ]);

  const data = installments.map((installment) => ({
    installmentId: installment.id,
    documentId: installment.document.id,
    documentNumber: installment.document.documentNumber,
    documentType: installment.document.documentType,
    customerId: installment.document.customerId,
    customerName: installment.document.customerName,
    installmentNumber: installment.installmentNumber,
    amount: installment.amount,
    paidAmount: installment.paidAmount,
    outstanding: installment.amount.minus(installment.paidAmount),
    dueDate: installment.dueDate,
    daysOverdue: Math.floor(
      (today.getTime() - normalizeToMidnight(installment.dueDate).getTime()) / 86_400_000,
    ),
    status: installment.status,
    paymentMethodCode: installment.paymentMethod?.code ?? null,
  }));
  const totalOutstanding = data.reduce(
    (sum, item) => sum.plus(item.outstanding.toString()),
    new Decimal(0),
  );

  return {
    asOfDate: today,
    totalOutstanding,
    count: total,
    installments: data,
  };
}
