import { PRICE_SOURCE, applyPriceListRounding, type ResolvePriceInput } from "@mini-erp/shared";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";
import type { Db } from "@/helpers/pricelist-helper";
import type { ResolvedLinePricing } from "@/types";

/**
 * Resolves the final unit price for a document line.
 *
 * The price returned by the price-list resolver is rounded once using the
 * rounding method of the applied price list. Manual overrides are not handled
 * here: they are recorded on the document line through originalUnitPrice and
 * priceOverrideReason.
 *
 * @param db - Prisma client or transaction client
 * @param tenantId - Current tenant ID
 * @param input - Price resolver input
 * @returns Resolved pricing snapshot for the document line
 * @throws Error when no applicable price is found
 */
export async function resolveDocumentLinePrice(
  db: Db,
  tenantId: string,
  input: ResolvePriceInput,
): Promise<ResolvedLinePricing> {
  const resolved = await resolveVariantPrice(db, tenantId, input);

  if (resolved.source === PRICE_SOURCE.NONE || resolved.unitPrice === null) {
    throw new Error("No price available for this variant");
  }

  const unitPrice = applyPriceListRounding(resolved.unitPrice, resolved.roundingMethod);

  return {
    unitPrice: unitPrice.toString(),
    originalUnitPrice: unitPrice.toString(),
    priceOverrideReason: null,
  };
}
