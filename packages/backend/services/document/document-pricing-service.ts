// packages/backend/services/document/document-pricing-service.ts
import {
  Decimal,
  PRICE_SOURCE,
  type ResolvedPrice,
  type ResolvePriceInput,
} from "@mini-erp/shared";
import { resolveVariantPrice } from "@/services/pricelist/price-resolver-service";
import type { Db } from "@/helpers/pricelist-helper";

/** Rounding used for all document amounts (cents). */
const MONEY = 2;

const toMoney = (value: Decimal.Value): Decimal =>
  new Decimal(value).toDecimalPlaces(MONEY, Decimal.ROUND_HALF_UP);

export interface DocumentLinePricingInput {
  quantity: Decimal.Value;
  unitPrice: Decimal.Value;
  discountPercent?: Decimal.Value | null;
  discountAmount?: Decimal.Value | null;
  taxPercent?: Decimal.Value | null;
}

export interface DocumentLineTotals {
  grossTotal: Decimal;
  discountAmount: Decimal;
  lineTotal: Decimal;
  taxAmount: Decimal;
  lineTotalWithTax: Decimal;
}

/**
 * Computes the totals of one document line.
 * unitPrice keeps 6 decimals; all monetary results are rounded to 2 decimals.
 * @param input - Line pricing values (quantity in line UoM)
 * @returns Totals rounded to cents
 */
export function calculateDocumentLineTotals(input: DocumentLinePricingInput): DocumentLineTotals {
  const quantity = new Decimal(input.quantity);
  const unitPrice = new Decimal(input.unitPrice);
  const grossTotal = unitPrice.times(quantity);

  const percentDiscount = toMoney(
    grossTotal.times(new Decimal(input.discountPercent ?? 0)).div(100),
  );
  const explicitDiscount = toMoney(input.discountAmount ?? 0);
  const discountAmount = Decimal.min(percentDiscount.plus(explicitDiscount), grossTotal);

  const lineTotal = toMoney(grossTotal.minus(discountAmount));
  const taxAmount = toMoney(lineTotal.times(new Decimal(input.taxPercent ?? 0)).div(100));

  return {
    grossTotal: toMoney(grossTotal),
    discountAmount,
    lineTotal,
    taxAmount,
    lineTotalWithTax: toMoney(lineTotal.plus(taxAmount)),
  };
}

export interface DocumentTotalsInput {
  lines: Array<Pick<DocumentLineTotals, "lineTotal" | "taxAmount">>;
  documentDiscountPercent?: Decimal.Value | null;
  shippingCost?: Decimal.Value | null;
  shippingTaxPercent?: Decimal.Value | null;
}

export interface DocumentTotals {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  shippingTaxAmount: Decimal;
  totalAmount: Decimal;
}

/**
 * Computes document totals from already-rounded line totals.
 * The document-level percentage discount applies to the taxable base.
 * @param input - Line totals plus document-level discount and shipping
 * @returns Document totals rounded to cents
 */
export function calculateDocumentTotals(input: DocumentTotalsInput): DocumentTotals {
  const subtotal = toMoney(input.lines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0)));
  const discountAmount = toMoney(
    subtotal.times(new Decimal(input.documentDiscountPercent ?? 0)).div(100),
  );
  const taxableAmount = toMoney(subtotal.minus(discountAmount));

  const lineTax = input.lines.reduce((sum, l) => sum.plus(l.taxAmount), new Decimal(0));
  const shippingCost = toMoney(input.shippingCost ?? 0);
  const shippingTaxAmount = toMoney(
    shippingCost.times(new Decimal(input.shippingTaxPercent ?? 0)).div(100),
  );
  const taxAmount = toMoney(lineTax.plus(shippingTaxAmount));

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shippingTaxAmount,
    totalAmount: toMoney(taxableAmount.plus(taxAmount).plus(shippingCost)),
  };
}

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
