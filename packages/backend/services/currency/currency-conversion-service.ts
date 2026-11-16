import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma-config";
import type { Prisma } from "../../generated/prisma/client";
import { BadRequestError, InternalServerError, NotFoundError } from "../../utils/app-error-utils";

type CurrencyConversionClient = Pick<
  Prisma.TransactionClient,
  "currency" | "currencyCurrentRate" | "exchangeRateHistory"
>;

export interface ConvertCurrencyInput {
  amount: Decimal | string;
  fromCode: string;
  toCode: string;
  date?: Date;
}

interface ConversionCurrency {
  id: number;
  code: string;
  isBaseCurrency: boolean;
}

/**
 * Resolves a currency rate relative to the system base currency.
 *
 * Historical requests never fall back to current rates.
 */
async function resolveExchangeRate(
  currency: ConversionCurrency,
  db: CurrencyConversionClient,
  date?: Date,
): Promise<Decimal> {
  if (currency.isBaseCurrency) {
    return new Decimal(1);
  }

  const record =
    date !== undefined
      ? await db.exchangeRateHistory.findFirst({
          where: {
            currencyId: currency.id,
            effectiveAt: { lte: date },
          },
          orderBy: { effectiveAt: "desc" },
          select: { rate: true },
        })
      : await db.currencyCurrentRate.findUnique({
          where: {
            currencyId: currency.id,
          },
          select: { rate: true },
        });

  if (!record) {
    const context = date !== undefined ? `alla data ${date.toISOString()}` : "corrente";

    throw new NotFoundError(`Tasso di cambio ${context} non disponibile per ${currency.code}`);
  }

  if (!record.rate.isFinite() || !record.rate.gt(0)) {
    throw new InternalServerError(`Tasso di cambio non valido per ${currency.code}`);
  }

  return record.rate;
}

/**
 * Converts an amount between currencies through the system base currency.
 *
 * Both historical rates are resolved at or before the requested instant.
 * The base currency has an implicit rate of one.
 * No currency-specific rounding is applied.
 *
 * @param input - Amount, currency codes, and optional historical instant.
 * @param db - Prisma client or an existing transaction client.
 * @returns The converted amount as a Decimal.
 * @throws {BadRequestError} If the amount, codes, or date are invalid.
 * @throws {NotFoundError} If a currency or required rate is missing.
 * @throws {InternalServerError} If a stored rate or result is invalid.
 */
export async function convertCurrency(
  { amount, fromCode, toCode, date }: ConvertCurrencyInput,
  db: CurrencyConversionClient = prisma,
): Promise<Decimal> {
  let decimalAmount: Decimal;

  try {
    decimalAmount = new Decimal(amount);
  } catch {
    throw new BadRequestError("Importo non valido");
  }

  if (!decimalAmount.isFinite()) {
    throw new BadRequestError("L'importo deve essere finito");
  }

  if (date !== undefined && !Number.isFinite(date.getTime())) {
    throw new BadRequestError("Data di conversione non valida");
  }

  const sourceCode = fromCode.trim().toUpperCase();
  const targetCode = toCode.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(sourceCode) || !/^[A-Z]{3}$/.test(targetCode)) {
    throw new BadRequestError("Codice valuta non valido");
  }

  const currencies = await db.currency.findMany({
    where: {
      code: {
        in: [...new Set([sourceCode, targetCode])],
      },
    },
    select: {
      id: true,
      code: true,
      isBaseCurrency: true,
    },
  });

  const from = currencies.find((currency) => currency.code === sourceCode);
  const to = currencies.find((currency) => currency.code === targetCode);

  if (!from) {
    throw new NotFoundError(`Valuta non trovata: ${sourceCode}`);
  }

  if (!to) {
    throw new NotFoundError(`Valuta non trovata: ${targetCode}`);
  }

  if (from.id === to.id) {
    return decimalAmount;
  }

  const [fromRate, toRate] = await Promise.all([
    resolveExchangeRate(from, db, date),
    resolveExchangeRate(to, db, date),
  ]);

  const convertedAmount = decimalAmount.div(fromRate).mul(toRate);

  if (!convertedAmount.isFinite()) {
    throw new InternalServerError("Risultato della conversione non valido");
  }

  return convertedAmount;
}
