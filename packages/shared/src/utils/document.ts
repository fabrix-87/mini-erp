// ============================================================================
// DOCUMENT UTILITIES (SHARED)
// Pure utility functions without business logic or DB access
// Can be used in both frontend and backend
// ============================================================================

import Decimal from "decimal.js";

/**
 * Calculate discount from percentage
 */
export const calculateDiscount = (
  amount: number,
  discountPercent: number,
): number => {
  return (amount * discountPercent) / 100;
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
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = "EUR",
  locale: string = "it-IT",
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
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
 * Calculate line totals with discount and tax using Decimal for precision
 *
 * @param quantity - Line quantity
 * @param unitPrice - Unit price (can be number or Decimal)
 * @param discountPercent - Discount percentage (default 0)
 * @param taxPercent - Tax percentage (default 22)
 * @returns Object with calculated totals as numbers
 */
export const calculateLineTotals = (
  quantity: number | Decimal,
  unitPrice: number | Decimal,
  discountPercent: number | Decimal = 0,
  taxPercent: number | Decimal = 22,
) => {
  // Convert all inputs to Decimal for precision
  const qty = new Decimal(quantity);
  const price = new Decimal(unitPrice);
  const discountPct = new Decimal(discountPercent);
  const taxPct = new Decimal(taxPercent);

  // Calculate line subtotal
  const lineSubtotal = qty.mul(price);

  // Calculate discount amount
  const discountAmount = lineSubtotal.mul(discountPct).div(100);

  // Calculate line total after discount
  const lineTotal = lineSubtotal.sub(discountAmount);

  // Calculate tax amount
  const taxAmount = lineTotal.mul(taxPct).div(100);

  // Calculate line total with tax
  const lineTotalWithTax = lineTotal.add(taxAmount);

  // Return as numbers (Prisma expects Decimal fields as numbers or strings)
  return {
    lineSubtotal: lineSubtotal.toNumber(),
    lineTotal: lineTotal.toNumber(),
    discountAmount: discountAmount.toNumber(),
    taxAmount: taxAmount.toNumber(),
    lineTotalWithTax: lineTotalWithTax.toNumber(),
  };
};

/**
 * Calculate document totals from lines
 */
export const calculateDocumentTotals = (
  lines: Array<{
    lineTotal: number | string | Decimal;
    taxAmount: number | string | Decimal;
  }>,
  discountPercent: number | string | Decimal = 0,
  shippingCost: number | string | Decimal = 0,
  shippingTaxPercent: number | string | Decimal = 22,
) => {
  const subtotal = lines.reduce((sum, line) => {
    return sum.plus(new Decimal(line.lineTotal));
  }, new Decimal(0));

  const discountAmount = subtotal.mul(discountPercent).div(100);
  const taxableAmount = subtotal.minus(discountAmount);

  const taxAmount = lines.reduce((sum, line) => {
    return sum.plus(new Decimal(line.taxAmount));
  }, new Decimal(0));

  const shippingTaxAmount = new Decimal(shippingCost)
    .mul(shippingTaxPercent)
    .div(100);

  const totalAmount = taxableAmount
    .plus(taxAmount)
    .plus(shippingCost)
    .plus(shippingTaxAmount);

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    shippingTaxAmount,
    totalAmount,
  };
};

/**
 * Check if document is editable based on status
 */
export const isDocumentEditable = (status: string): boolean => {
  return ["DRAFT", "PENDING_APPROVAL"].includes(status);
};

/**
 * Check if document can be deleted
 */
export const isDocumentDeletable = (
  status: string,
  hasNumber: boolean,
): boolean => {
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
export const calculatePaymentPercentage = (
  totalAmount: number,
  paidAmount: number,
): number => {
  if (totalAmount === 0) return 0;
  return Math.round((paidAmount / totalAmount) * 100);
};
