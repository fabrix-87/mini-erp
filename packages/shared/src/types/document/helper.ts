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

export interface DocumentTotalsInput {
  lines: Array<{
    lineTotal: Decimal;
    taxAmount: Decimal;
  }>;
  documentDiscountPercent?: Decimal.Value | null;
}

export interface CalculatedDocumentTotals {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  totalAmount: Decimal;
}
