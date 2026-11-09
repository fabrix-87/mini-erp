import { Decimal } from "@prisma/client/runtime/client";
import {
  PAYABLE_DOCUMENT_TYPES,
  SALES_DOCUMENT_TYPES,
  type AgingReportInput,
  type DocumentStatsInput,
  type OverdueInstallmentsQueryInput,
  type SalesReportInput,
  type TopProductsReportInput,
} from "@mini-erp/shared";

import {
  Prisma,
  type DocumentStatus,
  type DocumentType,
  type InstallmentStatus,
} from "../../generated/prisma/client";

import type {
  AgingReport,
  DocumentStatisticsReport,
  OverdueInstallmentsReport,
  ReportPeriod,
  SalesReport,
  TopProductsReport,
} from "@mini-erp/shared";

import { prisma } from "../../config/prisma-config";
import { BadRequestError } from "../../utils/app-error-utils";

const REPORT_TIME_ZONE = "Europe/Rome";

interface DocumentScope {
  tenantId: string;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  customerId?: string | undefined;
  documentTypes?: readonly DocumentType[] | undefined;
  sales?: boolean | undefined;
  includeVoided?: boolean | undefined;
}

interface AmountRow {
  count: bigint;
  totalAmount: Decimal;
  paidAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
}

interface CustomerRow extends AmountRow {
  customerId: string;
  customerName: string | null;
}

interface ProductRow {
  productVariantId: string;
  productName: string;
  quantitySold: Decimal;
  revenueNet: Decimal;
  revenueGross: Decimal;
  lineCount: bigint;
}

interface BucketRow {
  bucketIndex: number;
  amount: Decimal;
  count: bigint;
}

interface AgingCustomerRow {
  customerId: string;
  customerName: string | null;
  totalOutstanding: Decimal;
  oldestDueDateDaysAgo: number;
}

interface OverdueRow {
  installmentId: string;
  documentId: string;
  documentNumber: string | null;
  documentType: DocumentType;
  customerId: string | null;
  customerName: string | null;
  installmentNumber: number;
  amount: Decimal;
  paidAmount: Decimal;
  outstanding: Decimal;
  dueDate: Date;
  daysOverdue: number;
  status: InstallmentStatus;
  paymentMethodCode: string | null;
}

const romeDateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: REPORT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns a civil date in the reporting time zone. */
function toReportDate(value: string | Date): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError("Data del report non valida");
  }

  const parts = romeDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new BadRequestError("Impossibile determinare la data del report");
  }

  return `${year}-${month}-${day}`;
}

/**
 * Converts a UTC timestamp without time zone to Rome local wall-clock time.
 * Prisma DateTime uses PostgreSQL timestamp(3) in the current schema.
 */
function localDocumentDate(): Prisma.Sql {
  return Prisma.sql`
    (
      d."document_date"
      AT TIME ZONE 'UTC'
      AT TIME ZONE ${REPORT_TIME_ZONE}
    )
  `;
}

/** Builds a tenant-scoped, soft-delete-safe document reporting CTE. */
function documentScope(args: DocumentScope): Prisma.Sql {
  const from = args.dateFrom ? toReportDate(args.dateFrom) : undefined;
  const to = args.dateTo ? toReportDate(args.dateTo) : undefined;

  if (from && to && from > to) {
    throw new BadRequestError("La data iniziale non può essere successiva alla data finale");
  }

  if (args.documentTypes?.length === 0) {
    throw new BadRequestError("Nessun tipo documento selezionato");
  }

  const sign = args.sales
    ? Prisma.sql`
        CASE
          WHEN d."document_type" = 'CREDIT_NOTE' THEN -1
          ELSE 1
        END
      `
    : Prisma.sql`1`;

  return Prisma.sql`
    WITH scoped_documents AS (
      SELECT
        d.*,
        ${sign} AS report_sign,
        (
          SELECT p."name"
          FROM "document_parties" p
          WHERE p."tenant_id" = d."tenant_id"
            AND p."document_id" = d."id"
            AND p."role" = 'COUNTERPARTY'
        ) AS customer_name
      FROM "documents" d
      WHERE d."tenant_id" = ${args.tenantId}
        AND d."deleted_at" IS NULL
        AND d."currency_code" = d."base_currency_code"

        ${
          args.documentTypes
            ? Prisma.sql`
                AND d."document_type"::text IN (
                  ${Prisma.join([...args.documentTypes])}
                )
              `
            : Prisma.empty
        }

        ${args.customerId ? Prisma.sql`AND d."customer_id" = ${args.customerId}` : Prisma.empty}

        ${
          args.sales
            ? Prisma.sql`
                AND d."direction" = 'OUTBOUND'
                AND d."status" NOT IN ('DRAFT', 'PENDING_APPROVAL')
              `
            : Prisma.empty
        }

        ${args.includeVoided === false ? Prisma.sql`AND d."status" <> 'VOIDED'` : Prisma.empty}

        ${
          from
            ? Prisma.sql`
                AND d."document_date" >= (
                  ${from}::date::timestamp
                  AT TIME ZONE ${REPORT_TIME_ZONE}
                  AT TIME ZONE 'UTC'
                )
              `
            : Prisma.empty
        }

        ${
          to
            ? Prisma.sql`
                AND d."document_date" < (
                  (${to}::date + 1)::timestamp
                  AT TIME ZONE ${REPORT_TIME_ZONE}
                  AT TIME ZONE 'UTC'
                )
              `
            : Prisma.empty
        }
    )
  `;
}

/** Returns the shared signed document aggregation expressions. */
function documentAmounts(): Prisma.Sql {
  return Prisma.sql`
    COUNT(*)::bigint AS "count",
    COALESCE(
      SUM(d."total_amount" * d.report_sign), 0
    ) AS "totalAmount",
    COALESCE(
      SUM(d."paid_amount" * d.report_sign), 0
    ) AS "paidAmount",
    COALESCE(
      SUM(d."taxable_amount" * d.report_sign), 0
    ) AS "taxableAmount",
    COALESCE(
      SUM(d."tax_amount" * d.report_sign), 0
    ) AS "taxAmount"
  `;
}

/** Aggregates documents by customer using the latest available party snapshot. */
async function customerTotals(scope: Prisma.Sql) {
  const rows = await prisma.$queryRaw<CustomerRow[]>(Prisma.sql`
    ${scope}
    SELECT
      d."customer_id" AS "customerId",
      (
        ARRAY_AGG(
          d.customer_name
          ORDER BY d."document_date" DESC, d."id" DESC
        ) FILTER (WHERE d.customer_name IS NOT NULL)
      )[1] AS "customerName",
      ${documentAmounts()}
    FROM scoped_documents d
    WHERE d."customer_id" IS NOT NULL
    GROUP BY d."customer_id"
    ORDER BY "totalAmount" DESC, "customerId" ASC
  `);

  return rows.map((row) => ({
    ...row,
    count: Number(row.count),
  }));
}

/** Aggregates signed document totals by a Rome-local calendar period. */
async function timeSeries(scope: Prisma.Sql, period: ReportPeriod) {
  const rows = await prisma.$queryRaw<Array<AmountRow & { period: Date }>>(Prisma.sql`
    ${scope}
    SELECT
      (
        DATE_TRUNC(${period}::text, ${localDocumentDate()})
        AT TIME ZONE ${REPORT_TIME_ZONE}
        AT TIME ZONE 'UTC'
      ) AS period,
      ${documentAmounts()}
    FROM scoped_documents d
    GROUP BY 1
    ORDER BY 1 ASC
  `);

  return rows.map((row) => ({
    ...row,
    count: Number(row.count),
  }));
}

/** Aggregates product variants without splitting results by historical names. */
async function productTotals(scope: Prisma.Sql, limit?: number) {
  const rows = await prisma.$queryRaw<ProductRow[]>(Prisma.sql`
    ${scope}
    SELECT
      l."product_variant_id" AS "productVariantId",
      (
        ARRAY_AGG(
          l."name_system"
          ORDER BY
            d."document_date" DESC,
            d."id" DESC,
            l."line_number" DESC,
            l."id" DESC
        )
      )[1] AS "productName",
      COALESCE(
        SUM(l."quantity" * l."uom_factor" * d.report_sign), 0
      ) AS "quantitySold",
      COALESCE(
        SUM(l."line_total" * d.report_sign), 0
      ) AS "revenueNet",
      COALESCE(
        SUM(l."line_total_with_tax" * d.report_sign), 0
      ) AS "revenueGross",
      COUNT(*)::bigint AS "lineCount"
    FROM "document_lines" l
    INNER JOIN scoped_documents d
      ON d."tenant_id" = l."tenant_id"
      AND d."id" = l."document_id"
    WHERE l."lineType" = 'PRODUCT'
      AND l."product_variant_id" IS NOT NULL
      AND l."is_component" = false
    GROUP BY l."product_variant_id"
    ORDER BY "revenueNet" DESC, "productVariantId" ASC
    ${limit !== undefined ? Prisma.sql`LIMIT ${limit}` : Prisma.empty}
  `);

  return rows.map((row) => ({
    ...row,
    lineCount: Number(row.lineCount),
  }));
}

/**
 * Aggregates base-currency documents by type, status, customer or calendar period.
 * Generic statistics preserve document signs and include draft and voided documents.
 *
 * @param args - Validated report input and authenticated tenant ID.
 * @returns Document statistics for the requested grouping.
 */
export async function getDocumentStatistics(args: {
  input: DocumentStatsInput;
  tenantId: string;
}): Promise<DocumentStatisticsReport<Decimal, Date>> {
  const { input, tenantId } = args;

  const scope = documentScope({
    tenantId,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    customerId: input.customerId,
    documentTypes: input.documentType ? [input.documentType] : undefined,
  });

  if (input.groupBy === "documentType") {
    const rows = await prisma.$queryRaw<
      Array<AmountRow & { documentType: DocumentType }>
    >(Prisma.sql`
      ${scope}
      SELECT
        d."document_type" AS "documentType",
        ${documentAmounts()}
      FROM scoped_documents d
      GROUP BY d."document_type"
      ORDER BY "count" DESC, "documentType" ASC
    `);

    return {
      groupBy: "documentType" as const,
      data: rows.map((row) => ({
        documentType: row.documentType,
        count: Number(row.count),
        totalAmount: row.totalAmount,
        paidAmount: row.paidAmount,
      })),
    };
  }

  if (input.groupBy === "status") {
    const rows = await prisma.$queryRaw<Array<AmountRow & { status: DocumentStatus }>>(Prisma.sql`
      ${scope}
      SELECT
        d."status",
        ${documentAmounts()}
      FROM scoped_documents d
      GROUP BY d."status"
      ORDER BY "count" DESC, d."status" ASC
    `);

    return {
      groupBy: "status" as const,
      data: rows.map((row) => ({
        status: row.status,
        count: Number(row.count),
        totalAmount: row.totalAmount,
        paidAmount: row.paidAmount,
      })),
    };
  }

  if (input.groupBy === "customer") {
    const rows = await customerTotals(scope);

    return {
      groupBy: "customer" as const,
      data: rows.map((row) => ({
        customerId: row.customerId,
        customerName: row.customerName,
        count: row.count,
        totalAmount: row.totalAmount,
        paidAmount: row.paidAmount,
      })),
    };
  }

  const rows = await timeSeries(scope, input.groupBy);

  return {
    groupBy: input.groupBy,
    data: rows.map((row) => ({
      period: row.period,
      count: row.count,
      totalAmount: row.totalAmount,
      paidAmount: row.paidAmount,
    })),
  };
}

/**
 * Reports finalized outbound sales in base currency.
 * Positive stored credit-note amounts are reversed at query time.
 *
 * @param args - Validated report input and authenticated tenant ID.
 * @returns Sales grouped by customer, variant or calendar period.
 */
export async function getSalesReport(args: {
  input: SalesReportInput;
  tenantId: string;
}): Promise<SalesReport<Decimal, Date>> {
  const { input, tenantId } = args;

  const scope = documentScope({
    tenantId,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    customerId: input.customerId,
    documentTypes: SALES_DOCUMENT_TYPES,
    sales: true,
    includeVoided: input.includeVoided ?? false,
  });

  if (input.groupBy === "customer") {
    const rows = await customerTotals(scope);

    return {
      groupBy: "customer" as const,
      data: rows.map(({ count, ...row }) => ({
        ...row,
        documentCount: count,
      })),
    };
  }

  if (input.groupBy === "product") {
    return {
      groupBy: "product" as const,
      data: await productTotals(scope),
    };
  }

  const rows = await timeSeries(scope, input.groupBy);

  return {
    groupBy: input.groupBy,
    data: rows.map((row) => ({
      period: row.period,
      count: row.count,
      totalAmount: row.totalAmount,
      taxableAmount: row.taxableAmount,
      taxAmount: row.taxAmount,
    })),
  };
}

/** Builds the shared overdue receivables CTE using current installment balances. */
function overdueScope(args: {
  tenantId: string;
  asOfDate: string;
  customerId?: string | undefined;
  documentType?: DocumentType | undefined;
}): Prisma.Sql {
  const scope = documentScope({
    tenantId: args.tenantId,
    customerId: args.customerId,
    documentTypes: PAYABLE_DOCUMENT_TYPES,
    sales: true,
    includeVoided: false,
  });

  return Prisma.sql`
    ${scope},
    overdue_installments AS (
      SELECT
        i.*,
        d."document_number",
        d."document_type",
        d."customer_id",
        d.customer_name,
        d."document_date",
        i."amount" - i."paid_amount" AS outstanding,
        (
          ${args.asOfDate}::date -
          (
            i."due_date"
            AT TIME ZONE 'UTC'
            AT TIME ZONE ${REPORT_TIME_ZONE}
          )::date
        )::integer AS days_overdue
      FROM "document_payment_installments" i
      INNER JOIN scoped_documents d
        ON d."tenant_id" = i."tenant_id"
        AND d."id" = i."document_id"
      WHERE i."tenant_id" = ${args.tenantId}
        AND i."status" IN ('PENDING', 'PARTIAL', 'OVERDUE')
        AND i."amount" > i."paid_amount"
        AND i."due_date" < (
          ${args.asOfDate}::date::timestamp
          AT TIME ZONE ${REPORT_TIME_ZONE}
          AT TIME ZONE 'UTC'
        )
        ${
          args.documentType
            ? Prisma.sql`
                AND d."document_type"::text = ${args.documentType}
              `
            : Prisma.empty
        }
    )
  `;
}

/**
 * Reports overdue installment balances with global buckets and paginated customers.
 * The reference date controls aging; balances reflect current recorded payments.
 *
 * @param args - Validated report input and authenticated tenant ID.
 * @returns Global outstanding, installment buckets and one page of customers.
 */
export async function getAgingReport(args: {
  input: AgingReportInput;
  tenantId: string;
}): Promise<AgingReport<Decimal>> {
  const { input, tenantId } = args;

  const asOfDate = toReportDate(input.asOfDate ?? new Date());
  const intervals = [...new Set(input.intervals)].sort((a, b) => a - b);

  const lastInterval = intervals.at(-1);

  if (lastInterval === undefined) {
    throw new BadRequestError("Specificare almeno un intervallo di aging");
  }

  const scope = overdueScope({
    tenantId,
    asOfDate,
    customerId: input.customerId,
  });

  const bucketExpression = Prisma.sql`
    CASE
      ${Prisma.join(
        intervals.map(
          (days, index) => Prisma.sql`WHEN days_overdue <= ${days} THEN ${index}::integer`,
        ),
        " ",
      )}
      ELSE ${intervals.length}::integer
    END
  `;

  const skip = (input.page - 1) * input.limit;

  const [bucketRows, customerRows, customerCounts] = await prisma.$transaction(
    [
      prisma.$queryRaw<BucketRow[]>(Prisma.sql`
          ${scope}
          SELECT
            ${bucketExpression} AS "bucketIndex",
            COALESCE(SUM(outstanding), 0) AS amount,
            COUNT(*)::bigint AS count
          FROM overdue_installments
          GROUP BY 1
          ORDER BY 1
        `),

      prisma.$queryRaw<AgingCustomerRow[]>(Prisma.sql`
          ${scope}
          SELECT
            "customer_id" AS "customerId",
            (
              ARRAY_AGG(
                customer_name
                ORDER BY "document_date" DESC, "document_id" DESC
              ) FILTER (WHERE customer_name IS NOT NULL)
            )[1] AS "customerName",
            SUM(outstanding) AS "totalOutstanding",
            MAX(days_overdue)::integer AS "oldestDueDateDaysAgo"
          FROM overdue_installments
          WHERE "customer_id" IS NOT NULL
          GROUP BY "customer_id"
          ORDER BY "totalOutstanding" DESC, "customerId" ASC
          LIMIT ${input.limit}
          OFFSET ${skip}
        `),

      prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
          ${scope}
          SELECT COUNT(DISTINCT "customer_id")::bigint AS count
          FROM overdue_installments
        `),
    ],
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  );

  const totalOutstanding = bucketRows.reduce((sum, row) => sum.plus(row.amount), new Decimal(0));

  const installmentCount = bucketRows.reduce((sum, row) => sum + Number(row.count), 0);

  const buckets = [...intervals, undefined].map((maxDays, index) => {
    const previousMax = index === 0 ? 0 : intervals[index - 1]!;
    const minDays = previousMax + 1;

    const row = bucketRows.find((item) => item.bucketIndex === index);
    const amount = row?.amount ?? new Decimal(0);

    return {
      label: maxDays === undefined ? `${minDays}+` : `${minDays}-${maxDays}`,
      amount,
      count: Number(row?.count ?? 0n),
      percentage: totalOutstanding.greaterThan(0)
        ? amount.div(totalOutstanding).times(100).toDecimalPlaces(1).toNumber()
        : 0,
    };
  });

  const customerCount = Number(customerCounts[0]?.count ?? 0n);

  return {
    asOfDate,
    totalOutstanding,
    installmentCount,
    buckets,
    byCustomer: customerRows,
    pagination: {
      page: input.page,
      limit: input.limit,
      total: customerCount,
      totalPages: Math.ceil(customerCount / input.limit),
    },
  };
}

/**
 * Ranks outbound product variants by net base-currency revenue.
 * Credit notes reverse revenue and base-unit quantities.
 *
 * @param args - Validated report input and authenticated tenant ID.
 * @returns Ranked variants limited to the requested result count.
 */
export async function getTopProducts(args: {
  input: TopProductsReportInput;
  tenantId: string;
}): Promise<TopProductsReport<Decimal>> {
  const { input, tenantId } = args;

  const scope = documentScope({
    tenantId,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
    documentTypes: SALES_DOCUMENT_TYPES,
    sales: true,
    includeVoided: false,
  });

  const rows = await productTotals(scope, input.limit);

  return {
    dateFrom: input.dateFrom ?? undefined,
    dateTo: input.dateTo ?? undefined,
    limit: input.limit,
    data: rows.map((row, index) => ({
      rank: index + 1,
      ...row,
    })),
  };
}

/**
 * Lists overdue outbound receivable installments with global totals.
 * Page rows, count and total outstanding share a repeatable-read snapshot.
 *
 * @param args - Validated query input and authenticated tenant ID.
 * @returns One installment page and totals across all matching installments.
 */
export async function getOverdueInstallments(args: {
  input: OverdueInstallmentsQueryInput;
  tenantId: string;
}): Promise<OverdueInstallmentsReport<Decimal, Date>> {
  const { input, tenantId } = args;

  const allowedTypes: readonly DocumentType[] = PAYABLE_DOCUMENT_TYPES.filter(
    (type) => type !== "SUPPLIER_INVOICE",
  );

  if (input.documentType !== undefined && !allowedTypes.includes(input.documentType)) {
    throw new BadRequestError("Il tipo documento non è ammesso nello scadenzario clienti");
  }

  const asOfDate = toReportDate(new Date());

  const scope = overdueScope({
    tenantId,
    asOfDate,
    customerId: input.customerId,
    documentType: input.documentType,
  });

  const skip = (input.page - 1) * input.limit;

  const [installments, totals] = await prisma.$transaction(
    [
      prisma.$queryRaw<OverdueRow[]>(Prisma.sql`
        ${scope}
        SELECT
          i."id" AS "installmentId",
          i."document_id" AS "documentId",
          i."document_number" AS "documentNumber",
          i."document_type" AS "documentType",
          i."customer_id" AS "customerId",
          i.customer_name AS "customerName",
          i."installment_number" AS "installmentNumber",
          i."amount",
          i."paid_amount" AS "paidAmount",
          i.outstanding,
          i."due_date" AS "dueDate",
          i.days_overdue AS "daysOverdue",
          i."status",
          pm."code" AS "paymentMethodCode"
        FROM overdue_installments i
        LEFT JOIN "payment_methods" pm
          ON pm."id" = i."payment_method_id"
        ORDER BY i."due_date" ASC, i."id" ASC
        LIMIT ${input.limit}
        OFFSET ${skip}
      `),

      prisma.$queryRaw<Array<{ count: bigint; totalOutstanding: Decimal }>>(Prisma.sql`
        ${scope}
        SELECT
          COUNT(*)::bigint AS count,
          COALESCE(SUM(outstanding), 0) AS "totalOutstanding"
        FROM overdue_installments
      `),
    ],
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    },
  );

  const count = Number(totals[0]?.count ?? 0n);

  return {
    asOfDate,
    totalOutstanding: totals[0]?.totalOutstanding ?? new Decimal(0),
    count,
    installments,
    pagination: {
      page: input.page,
      limit: input.limit,
      total: count,
      totalPages: Math.ceil(count / input.limit),
    },
  };
}
