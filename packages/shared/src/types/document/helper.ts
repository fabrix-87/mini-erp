import Decimal from "decimal.js";
import { RoundingMethod } from "../../constants";

export interface DocumentLinePricingInput {
  quantity: Decimal.Value;
  unitPrice: Decimal.Value;
  discountPercent?: Decimal.Value | null;
  discountAmount?: Decimal.Value | null;
  taxPercent?: Decimal.Value | null;
  roundingMethod: RoundingMethod;
}

export interface CalculatedDocumentLineTotals {
  grossTotal: Decimal;
  discountAmount: Decimal;
  lineTotal: Decimal;
  taxAmount: Decimal;
  lineTotalWithTax: Decimal;
}

export interface DocumentTotalsInput {
  lines: Array<Pick<CalculatedDocumentLineTotals, "lineTotal" | "taxAmount">>;
  documentDiscountPercent?: Decimal.Value | null;
  shippingCost?: Decimal.Value | null;
  shippingTaxPercent?: Decimal.Value | null;
}

export interface CalculatedDocumentTotals {
  subtotal: Decimal;
  discountAmount: Decimal;
  taxableAmount: Decimal;
  taxAmount: Decimal;
  shippingTaxAmount: Decimal;
  totalAmount: Decimal;
}
