import { Prisma } from "@/generated/prisma/client";
import { calculateDocumentTotals, Decimal, isInboundDocumentType } from "@mini-erp/shared";
import { toJsonField, toDecimal } from "@/helpers/prisma-helper";
import { buildDocumentLines, type ProcessedDocumentLine } from "./document-line-builder";
import { buildDocumentInstallments } from "./document-installment-builder";
import type { BuildDocumentCreateDataArgs } from "@/types";

/**
 * Builds a Prisma DocumentUncheckedCreateInput for a new DRAFT document.
 *
 * Numbering, party snapshots and payment/bank snapshots are not created here.
 * They are created during document formalization.
 * Client-provided totals are ignored and recomputed from the lines.
 * Shipping is modeled as a normal document line and is not accepted here.
 *
 * @param args - Input, tenant/user context and resolved line pricing
 * @returns Prisma input ready for tx.document.create({ data })
 */
export function buildDocumentCreateData(
  args: BuildDocumentCreateDataArgs,
): Prisma.DocumentUncheckedCreateInput {
  const { input, context, linePricing } = args;
  const inbound = isInboundDocumentType(input.documentType);

  const processedLines: ProcessedDocumentLine[] = buildDocumentLines(input.lines, linePricing);

  const totals =
    processedLines.length > 0
      ? calculateDocumentTotals({
          lines: processedLines.map((line) => line.totals),
          documentDiscountPercent: input.discountPercent,
        })
      : {
          subtotal: new Decimal(0),
          discountAmount: new Decimal(0),
          taxableAmount: new Decimal(0),
          taxAmount: new Decimal(0),
          totalAmount: new Decimal(0),
          byTaxRate: [],
        };

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
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    taxAmount: totals.taxAmount,
    totalAmount: totals.totalAmount,

    // Withholding tax is not implemented yet: net payable equals total amount.
    netPayableAmount: totals.totalAmount,

    currencyCode: input.currencyCode,
    exchangeRate: toDecimal(input.exchangeRate),
    exchangeRateDate: input.exchangeRateDate ? new Date(input.exchangeRateDate) : new Date(),
    baseCurrencyCode: input.baseCurrencyCode,

    carrierId: input.carrierId ?? undefined,
    trackingNumber: input.trackingNumber ?? undefined,

    paymentMethodId: input.paymentMethodId ?? undefined,

    // paymentMethodCode becomes required again after the model change decision.
    paymentMethodCode: input.paymentMethodCode,

    bankName: input.bankName ?? undefined,
    bankIban: input.bankIban ?? undefined,
    bankSwift: input.bankSwift ?? undefined,
    bankAccountHolder: input.bankAccountHolder ?? undefined,
    paymentBankAccountId: input.paymentBankAccountId ?? undefined,

    notes: input.notes ?? undefined,
    internalNotes: input.internalNotes ?? undefined,
    termsAndConditions: input.termsAndConditions ?? undefined,
    customFields: toJsonField(input.customFields),

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
