// utils/currency.utils.ts

import { prisma } from "@/config/prisma-client";
import { Currency } from "@/generated/prisma/client";

/**
 * Converte importo da una valuta all'altra
 */
export async function convertCurrency(
  amount: number,
  fromCode: string,
  toCode: string,
  date?: Date
): Promise<number> {
  
  if (fromCode === toCode) {
    return amount;
  }

  // Recupera valute
  const [from, to] = await Promise.all([
    prisma.currency.findUnique({ where: { code: fromCode } }),
    prisma.currency.findUnique({ where: { code: toCode } }),
  ]);

  if (!from || !to) {
    throw new Error(`Currency not found: ${fromCode} or ${toCode}`);
  }

  // Se richiesta data storica, cerca nel history
  if (date) {
    const history = await prisma.exchangeRateHistory.findFirst({
      where: {
        currencyId: from.id,
        date: { lte: date },
      },
      orderBy: { date: 'desc' },
    });
    
    if (history) {
      // Converti via base currency: amount → EUR → target
      const inBaseCurrency = amount / Number(history.rate);
      return inBaseCurrency * Number(to.exchangeRate);
    }
  }

  // Usa tasso corrente
  // Converti via base currency: amount → EUR → target
  const inBaseCurrency = amount / Number(from.exchangeRate);
  return inBaseCurrency * Number(to.exchangeRate);
}

/**
 * Formatta importo secondo regole valuta
 */
export function formatCurrency(
  amount: number,
  currency: Currency
): string {
  
  // Arrotonda secondo regole valuta
  const rounded = Math.round(amount / Number(currency.rounding)) * Number(currency.rounding);
  
  // Formatta con decimali
  const formatted = rounded.toFixed(currency.decimalDigits)
    .replace('.', currency.decimalSeparator);
  
  // Aggiungi separatore migliaia
  const parts = formatted.split(currency.decimalSeparator);
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandSeparator);
  
  const number = parts.join(currency.decimalSeparator);
  
  // Aggiungi simbolo
  return currency.symbolPosition === 'before'
    ? `${currency.symbol} ${number}`
    : `${number} ${currency.symbol}`;
}

/**
 * Aggiorna tassi di cambio (da chiamare periodicamente)
 */
export async function updateExchangeRates(
  source: 'ECB' | 'manual' = 'ECB'
): Promise<void> {
  
  // TODO: Implementare chiamata API esterna (es. ECB, OpenExchangeRates)
  // Per ora esempio con tassi fissi
  
  const rates: Record<string, number> = {
    USD: 1.08,
    CHF: 0.95,
    GBP: 0.85,
    JPY: 160.0,
  };
  
  for (const [code, rate] of Object.entries(rates)) {
    const currency = await prisma.currency.findUnique({
      where: { code },
    });
    
    if (!currency) continue;
    
    // Aggiorna tasso corrente
    await prisma.currency.update({
      where: { id: currency.id },
      data: {
        exchangeRate: rate,
        exchangeRateUpdated: new Date(),
        exchangeRateSource: source,
      },
    });
    
    // Salva in storico
    await prisma.exchangeRateHistory.create({
      data: {
        currencyId: currency.id,
        rate,
        date: new Date(),
        source,
      },
    });
  }
}
