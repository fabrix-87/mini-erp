import { Decimal } from "@prisma/client/runtime/client";
import { prisma } from "../../config/prisma-config";
import { Prisma } from "../../generated/prisma/client";
import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../utils/app-error-utils";

export interface UpdateExchangeRatesInput {
  source: "ECB" | "manual";
  baseCode: string;
  effectiveAt: Date;
  batchKey: string;
  rates: Readonly<Record<string, string | Decimal>>;
}

export interface UpdateExchangeRatesResult {
  batchKey: string;
  effectiveAt: Date;
  historyCreated: number;
  currentUpdated: number;
  unchanged: number;
}

/**
 * Validates and normalizes an ISO 4217 currency code.
 */
function normalizeCurrencyCode(code: string): string {
  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new BadRequestError(`Codice valuta non valido: ${code}`);
  }

  return normalized;
}

/**
 * Validates a rate against the Decimal(18, 8) database representation.
 */
function parseExchangeRate(value: string | Decimal, code: string): Decimal {
  let rate: Decimal;

  try {
    rate = new Decimal(value);
  } catch {
    throw new BadRequestError(`Tasso non valido per ${code}`);
  }

  if (!rate.isFinite() || !rate.gt(0) || rate.gte("10000000000") || rate.decimalPlaces() > 8) {
    throw new BadRequestError(
      `Il tasso per ${code} deve essere positivo e compatibile con Decimal(18, 8)`,
    );
  }

  return rate;
}

/**
 * Persists an exchange-rate batch relative to the system base currency.
 *
 * Historical observations are immutable through this service.
 * Reimporting the same fixing with the same rate and source is idempotent.
 * Older observations never replace newer current rates.
 *
 * @param input - Provider source, base currency, fixing instant, and rates.
 * @returns Counts of created historical rates and updated current rates.
 * @throws {BadRequestError} If the batch or its rates are invalid.
 * @throws {NotFoundError} If a referenced currency does not exist.
 * @throws {ConflictError} If the batch conflicts with stored observations.
 * @throws {InternalServerError} If the system base currency is missing.
 */
export async function updateExchangeRates(
  input: UpdateExchangeRatesInput,
): Promise<UpdateExchangeRatesResult> {
  const baseCode = normalizeCurrencyCode(input.baseCode);
  const batchKey = input.batchKey.trim();
  const effectiveAt = new Date(input.effectiveAt.getTime());

  if (!Number.isFinite(effectiveAt.getTime()) || effectiveAt.getTime() > Date.now()) {
    throw new BadRequestError("La data effettiva deve essere valida e non futura");
  }

  if (!batchKey || batchKey.length > 100) {
    throw new BadRequestError("Il batchKey deve contenere da 1 a 100 caratteri");
  }

  const rates = new Map<string, Decimal>();

  for (const [rawCode, value] of Object.entries(input.rates)) {
    const code = normalizeCurrencyCode(rawCode);

    if (rates.has(code)) {
      throw new BadRequestError(`Valuta duplicata nel batch: ${code}`);
    }

    const rate = parseExchangeRate(value, code);

    if (code === baseCode) {
      if (!rate.eq(1)) {
        throw new BadRequestError("Il tasso della valuta base deve essere uguale a 1");
      }

      continue;
    }

    rates.set(code, rate);
  }

  if (rates.size === 0) {
    throw new BadRequestError("Il batch deve contenere almeno una valuta diversa dalla base");
  }

  return prisma.$transaction(
    async (tx) => {
      const baseCurrency = await tx.currency.findFirst({
        where: {
          isBaseCurrency: true,
        },
        select: {
          code: true,
        },
      });

      if (!baseCurrency) {
        throw new InternalServerError("Valuta base del sistema non configurata");
      }

      if (baseCurrency.code !== baseCode) {
        throw new BadRequestError(
          `Base del batch ${baseCode} diversa dalla base del sistema ${baseCurrency.code}`,
        );
      }

      const currencies = await tx.currency.findMany({
        where: {
          code: {
            in: [...rates.keys()],
          },
        },
        select: {
          id: true,
          code: true,
        },
      });

      const currenciesByCode = new Map(currencies.map((currency) => [currency.code, currency]));

      const result: UpdateExchangeRatesResult = {
        batchKey,
        effectiveAt,
        historyCreated: 0,
        currentUpdated: 0,
        unchanged: 0,
      };

      for (const [code, rate] of rates) {
        const currency = currenciesByCode.get(code);

        if (!currency) {
          throw new NotFoundError(`Valuta non trovata: ${code}`);
        }

        const history = await tx.exchangeRateHistory.findUnique({
          where: {
            currencyId_effectiveAt: {
              currencyId: currency.id,
              effectiveAt,
            },
          },
          select: {
            rate: true,
            source: true,
          },
        });

        if (history) {
          if (!history.rate.eq(rate) || history.source !== input.source) {
            throw new ConflictError(
              `Esiste già un fixing differente per ${code} alla data ${effectiveAt.toISOString()}`,
            );
          }
        } else {
          await tx.exchangeRateHistory.create({
            data: {
              currencyId: currency.id,
              rate,
              effectiveAt,
              source: input.source,
              batchKey,
            } satisfies Prisma.ExchangeRateHistoryUncheckedCreateInput,
          });

          result.historyCreated += 1;
        }

        const current = await tx.currencyCurrentRate.findUnique({
          where: {
            currencyId: currency.id,
          },
          select: {
            effectiveAt: true,
            rate: true,
            source: true,
          },
        });

        if (
          current &&
          current.effectiveAt.getTime() === effectiveAt.getTime() &&
          (!current.rate.eq(rate) || current.source !== input.source)
        ) {
          throw new ConflictError(
            `Il cambio corrente di ${code} contiene un fixing differente alla stessa data`,
          );
        }

        if (current && current.effectiveAt.getTime() >= effectiveAt.getTime()) {
          result.unchanged += 1;
          continue;
        }

        await tx.currencyCurrentRate.upsert({
          where: {
            currencyId: currency.id,
          },
          create: {
            currencyId: currency.id,
            rate,
            effectiveAt,
            source: input.source,
          } satisfies Prisma.CurrencyCurrentRateUncheckedCreateInput,
          update: {
            rate,
            effectiveAt,
            source: input.source,
          } satisfies Prisma.CurrencyCurrentRateUpdateInput,
        });

        result.currentUpdated += 1;
      }

      return result;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}
