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
} from "../types";
import { roundPrice } from "../helpers";
import { PRICE_LIST_ROUNDING_METHOD, RoundingMethod } from "../constants";

/**
 * Calculate discount from percentage
 */
export const calculateDiscount = (
  grossTotal: Decimal,
  discountPercent: Decimal.Value | null | undefined,
  roundingMethod: RoundingMethod = PRICE_LIST_ROUNDING_METHOD.ROUND_UP,
): Decimal => {
  const percent = new Decimal(discountPercent ?? 0);
  return roundPrice(grossTotal.times(percent).div(100), roundingMethod);
};

/**
 * Parse document number into components
 */
export const parseDocumentNumber = (
  documentNumber: string,
): { prefix: string; year: number; number: number } | null => {
  const parts = documentNumber.split("/");

  if (parts.length !== 3) {
    return null;
  }

  return {
    prefix: parts[0],
    year: parseInt(parts[1], 10),
    number: parseInt(parts[2], 10),
  };
};

/**
 * Calculate days until due date
 */
export const getDaysUntilDue = (dueDate: Date | string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Generate unique payment reference
 */
export const generatePaymentReference = (
  documentNumber: string,
  installmentNumber: number,
): string => {
  return `${documentNumber}/R${installmentNumber}`;
};

/**
 * Calculate total of installments
 */
export const calculateInstallmentTotal = (
  installments: Array<{ amount: number | string }>,
): number => {
  return installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
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

  const percentDiscount = calculateDiscount(
    grossTotal,
    input.discountPercent,
    input.roundingMethod,
  );
  const explicitDiscount = roundPrice(input.discountAmount ?? 0, input.roundingMethod);
  const discountAmount = Decimal.min(percentDiscount.plus(explicitDiscount), grossTotal);

  const lineTotal = roundPrice(grossTotal.minus(discountAmount), input.roundingMethod);
  const taxAmount = roundPrice(
    lineTotal.times(new Decimal(input.taxPercent ?? 0)).div(100),
    input.roundingMethod,
  );

  return {
    grossTotal: roundPrice(grossTotal, input.roundingMethod),
    discountAmount,
    lineTotal,
    taxAmount,
    lineTotalWithTax: roundPrice(lineTotal.plus(taxAmount), input.roundingMethod),
  };
}

/**
 * Computes document totals from already-rounded line totals.
 * The document-level percentage discount applies to the taxable base.
 * @param {DocumentTotalsInput} input - Line totals plus document-level discount and shipping
 * @returns Document totals rounded to cents
 */
export function calculateDocumentTotals(input: DocumentTotalsInput): CalculatedDocumentTotals {
  const subtotal = roundPrice(
    input.lines.reduce((sum, l) => sum.plus(l.lineTotal), new Decimal(0)),
  );
  const discountAmount = calculateDiscount(subtotal, input.documentDiscountPercent);

  const taxableAmount = roundPrice(subtotal.minus(discountAmount));

  const lineTax = input.lines.reduce((sum, l) => sum.plus(l.taxAmount), new Decimal(0));
  const shippingCost = roundPrice(input.shippingCost ?? 0);
  const shippingTaxAmount = roundPrice(
    shippingCost.times(new Decimal(input.shippingTaxPercent ?? 0)).div(100),
  );
  const taxAmount = roundPrice(lineTax.plus(shippingTaxAmount));

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shippingTaxAmount,
    totalAmount: roundPrice(taxableAmount.plus(taxAmount).plus(shippingCost)),
  };
}

/**
 * Check if document is editable based on status
 */
export const isDocumentEditable = (status: string): boolean => {
  return ["DRAFT", "PENDING_APPROVAL"].includes(status);
};

/**
 * Check if document can be deleted
 */
export const isDocumentDeletable = (status: string, hasNumber: boolean): boolean => {
  return status === "DRAFT" && !hasNumber;
};

/**
 * Calculate fulfillment percentage
 */
export const calculateFulfillmentPercentage = (
  totalQuantity: number,
  deliveredQuantity: number,
): number => {
  if (totalQuantity === 0) return 0;
  return Math.round((deliveredQuantity / totalQuantity) * 100);
};

/**
 * Calculate payment percentage
 */
export const calculatePaymentPercentage = (totalAmount: number, paidAmount: number): number => {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
};
