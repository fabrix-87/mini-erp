import { Prisma } from "@/generated/prisma/client";
import { type CreateDocumentLineInput, calculateDocumentLineTotals } from "@mini-erp/shared";
import { toJsonField } from "@/helpers/prisma-helper";
import { ResolvedLinePricing } from "@/types";

/** Arguments required to build one document line. */
export interface BuildDocumentLineArgs {
  /** Validated line payload. */
  line: CreateDocumentLineInput;

  /** Zero-based index; the builder assigns `lineNumber = index + 1`. */
  index: number;

  /** Pricing snapshot resolved by the price resolver. */
  pricing: ResolvedLinePricing;
}

/** Intermediate result containing computed totals and the Prisma create input. */
export interface ProcessedDocumentLine {
  totals: {
    lineTotal: ReturnType<typeof calculateDocumentLineTotals>["lineTotal"];
    taxAmount: ReturnType<typeof calculateDocumentLineTotals>["taxAmount"];
    taxPercent: ReturnType<typeof calculateDocumentLineTotals>["taxPercent"];
  };

  prismaInput: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput;
}

/**
 * Builds a Prisma DocumentLineUncheckedCreateWithoutDocumentInput from a
 * validated line and its resolved pricing.
 *
 * The input is intended for a nested create inside Document creation:
 * `tenantId` and `documentId` are derived by Prisma from the parent document.
 *
 * @param args - Line payload, zero-based index and resolved pricing
 * @returns Computed totals and the Prisma input for nested creation
 */
export function buildDocumentLine(args: BuildDocumentLineArgs): ProcessedDocumentLine {
  const { line, index, pricing } = args;

  const totals = calculateDocumentLineTotals({
    quantity: line.quantity,
    unitPrice: pricing.unitPrice,
    discountPercent: line.discountPercent,
    discountAmount: line.discountAmount,
    taxPercent: line.taxPercent,
  });

  const prismaInput: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput = {
    lineNumber: index + 1,
    lineType: line.lineType,
    productId: pricing.productId ?? undefined,
    productVariantId: line.productVariantId ?? undefined,

    code: line.code ?? undefined,
    nameSystem: line.nameSystem,
    descriptionSystem: line.descriptionSystem ?? undefined,
    nameCustomer: line.nameCustomer ?? undefined,
    descriptionCustomer: line.descriptionCustomer ?? undefined,

    quantity: line.quantity,
    unit: line.unit,
    unitPrice: pricing.unitPrice,
    unitCost: line.unitCost,

    discountPercent: line.discountPercent,
    discountAmount: totals.discountAmount,
    lineTotal: totals.lineTotal,

    taxRuleId: line.taxRuleId ?? undefined,
    taxPercent: line.taxPercent,
    taxAmount: totals.taxAmount,
    lineTotalWithTax: totals.lineTotalWithTax,

    vatNatureCode: line.vatNatureCode ?? undefined,
    vatNormReference: line.vatNormReference ?? undefined,
    isReverseCharge: line.isReverseCharge,
    isSelfInvoice: line.isSelfInvoice,
    matchStatus: line.matchStatus ?? undefined,

    notes: line.notes ?? undefined,
    customFields: toJsonField(line.customFields),

    warehouseId: line.warehouseId ?? undefined,
    parentLineId: line.parentLineId ?? undefined,
    isComponent: line.isComponent,

    originalUnitPrice: pricing.originalUnitPrice ?? undefined,
    priceOverrideReason: pricing.priceOverrideReason ?? undefined,
  };

  return {
    totals: {
      lineTotal: totals.lineTotal,
      taxAmount: totals.taxAmount,
      taxPercent: line.taxPercent,
    },
    prismaInput,
  };
}

/**
 * Builds all document lines from validated payloads and their resolved pricing.
 *
 * @param lines - Validated line payloads
 * @param linePricing - Resolved pricing, in the same order as `lines`
 * @returns Processed lines in input order
 * @throws Error when the pricing array length does not match the lines array length
 */
export function buildDocumentLines(
  lines: CreateDocumentLineInput[],
  linePricing: ResolvedLinePricing[],
): ProcessedDocumentLine[] {
  if (lines.length !== linePricing.length) {
    throw new Error("Line pricing count does not match line count");
  }

  return lines.map((line, index) =>
    buildDocumentLine({
      line,
      index,
      pricing: linePricing[index],
    }),
  );
}
