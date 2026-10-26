import { Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
  type CreateDocumentInput,
  calculateDocumentTotals,
  isInboundDocumentType,
} from "@mini-erp/shared";
import { toJsonField, toDecimal } from "@/helpers/prisma-helper";
import { buildDocumentLines, type ResolvedLinePricing } from "./document-line-builder";
import { buildDocumentInstallments } from "./document-installment-builder";
import type { DocumentCreateContext, DocumentCreateSnapshots } from "./types";

/** Arguments for the synchronous document create builder. */
export interface BuildDocumentCreateDataArgs {
  /** Validated document creation payload. */
  input: CreateDocumentInput;
  /** Tenant and authenticated user context. */
  context: DocumentCreateContext;
  /** Server-resolved snapshots. */
  snapshots: DocumentCreateSnapshots;
  /** Pricing resolved for each input line, in the same order. */
  linePricing: ResolvedLinePricing[];
}

/**
 * Builds a Prisma DocumentUncheckedCreateInput for a new document.
 * Documents are always created as DRAFT: numbering is assigned later, during
 * the first status transition that requires a number.
 * Client-provided totals are ignored and recomputed from the lines.
 *
 * @param args - Input, context, snapshots and resolved line pricing
 * @returns Prisma input ready for tx.document.create({ data })
 */
export function buildDocumentCreateData(
  args: BuildDocumentCreateDataArgs,
): Promise<Prisma.DocumentUncheckedCreateInput> {
  const { input, context, snapshots, linePricing } = args;
  const inbound = isInboundDocumentType(input.documentType);

  const processedLines = buildDocumentLines(input.lines, linePricing);

  const totals =
    processedLines.length > 0
      ? calculateDocumentTotals({
          lines: processedLines.map((line) => line.totals),
          documentDiscountPercent: input.discountPercent,
          shippingCost: input.shippingCost,
        })
      : {
          subtotal: new Decimal(0),
          discountAmount: new Decimal(0),
          taxableAmount: new Decimal(0),
          taxAmount: new Decimal(0),
          shippingTaxAmount: new Decimal(0),
          totalAmount: new Decimal(0),
        };

  const withholdingTaxAmount = snapshots.withholding?.withholdingTaxAmount ?? new Decimal(0);

  const netPayableAmount = totals.totalAmount.minus(withholdingTaxAmount);

  const documentData: Prisma.DocumentUncheckedCreateInput = {
    tenantId: context.tenantId,

    documentType: input.documentType,
    status: "DRAFT",
    direction: inbound ? "INBOUND" : "OUTBOUND",

    documentYear: input.documentYear,
    documentDate: new Date(input.documentDate),
    dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,

    counterpartyDocumentNumber: inbound ? input.counterpartyDocumentNumber : undefined,
    receivedDate: inbound && input.receivedDate ? new Date(input.receivedDate) : undefined,
    registrationDate:
      inbound && input.registrationDate ? new Date(input.registrationDate) : undefined,

    customerId: input.customerId ?? undefined,
    supplierId: input.supplierId ?? undefined,
    contactId: input.contactId ?? undefined,
    opportunityId: input.opportunityId ?? undefined,
    leadId: input.leadId ?? undefined,
    warehouseId: input.warehouseId ?? undefined,
    assignedUserId: input.assignedUserId ?? undefined,
    createdByUserId: context.userId,

    discountPercent: toDecimal(input.discountPercent),
    shippingCost: toDecimal(input.shippingCost),
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    taxAmount: totals.taxAmount,
    shippingTaxAmount: totals.shippingTaxAmount,
    totalAmount: totals.totalAmount,
    netPayableAmount: totals.totalAmount,

    currencyCode: input.currencyCode,
    exchangeRate: toDecimal(input.exchangeRate),
    exchangeRateDate: input.exchangeRateDate ? new Date(input.exchangeRateDate) : new Date(),
    baseCurrencyCode: input.baseCurrencyCode,

    carrierId: input.carrierId ?? undefined,
    trackingNumber: input.trackingNumber ?? undefined,

    paymentMethodId: input.paymentMethodId ?? undefined,
    paymentMethodCode: snapshots.payment.paymentMethodCode,
    paymentTermsLabel: snapshots.payment.paymentTermsLabel ?? undefined,

    bankName: snapshots.bank.bankName ?? undefined,
    bankIban: snapshots.bank.bankIban ?? undefined,
    bankSwift: snapshots.bank.bankSwift ?? undefined,
    bankAccountHolder: snapshots.bank.bankAccountHolder ?? undefined,
    paymentBankAccountId: snapshots.bank.paymentBankAccountId ?? undefined,
    bankDetailsMismatch: snapshots.bank.bankDetailsMismatch,

    withholdingTaxTypeId: snapshots.withholding?.withholdingTaxTypeId,
    withholdingTaxTypeCode: snapshots.withholding?.withholdingTaxTypeCode,
    withholdingTaxBase: snapshots.withholding?.withholdingTaxBase,
    withholdingTaxPercent: snapshots.withholding?.withholdingTaxPercent,
    withholdingTaxAmount: snapshots.withholding?.withholdingTaxAmount,

    contributionPercent: snapshots.contribution?.contributionPercent,
    contributionAmount: snapshots.contribution?.contributionAmount,

    notes: input.notes ?? undefined,
    internalNotes: input.internalNotes ?? undefined,
    termsAndConditions: input.termsAndConditions ?? undefined,
    customFields: toJsonField(input.customFields),

    parties: {
      create: snapshots.parties,
    },

    ...(processedLines.length > 0 && {
      lines: {
        create: processedLines.map((line) => line.prismaInput),
      },
    }),

    ...(input.installments.length > 0 && {
      installments: {
        create: buildDocumentInstallments(input.installments, context.tenantId),
      },
    }),
  };

  return documentData satisfies Prisma.DocumentUncheckedCreateInput;
}
