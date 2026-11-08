import type { Document, Prisma } from "@/generated/prisma/client";
import {
  DOCUMENT_TYPE_CONFIG,
  Decimal,
  getEInvoicePartyIssues,
  isInboundDocumentType,
  type DocumentType,
} from "@mini-erp/shared";
import { withTenantId } from "@/helpers/prisma-helper";
import { ValidationError } from "@/utils/app-error-utils";
import type { DocumentFormalizationSnapshots } from "@/types";

/** Line types that carry a price and contribute to totals. */
const PRICED_LINE_TYPES: readonly string[] = ["PRODUCT", "SERVICE", "DISCOUNT"];

/** Time zone used to derive the fiscal year from the document date. */
// TODO: replace with the tenant time zone setting.
const DOCUMENT_TIME_ZONE = "Europe/Rome";

/**
 * Returns the calendar year of a date in the document time zone.
 *
 * @param date - Date to inspect
 * @returns Four-digit year
 */
function yearInDocumentTimeZone(date: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-CA", { timeZone: DOCUMENT_TIME_ZONE, year: "numeric" }).format(
      date,
    ),
  );
}

/**
 * Verifies that a draft document has everything required to be formalized.
 * All problems are collected and reported together.
 *
 * @param document - Document about to be formalized
 * @param tx - Prisma transaction client
 * @throws ValidationError when the document is incomplete
 */
export async function assertDocumentReadyForFormalization(
  document: Document,
  tx: Prisma.TransactionClient,
): Promise<void> {
  const config = DOCUMENT_TYPE_CONFIG[document.documentType];
  const issues: string[] = [];

  if (config.requiresPaymentMethod && !document.paymentMethodId) {
    issues.push("payment method is required");
  }

  const lines = await tx.documentLine.findMany({
    where: withTenantId({ documentId: document.id }, document.tenantId),
    select: { lineType: true, warehouseId: true },
  });

  const installments = await tx.documentPaymentInstallment.findMany({
    where: withTenantId({ documentId: document.id }, document.tenantId),
    select: { amount: true },
  });

  if (!lines.some((line) => PRICED_LINE_TYPES.includes(line.lineType))) {
    issues.push("at least one priced line is required");
  }

  if (config.requiresCustomer && !document.customerId) issues.push("customer is required");
  if (config.requiresSupplier && !document.supplierId) issues.push("supplier is required");

  if (config.requiresWarehouse && !document.warehouseId) {
    const productLines = lines.filter((line) => line.lineType === "PRODUCT");
    if (productLines.length === 0 || productLines.some((line) => !line.warehouseId)) {
      issues.push("warehouse is required");
    }
  }

  if (isInboundDocumentType(document.documentType) && !document.counterpartyDocumentNumber) {
    issues.push("counterparty document number is required");
  }

  if (document.documentYear !== yearInDocumentTimeZone(document.documentDate)) {
    issues.push("document year does not match the document date");
  }

  if (installments.length > 0) {
    const installmentsTotal = installments.reduce(
      (sum, installment) => sum.plus(installment.amount.toString()),
      new Decimal(0),
    );
    if (!installmentsTotal.equals(document.netPayableAmount.toString())) {
      issues.push("installments total does not match the net payable amount");
    }
  }

  if (issues.length > 0) {
    throw new ValidationError(`Document cannot be formalized: ${issues.join("; ")}`);
  }
}

/**
 * Verifies that the resolved party snapshots are complete for electronic invoicing.
 * Applies only to document types that require e-invoicing.
 *
 * @param documentType - Type of the document being formalized
 * @param snapshots - Snapshots resolved for the formalization
 * @throws ValidationError when a mandatory party field is missing
 */
export function assertSnapshotsAreComplete(
  documentType: DocumentType,
  snapshots: DocumentFormalizationSnapshots,
): void {
  if (!DOCUMENT_TYPE_CONFIG[documentType].requiresEInvoicing) {
    return;
  }

  const issues: string[] = [];

  const counterparty = snapshots.parties.find((party) => party.role === "COUNTERPARTY");
  if (!counterparty) {
    issues.push("counterparty: missing");
  } else {
    issues.push(...getEInvoicePartyIssues(counterparty).map((field) => `counterparty: ${field}`));
  }

  const tenant = snapshots.parties.find((party) => party.role === "TENANT");
  if (!tenant) {
    issues.push("tenant: missing");
  } else {
    issues.push(...getEInvoicePartyIssues(tenant).map((field) => `tenant: ${field}`));
    if (!tenant.taxRegime) issues.push("tenant: taxRegime");
  }

  if (issues.length > 0) {
    throw new ValidationError(`Document cannot be formalized: ${issues.join("; ")}`);
  }
}
