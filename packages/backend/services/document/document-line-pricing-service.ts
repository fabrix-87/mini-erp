import {
  Decimal,
  PRICE_SOURCE,
  applyPriceListRounding,
  isNonPricedLineType,
  type CreateDocumentLineInput,
  type ResolvePriceInput,
} from "@mini-erp/shared";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";
import type { Db } from "@/helpers/pricelist-helper";
import type { ResolvedLinePricing } from "@/types";
import { ValidationError } from "@/utils/app-error-utils";

/** Override reason applied when the client provides an explicit unit price. */
const MANUAL_OVERRIDE_REASON = "MANUAL_OVERRIDE";

/** Override reason applied to a manual line without a product variant. */
const MANUAL_LINE_REASON = "MANUAL";

/**
 * Builds the price-list resolver input for a variant-based document line.
 *
 * @param variantId - Product variant identifier.
 * @param quantity - Product quantity.
 * @returns Input accepted by the variant price resolver.
 */
function buildResolvePriceInput(variantId: string, quantity: Decimal.Value): ResolvePriceInput {
  return {
    variantId,
    quantity: quantity.toString(),
  } satisfies ResolvePriceInput;
}

/**
 * Resolves the effective pricing for one document line.
 *
 * Non-priced lines always resolve to zero. Variant-based lines resolve their
 * list price through the price-list resolver; an explicit client unit price is
 * treated as a manual override and the list price is preserved as the original
 * unit price. Lines without a variant always use the client-provided unit price.
 *
 * @param db - Prisma client or transaction client.
 * @param tenantId - Current tenant ID.
 * @param line - Validated document line payload.
 * @returns Pricing snapshot used by the document line builder.
 * @throws ValidationError When a manual line has no unit price or a variant
 * line without an override has no applicable list price.
 */
export async function resolveDocumentLinePricing(
  db: Db,
  tenantId: string,
  line: CreateDocumentLineInput,
): Promise<ResolvedLinePricing> {
  if (isNonPricedLineType(line.lineType)) {
    return {
      unitPrice: "0",
      originalUnitPrice: "0",
      priceOverrideReason: null,
    };
  }

  const hasVariant = line.productVariantId !== null && line.productVariantId !== undefined;

  if (!hasVariant) {
    if (line.unitPrice === undefined || line.unitPrice === null) {
      throw new ValidationError("Unit price is required for a manual document line");
    }

    const unitPrice = line.unitPrice.toString();

    return {
      unitPrice,
      originalUnitPrice: unitPrice,
      priceOverrideReason: MANUAL_LINE_REASON,
    };
  }

  const resolved = await resolveVariantPrice(
    db,
    tenantId,
    buildResolvePriceInput(line.productVariantId!, line.quantity),
  );

  const hasListPrice = resolved.source !== PRICE_SOURCE.NONE && resolved.unitPrice !== null;

  const listPrice = hasListPrice
    ? applyPriceListRounding(resolved.unitPrice!, resolved.roundingMethod).toString()
    : null;

  const hasManualOverride = line.unitPrice !== undefined && line.unitPrice !== null;

  if (!hasListPrice && !hasManualOverride) {
    throw new ValidationError("No price available for this variant");
  }

  if (hasManualOverride) {
    return {
      unitPrice: line.unitPrice!.toString(),
      originalUnitPrice: listPrice ?? line.unitPrice!.toString(),
      priceOverrideReason: MANUAL_OVERRIDE_REASON,
    };
  }

  return {
    unitPrice: listPrice!,
    originalUnitPrice: listPrice,
    priceOverrideReason: null,
  };
}
