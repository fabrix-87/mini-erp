import type { DocumentLine } from "@/generated/prisma/client";
import {
  Decimal,
  calculateDiscount,
  roundCurrency,
  type CreateDocumentLineInput,
} from "@mini-erp/shared";
import type { ResolvedLinePricing } from "@/types";
import { ValidationError } from "@/utils/app-error-utils";

/** A persisted line prepared for creation in a derived document. */
export interface CopiedLine {
  input: CreateDocumentLineInput;
  pricing: ResolvedLinePricing;
  sourceLineId: string;
}

/**
 * Converts a persisted line into a creation payload for a derived document, keeping the
 * persisted price (no price-list lookup). The persisted `discountAmount` already includes the
 * percentage discount, so only the explicit part is carried over, scaled to the new quantity.
 * Kit links (`parentLineId`, `isComponent`) are not copied.
 * Descriptive lines ignore `quantity`.
 *
 * @param source - Persisted source line
 * @param quantity - Quantity to carry over (priced lines only)
 * @returns Creation payload, pricing snapshot and the source line ID
 * @throws ValidationError when a priced line has no tax rule
 */
export function copyLine(source: DocumentLine, quantity: Decimal.Value): CopiedLine {
  const common = {
    productVariantId: source.productVariantId,
    code: source.code,
    nameSystem: source.nameSystem,
    descriptionSystem: source.descriptionSystem,
    nameCustomer: source.nameCustomer,
    descriptionCustomer: source.descriptionCustomer,
    isReverseCharge: source.isReverseCharge,
    isSelfInvoice: source.isSelfInvoice,
    notes: source.notes,
    customFields: source.customFields,
    warehouseId: source.warehouseId,
    isComponent: false,
  };

  if (
    source.lineType === "TEXT" ||
    source.lineType === "PAGE_BREAK" ||
    source.lineType === "SUBTOTAL"
  ) {
    return {
      sourceLineId: source.id,
      pricing: {
        productId: null,
        unitPrice: "0",
        originalUnitPrice: "0",
        priceOverrideReason: null,
      },
      input: {
        ...common,
        productVariantId: null,
        warehouseId: null,
        lineType: source.lineType,
        quantity: 0,
        unit: "",
        unitPrice: 0,
        unitCost: undefined,
        discountPercent: 0,
        discountAmount: 0,
      },
    };
  }

  if (source.taxRuleId === null) {
    throw new ValidationError(`Line ${source.lineNumber} has no tax rule and cannot be copied`);
  }

  const qty = new Decimal(quantity);
  const sourceQty = new Decimal(source.quantity.toString());
  const unitPrice = new Decimal(source.unitPrice.toString());
  const percentPart = calculateDiscount(
    unitPrice.times(sourceQty).abs(),
    source.discountPercent.toString(),
  );
  const explicit = Decimal.max(new Decimal(source.discountAmount.toString()).minus(percentPart), 0);
  const scaledExplicit = sourceQty.isZero()
    ? explicit
    : roundCurrency(explicit.times(qty).div(sourceQty));

  return {
    sourceLineId: source.id,
    pricing: {
      productId: source.productId,
      unitPrice: unitPrice.toFixed(6),
      originalUnitPrice: source.originalUnitPrice?.toFixed(6) ?? null,
      priceOverrideReason: source.priceOverrideReason,
    },
    input: {
      ...common,
      lineType: source.lineType,
      quantity: qty.toFixed(6),
      unit: source.unit,
      unitPrice: unitPrice.abs().toFixed(6),
      unitCost: source.unitCost.toFixed(6),
      discountPercent: source.discountPercent.toFixed(2),
      discountAmount: scaledExplicit.toFixed(2),
      taxRuleId: source.taxRuleId,
    },
  };
}
