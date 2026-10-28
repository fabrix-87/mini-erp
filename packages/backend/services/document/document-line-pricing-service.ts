import {
  DOCUMENTS_REQUIRING_SUPPLIER,
  Decimal,
  PRICE_SOURCE,
  isNonPricedLineType,
  type CreateDocumentLineInput,
  type DocumentType,
  type ResolvePriceInput,
} from "@mini-erp/shared";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";
import { PriceListError, type Db } from "@/helpers/pricelist-helper";
import { withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import type { DocumentLinePricingContext, ResolvedLinePricing } from "@/types";
import { NotFoundError, ValidationError } from "@/utils/app-error-utils";

/** Override reason applied when the client overrides a price-list price. */
const MANUAL_OVERRIDE_REASON = "MANUAL_OVERRIDE";

/** Reason applied to a manually priced line (no variant, or purchase document). */
const MANUAL_LINE_REASON = "MANUAL";

/**
 * Resolves the price-list price of a variant, mapping resolver errors to AppErrors.
 *
 * @param db - Prisma client or transaction client
 * @param context - Document pricing context
 * @param variantId - Product variant ID
 * @param quantity - Line quantity
 * @returns The list unit price, or null when no price list applies
 * @throws NotFoundError | ValidationError when the resolver rejects the request
 */
async function resolveListPrice(
  db: Db,
  context: DocumentLinePricingContext,
  variantId: string,
  quantity: Decimal.Value,
): Promise<string | null> {
  try {
    const resolved = await resolveVariantPrice(db, context.tenantId, {
      variantId,
      quantity: quantity.toString(),
      customerId: context.customerId ?? undefined,
      currencyCode: context.currencyCode,
      at: context.documentDate.toISOString(),
    } satisfies ResolvePriceInput);

    // The resolver already rounds derived prices: do not round again here.
    return resolved.source === PRICE_SOURCE.NONE ? null : resolved.unitPrice;
  } catch (error) {
    if (error instanceof PriceListError) {
      throw error.code === "NOT_FOUND"
        ? new NotFoundError(error.message)
        : new ValidationError(error.message);
    }
    throw error;
  }
}

/**
 * Resolves the effective pricing for one document line.
 *
 * - Descriptive lines resolve to zero.
 * - Lines without a variant are manual: the client unit price is required.
 * - Variant lines on sales documents use the price list (customer, currency and
 *   document date aware); an explicit different unit price is a manual override.
 * - Purchase documents never use sales price lists: the unit price is required.
 *
 * @param db - Prisma client or transaction client
 * @param context - Document pricing context
 * @param line - Validated document line payload
 * @returns Pricing snapshot, including the product ID derived from the variant
 * @throws ValidationError When no usable price exists
 * @throws NotFoundError When the variant does not belong to the tenant
 */
export async function resolveDocumentLinePricing(
  db: Db,
  context: DocumentLinePricingContext,
  line: CreateDocumentLineInput,
): Promise<ResolvedLinePricing> {
  if (isNonPricedLineType(line.lineType)) {
    return { productId: null, unitPrice: "0", originalUnitPrice: "0", priceOverrideReason: null };
  }

  const clientPrice = line.unitPrice ?? undefined;

  if (!line.productVariantId) {
    if (clientPrice === undefined) {
      throw new ValidationError("Unit price is required for a manual document line");
    }
    return {
      productId: null,
      unitPrice: clientPrice.toString(),
      originalUnitPrice: clientPrice.toString(),
      priceOverrideReason: MANUAL_LINE_REASON,
    };
  }

  const variant = await db.productVariant.findFirst({
    where: withSoftDelete(withTenantId({ id: line.productVariantId }, context.tenantId)),
    select: { productId: true },
  });

  if (!variant) {
    throw new NotFoundError("Product variant not found");
  }

  if (DOCUMENTS_REQUIRING_SUPPLIER.includes(context.documentType)) {
    if (clientPrice === undefined) {
      throw new ValidationError("Unit price is required for purchase documents");
    }
    return {
      productId: variant.productId,
      unitPrice: clientPrice.toString(),
      originalUnitPrice: clientPrice.toString(),
      priceOverrideReason: MANUAL_LINE_REASON,
    };
  }

  const listPrice = await resolveListPrice(db, context, line.productVariantId, line.quantity);

  if (listPrice === null && clientPrice === undefined) {
    throw new ValidationError("No price available for this variant");
  }

  // TODO(permissions): overriding a price-list price requires a dedicated permission
  // (e.g. "documents:override-price"). Enforce it in the route chain once it exists.
  const isOverride =
    clientPrice !== undefined &&
    (listPrice === null || !new Decimal(clientPrice).equals(listPrice));

  if (isOverride) {
    return {
      productId: variant.productId,
      unitPrice: clientPrice.toString(),
      originalUnitPrice: listPrice ?? clientPrice.toString(),
      priceOverrideReason: MANUAL_OVERRIDE_REASON,
    };
  }

  return {
    productId: variant.productId,
    unitPrice: listPrice!,
    originalUnitPrice: listPrice,
    priceOverrideReason: null,
  };
}
