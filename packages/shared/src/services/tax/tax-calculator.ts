import Decimal from "decimal.js";
import { TaxCalculationInput, TaxCalculationResult } from "../../types";

/**
 * Calculates tax amounts based on net amount and tax rule
 * @param input - Tax calculation input with net amount and tax rule
 * @returns Complete tax calculation breakdown
 */
export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { netAmount, taxRule, quantity } = input;
  
  // Calculate base net amount (if quantity is provided)
  const baseNetAmount = quantity 
    ? netAmount.mul(quantity) 
    : netAmount;
  
  // Get tax rate from rule
  const taxRate = new Decimal(taxRule.rate ?? 0);
  
  // Calculate tax amount
  const taxAmount = baseNetAmount.mul(taxRate).div(100);
  
  // Calculate gross amount
  const grossAmount = baseNetAmount.add(taxAmount);
  
  // Get deductibility percentage
  const deductibilityPercent = new Decimal(taxRule.deductibilityPercent ?? 0);
  
  return {
    netAmount: baseNetAmount,
    taxRate,
    taxAmount,
    grossAmount,
    vatNatureCode: taxRule.vatNature?.code ?? null,
    normativeReference: taxRule.normativeReference ?? null,
    vatDeductible: taxRule.vatDeductible,
    deductibilityPercent,
    isSplitPayment: taxRule.isSplitPayment,
  };
}

/**
 * Calculates tax with deductibility applied
 * Returns deductible and non-deductible portions
 */
export function calculateTaxWithDeductibility(
  input: TaxCalculationInput,
): TaxCalculationResult & {
  deductibleTaxAmount: Decimal;
  nonDeductibleTaxAmount: Decimal;
} {
  const result = calculateTax(input);
  
  // Calculate deductible portion
  const deductibleTaxAmount = result.taxAmount
    .mul(result.deductibilityPercent)
    .div(100);
  
  // Calculate non-deductible portion
  const nonDeductibleTaxAmount = result.taxAmount.minus(deductibleTaxAmount);
  
  return {
    ...result,
    deductibleTaxAmount,
    nonDeductibleTaxAmount,
  };
}

/**
 * Calculates reverse tax (from gross to net)
 * Useful for user input where gross amount is known
 */
export function calculateReverseTax(
  grossAmount: Decimal,
  taxRule: TaxCalculationInput["taxRule"],
): TaxCalculationResult {
  const taxRate = new Decimal(taxRule.rate ?? 0);
  
  // Calculate net amount: gross / (1 + rate/100)
  const netAmount = grossAmount.div(
    new Decimal(1).add(taxRate.div(100))
  );
  
  // Calculate tax amount
  const taxAmount = grossAmount.minus(netAmount);
  
  const deductibilityPercent = new Decimal(taxRule.deductibilityPercent ?? 0);
  
  return {
    netAmount,
    taxRate,
    taxAmount,
    grossAmount,
    vatNatureCode: taxRule.vatNature?.code ?? null,
    normativeReference: taxRule.normativeReference ?? null,
    vatDeductible: taxRule.vatDeductible,
    deductibilityPercent,
    isSplitPayment: taxRule.isSplitPayment,
  };
}

/**
 * Validates if tax calculation is correct according to tax rule
 * Useful for validating external data or imports
 */
export function validateTaxCalculation(
  netAmount: Decimal,
  taxAmount: Decimal,
  grossAmount: Decimal,
  taxRule: TaxCalculationInput["taxRule"],
  tolerance: Decimal = new Decimal(0.01),
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Calculate expected values
  const expected = calculateTax({ netAmount, taxRule });
  
  // Validate tax amount
  if (expected.taxAmount.minus(taxAmount).abs().greaterThan(tolerance)) {
    errors.push(
      `Importo IVA non corretto. Atteso: ${expected.taxAmount.toFixed(2)}, Ricevuto: ${taxAmount.toFixed(2)}`
    );
  }
  
  // Validate gross amount
  if (expected.grossAmount.minus(grossAmount).abs().greaterThan(tolerance)) {
    errors.push(
      `Importo lordo non corretto. Atteso: ${expected.grossAmount.toFixed(2)}, Ricevuto: ${grossAmount.toFixed(2)}`
    );
  }
  
  // Validate that VAT nature is set if rate is 0
  if (taxRule.rate?.equals(0) && !taxRule.vatNature) {
    errors.push("Natura IVA obbligatoria per aliquota 0%");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Checks if a tax rule is valid for a specific date
 */
export function isTaxRuleValidForDate(
  taxRule: TaxCalculationInput["taxRule"],
  date: Date = new Date(),
): boolean {
  const checkDate = date.getTime();
  
  // Check validFrom
  if (taxRule.validFrom && new Date(taxRule.validFrom).getTime() > checkDate) {
    return false;
  }
  
  // Check validTo
  if (taxRule.validTo && new Date(taxRule.validTo).getTime() < checkDate) {
    return false;
  }
  
  return taxRule.active;
}

/**
 * Gets the effective tax rate considering deductibility
 * Returns the actual tax cost percentage
 */
export function getEffectiveTaxRate(
  taxRule: TaxCalculationInput["taxRule"],
): Decimal {
  const taxRate = new Decimal(taxRule.rate ?? 0);
  
  if (!taxRule.vatDeductible) {
    return taxRate;
  }
  
  // Effective rate = rate * (100 - deductibility) / 100
  const deductibilityPercent = new Decimal(taxRule.deductibilityPercent ?? 0);
  const nonDeductiblePercent = new Decimal(100).minus(deductibilityPercent);
  
  return taxRate.mul(nonDeductiblePercent).div(100);
}
