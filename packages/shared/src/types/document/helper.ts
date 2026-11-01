import Decimal from "decimal.js";

export interface DocumentLinePricingInput {
  quantity: Decimal.Value;
  unitPrice: Decimal.Value;
  discountPercent?: Decimal.Value | null;
  discountAmount?: Decimal.Value | null;
  taxPercent?: Decimal.Value | null;
}

export interface CalculatedDocumentLineTotals {
  grossTotal: Decimal;
  discountAmount: Decimal;
  lineTotal: Decimal;
  taxAmount: Decimal;
  lineTotalWithTax: Decimal;
}

/** Taxable base and tax for one VAT rate. */
export interface TaxRateSummary {
  taxPercent: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
}

export interface DocumentTotalsInput {
  lines: Array<{
    lineTotal: Decimal;
    taxPercent: Decimal.Value | null | undefined;
  }>;
  documentDiscountPercent?: Decimal.Value | null;
}

export interface CalculatedDocumentTotals {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
  /** VAT summary grouped by rate, sorted by rate ascending. */
  byTaxRate: TaxRateSummary[];
}

/** Minimal party data needed to evaluate electronic invoicing readiness. */
export interface EInvoicePartyData {
  name?: string | null;
  vatNumber?: string | null;
  vatId?: string | null;
  taxCode?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  province?: string | null;
  countryCode?: string | null;
}