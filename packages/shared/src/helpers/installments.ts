import Decimal from "decimal.js";

/**
 * Calculates the total sum of all installment amounts.
 *
 * @param {Array<{ amount: Decimal.Value }>} installments - An array of installment objects containing an amount.
 * @returns {Decimal} The total sum of the installments as a Decimal instance.
 *
 * @example
 * const total = calculateInstallmentTotal([{ amount: "100.50" }, { amount: 200 }]); // Returns Decimal(300.5)
 */
export const calculateInstallmentTotal = (
  installments: Array<{ amount: Decimal.Value }>,
): Decimal => {
  return installments.reduce((sum, inst) => sum.plus(inst.amount), new Decimal(0));
};

/**
 * Generates a unique payment reference string using the document number and installment number.
 *
 * @param {string} documentNumber - The associated document number (e.g., "INV/2026/0001").
 * @param {number} installmentNumber - The sequential number of the installment.
 * @returns {string} The unique payment reference in the format `documentNumber/R{installmentNumber}`.
 *
 * @example
 * const ref = generatePaymentReference("INV/2026/0001", 2); // Returns "INV/2026/0001/R2"
 */
export const generatePaymentReference = (
  documentNumber: string,
  installmentNumber: number,
): string => {
  return `${documentNumber}/R${installmentNumber}`;
};
