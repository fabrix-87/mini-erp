// ============================================================================
// DOCUMENT UTILITIES (SHARED)
// Pure utility functions without business logic or DB access
// Can be used in both frontend and backend
// ============================================================================

import Decimal from "decimal.js";
import {
  CalculatedDocumentLineTotals,
  CalculatedDocumentTotals,
  DocumentLinePricingInput,
  DocumentTotalsInput,
  TaxRateSummary,
} from "../types";
import { roundCurrency } from "../helpers";
import { DOCUMENT_NUMBER_PADDING, DOCUMENT_PREFIXES, OutboundDocumentType } from "../constants";

/**
 * Calculate discount from percentage
 */
export const calculateDiscount = (
  grossTotal: Decimal,
  discountPercent: Decimal.Value | null | undefined,
): Decimal => {
  const percent = new Decimal(discountPercent ?? 0);
  return roundCurrency(grossTotal.times(percent).div(100));
};

/**
 * Computes the totals of one document line.
 * unitPrice keeps 6 decimals; all monetary results are rounded to 2 decimals.
 * @param {DocumentLinePricingInput} input - Line pricing values (quantity in line UoM)
 * @returns Totals rounded to cents
 */
export function calculateDocumentLineTotals(
  input: DocumentLinePricingInput,
): CalculatedDocumentLineTotals {
  const quantity = new Decimal(input.quantity);
  const unitPrice = new Decimal(input.unitPrice);
  const grossTotal = unitPrice.times(quantity);

  // Discounts are computed on the absolute amount so that negative
  // quantities (credit notes) keep their sign instead of collapsing to zero.
  const sign = grossTotal.isNegative() ? -1 : 1;
  const absGross = grossTotal.abs();

  const percentDiscount = calculateDiscount(absGross, input.discountPercent);
  const explicitDiscount = roundCurrency(new Decimal(input.discountAmount ?? 0).abs());
  const discountAmount = Decimal.min(percentDiscount.plus(explicitDiscount), absGross);

  const lineTotal = roundCurrency(absGross.minus(discountAmount)).times(sign);
  const taxAmount = roundCurrency(lineTotal.times(new Decimal(input.taxPercent ?? 0)).div(100));

  return {
    grossTotal: roundCurrency(grossTotal),
    discountAmount, // always a positive magnitude
    lineTotal,
    taxAmount,
    lineTotalWithTax: roundCurrency(lineTotal.plus(taxAmount)),
  };
}

/**
 * Computes document totals from already-rounded line totals.
 * The document-level percentage discount applies to the taxable base of each
 * VAT rate. Tax is computed per rate on the discounted base (as in the VAT
 * summary of an invoice), so it is not the sum of the per-line tax amounts.
 * Rounding differences between the grouped bases and the discounted subtotal
 * are absorbed by the largest group, so the groups always add up to the
 * document taxable amount.
 *
 * @param input - Line totals with tax rate plus the document-level discount percent
 * @returns Document totals and VAT summary per rate, rounded to cents
 */
export function calculateDocumentTotals(input: DocumentTotalsInput): CalculatedDocumentTotals {
  const subtotal = roundCurrency(
    input.lines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0)),
  );
  const discountAmount = calculateDiscount(subtotal, input.documentDiscountPercent);
  const taxableAmount = roundCurrency(subtotal.minus(discountAmount));

  const factor = new Decimal(1).minus(new Decimal(input.documentDiscountPercent ?? 0).div(100));

  const bases = new Map<string, { taxPercent: Decimal; base: Decimal }>();
  for (const line of input.lines) {
    if (line.lineTotal.isZero()) continue;
    const taxPercent = new Decimal(line.taxPercent ?? 0);
    const key = taxPercent.toString();
    const entry = bases.get(key) ?? { taxPercent, base: new Decimal(0) };
    entry.base = entry.base.plus(line.lineTotal);
    bases.set(key, entry);
  }

  const groups = [...bases.values()]
    .sort((a, b) => a.taxPercent.cmp(b.taxPercent))
    .map((g) => ({ taxPercent: g.taxPercent, taxableAmount: roundCurrency(g.base.times(factor)) }));

  const drift = taxableAmount.minus(
    groups.reduce((s, g) => s.plus(g.taxableAmount), new Decimal(0)),
  );
  if (groups.length > 0 && !drift.isZero()) {
    const largest = groups.reduce((a, b) =>
      b.taxableAmount.abs().gt(a.taxableAmount.abs()) ? b : a,
    );
    largest.taxableAmount = largest.taxableAmount.plus(drift);
  }

  const byTaxRate: TaxRateSummary[] = groups.map((g) => ({
    taxPercent: g.taxPercent,
    taxableAmount: g.taxableAmount,
    taxAmount: roundCurrency(g.taxableAmount.times(g.taxPercent).div(100)),
  }));

  const taxAmount = byTaxRate.reduce((s, g) => s.plus(g.taxAmount), new Decimal(0));

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    totalAmount: roundCurrency(taxableAmount.plus(taxAmount)),
    byTaxRate,
  };
}

/**
 * Parses a formatted document number string into its core components.
 * Returns null if the format is invalid or if the year and sequence number are not valid numbers.
 *
 * @param {string} documentNumber - The document number string to parse (e.g., "INV/2026/0012").
 * @returns {{ prefix: string; year: number; number: number } | null} The parsed components, or null if invalid.
 *
 * @example
 * const parsed = parseDocumentNumber("INV/2026/0012"); // Returns { prefix: "INV", year: 2026, number: 12 }
 */
export const parseDocumentNumber = (
  documentNumber: string,
): { prefix: string; year: number; number: number } | null => {
  const parts = documentNumber.split("/");

  if (parts.length !== 3) {
    return null;
  }

  const year = parseInt(parts[1], 10);
  const number = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(number)) {
    return null;
  }

  return {
    prefix: parts[0],
    year,
    number,
  };
};

/**
 * Formats an outbound document number string using the document type prefix, year, and a zero-padded sequence number.
 *
 * @param {OutboundDocumentType} documentType - The type of outbound document (e.g., invoice, estimate).
 * @param {number} year - The four-digit year associated with the document.
 * @param {number} sequenceNumber - The raw numeric sequence number to be padded.
 * @returns {string} The fully formatted document number in the format `prefix/year/paddedNumber`.
 *
 * @example
 * const docNumber = formatDocumentNumber(OutboundDocumentType.INVOICE, 2026, 12); // Returns "INV/2026/0012" (depending on padding)
 */
export function formatDocumentNumber(
  documentType: OutboundDocumentType,
  year: number,
  sequenceNumber: number,
): string {
  const prefix = DOCUMENT_PREFIXES[documentType];
  const padding = DOCUMENT_NUMBER_PADDING[documentType];

  const paddedNumber = sequenceNumber.toString().padStart(padding, "0");
  return `${prefix}/${year}/${paddedNumber}`;
}

/**
 * Calculates the fulfillment percentage based on the delivered and total quantities.
 * Returns 0 if the total quantity is zero.
 *
 * @param {import("decimal.js").Decimal.Value} totalQuantity - The total target quantity.
 * @param {import("decimal.js").Decimal.Value} deliveredQuantity - The quantity delivered so far.
 * @returns {Decimal} The fulfillment percentage as a Decimal instance, rounded to the nearest integer.
 *
 * @example
 * const percentage = calculateFulfillmentPercentage(200, 150); // Returns Decimal(75)
 */
export const calculateFulfillmentPercentage = (
  totalQuantity: Decimal.Value,
  deliveredQuantity: Decimal.Value,
): Decimal => {
  const total = new Decimal(totalQuantity);
  if (total.isZero()) {
    return new Decimal(0);
  }

  const delivered = new Decimal(deliveredQuantity);
  return delivered.div(total).times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
};

/**
 * Calculates the payment percentage based on the paid and total amounts.
 * Returns a Decimal of 0 if the total amount is zero.
 *
 * @param {import("decimal.js").Decimal.Value} totalAmount - The total expected payment amount.
 * @param {import("decimal.js").Decimal.Value} paidAmount - The amount paid so far.
 * @returns {Decimal} The payment percentage as a Decimal instance, rounded to the nearest integer.
 *
 * @example
 * const percentage = calculatePaymentPercentage(1000, 250); // Returns Decimal(25)
 */
export const calculatePaymentPercentage = (
  totalAmount: Decimal.Value,
  paidAmount: Decimal.Value,
): Decimal => {
  const total = new Decimal(totalAmount);
  if (total.isZero()) {
    return new Decimal(0);
  }

  const paid = new Decimal(paidAmount);
  return paid.div(total).times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
};
