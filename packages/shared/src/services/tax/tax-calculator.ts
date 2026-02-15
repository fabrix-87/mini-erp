import { TaxCalculationInput, TaxCalculationResult } from "../../types";


function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
  const { netAmount, taxRule } = input;
  
  const taxRate = taxRule.rate; // 22.00
  const taxAmount = netAmount.mul(taxRate).div(100); // netAmount * 22 / 100
  const grossAmount = netAmount.add(taxAmount);

  return {
    netAmount,
    taxRate,
    taxAmount,
    grossAmount,
    vatNatureCode: taxRule.vatNatureCode,
  };
}