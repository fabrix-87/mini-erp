import { Prisma } from "@/generated/prisma/client";
import { Decimal } from "@prisma/client/runtime/client";
import {
  calculateDocumentLineTotals,
  PRICE_LIST_ROUNDING_METHOD,
  RoundingMethod,
  type CreateDocumentLineInput,
} from "@mini-erp/shared";
import { toJsonField } from "@/helpers/prisma-helper";

/** Resolved pricing data for one document line. */
export interface ResolvedLinePricing {
  /** Final unit price, with up to 6 decimal places. */
  unitPrice: string;
  /** Original list price before manual override, or null. */
  originalUnitPrice: string | null;
  /** Mandatory justification when the price was overridden. */
  priceOverrideReason: string | null;
}

/** Arguments required to build one document line. */
export interface BuildDocumentLineArgs {
  /** Validated line payload. */
  line: CreateDocumentLineInput;
  /** Zero-based index; the builder assigns `lineNumber = index + 1`. */
  index: number;
  /** Price snapshot resolved by the price resolver. */
  pricing: ResolvedLinePricing;
  roundingMethod: RoundingMethod;
}

/** Intermediate result containing computed totals and the Prisma create input. */
export interface ProcessedDocumentLine {
  totals: {
    lineTotal: Decimal;
    taxAmount: Decimal;
  };
  prismaInput: Prisma.DocumentLineUncheckedCreateWithoutDocumentInput;
}

/**
 * Builds a Prisma DocumentLineUncheckedCreateWithoutDocumentInput from a validated line.
 * Server-managed fulfillment counters remain at their database defaults.
 *
 * @param args - Line payload, tenant context and resolved pricing
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
    productId: line.productId ?? undefined,
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
    },
    prismaInput,
  };
}

export interface ResolveDocumentLinePricingArgs {
  line: CreateDocumentLineInput;
  index: number;
  tenantId: string;
  tx: Prisma.TransactionClient;
  roundingMethod: RoundingMethod;
  documentDate: string;
  customerId?: string;
  priceListId?: string;
}

export type ResolveDocumentLinePricing = (
  args: ResolveDocumentLinePricingArgs,
) => Promise<ResolvedLinePricing>;

/**
 * Builds all document lines and returns both the Prisma inputs and the totals
 * required by calculateDocumentTotals.
 *
 * @param lines - Validated line payloads
 * @returns Processed lines in input order
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
      roundingMethod: PRICE_LIST_ROUNDING_METHOD.ROUND_UP,
    }),
  );
}
