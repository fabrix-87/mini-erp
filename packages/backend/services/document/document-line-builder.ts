import { Prisma } from "@/generated/prisma/client";
import {
  type CreateDocumentLineInput,
  Decimal,
  calculateDocumentLineTotals,
} from "@mini-erp/shared";
import { toJsonField } from "@/helpers/prisma-helper";
import { ResolvedLinePricing, ResolvedLineTax } from "@/types";

/** Arguments required to build one document line. */
export interface BuildDocumentLineArgs {
  line: CreateDocumentLineInput;
  index: number;
  pricing: ResolvedLinePricing;
  /** VAT snapshot resolved from the line's tax rule. */
  tax: ResolvedLineTax;
  sourceLineId?: string | null;
}

/** Intermediate result containing computed totals and the Prisma create input. */
export interface ProcessedDocumentLine {
  totals: {
    lineTotal: ReturnType<typeof calculateDocumentLineTotals>["lineTotal"];
    taxAmount: ReturnType<typeof calculateDocumentLineTotals>["taxAmount"];
    taxPercent: string;
  };

  prismaInput: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput;
}

/** Stores DISCOUNT lines with a negative unit price so that totals carry the sign. */
function applyDiscountSign(
  line: CreateDocumentLineInput,
  pricing: ResolvedLinePricing,
): ResolvedLinePricing {
  if (line.lineType !== "DISCOUNT") return pricing;
  const negate = (value: string) => new Decimal(value).abs().neg().toString();
  return {
    ...pricing,
    unitPrice: negate(pricing.unitPrice),
    originalUnitPrice:
      pricing.originalUnitPrice === null ? null : negate(pricing.originalUnitPrice),
  };
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
  const { line, index, tax } = args;
  const pricing = applyDiscountSign(line, args.pricing);

  const totals = calculateDocumentLineTotals({
    quantity: line.quantity,
    unitPrice: pricing.unitPrice,
    discountPercent: line.discountPercent,
    discountAmount: line.discountAmount,
    taxPercent: tax.taxPercent,
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

    taxRuleId: tax.taxRuleId ?? undefined,
    taxPercent: tax.taxPercent,
    taxAmount: totals.taxAmount,
    lineTotalWithTax: totals.lineTotalWithTax,

    vatNatureCode: tax.vatNatureCode ?? undefined,
    vatNormReference: tax.vatNormReference ?? undefined,
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

    sourceLineId: args.sourceLineId ?? undefined,
  };

  return {
    totals: {
      lineTotal: totals.lineTotal,
      taxAmount: totals.taxAmount,
      taxPercent: tax.taxPercent,
    },
    prismaInput,
  };
}

/**
 * Builds all document lines from validated payloads and their resolved pricing.
 *
 * @param lines - Validated line payloads
 * @param linePricing - Resolved pricing, in the same order as `lines`
 * @param lineTax - Resolved taxes, in the same order as `lines`
 * @returns Processed lines in input order
 * @throws Error when the pricing array length does not match the lines array length
 */
export function buildDocumentLines(
  lines: CreateDocumentLineInput[],
  linePricing: ResolvedLinePricing[],
  lineTax: ResolvedLineTax[],
  sourceLineIds?: Array<string | null | undefined>,
): ProcessedDocumentLine[] {
  if (lines.length !== linePricing.length || lines.length !== lineTax.length) {
    throw new Error("Line pricing/tax count does not match line count");
  }
  if (sourceLineIds && sourceLineIds.length !== lines.length) {
    throw new Error("Source line count does not match line count");
  }
  return lines.map((line, index) =>
    buildDocumentLine({
      line,
      index,
      pricing: linePricing[index],
      tax: lineTax[index],
      sourceLineId: sourceLineIds?.[index],
    }),
  );
}
