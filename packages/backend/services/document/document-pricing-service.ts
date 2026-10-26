// packages/backend/services/document/document-pricing-service.ts
import {
  PRICE_SOURCE,
  type ResolvedPrice,
  type ResolvePriceInput,
} from "@mini-erp/shared";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";
import type { Db } from "@/helpers/pricelist-helper";


/**
 * Resolves the price for a document line and returns the snapshot fields.
 * Throws when no price is available and the line is required to be priced.
 * @param db - Prisma client or transaction client
 * @param tenantId - Current tenant
 * @param input - Resolver input (variant, quantity, UoM, list, customer, date)
 * @returns Price snapshot for the document line
 */
export async function resolveDocumentLinePrice(
  db: Db,
  tenantId: string,
  input: ResolvePriceInput,
): Promise<{
  unitPrice: string;
  originalUnitPrice: string | null;
  priceOverrideReason: string | null;
  resolved: ResolvedPrice;
}> {
  const resolved = await resolveVariantPrice(db, tenantId, input);

  if (resolved.source === PRICE_SOURCE.NONE || resolved.unitPrice === null) {
    throw new Error("Nessun prezzo disponibile per questa variante");
  }

  return {
    unitPrice: resolved.unitPrice,
    originalUnitPrice: resolved.unitPrice,
    priceOverrideReason: null,
    resolved,
  };
}
