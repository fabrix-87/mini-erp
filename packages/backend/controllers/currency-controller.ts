import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import {
  Currency,
  CurrencyCodeParam,
  CurrencyQueryInput,
  PaginatedResponse,
} from "@mini-erp/shared";
import { formatPaginatedResponse, sendNotFound, sendSuccess } from "@/utils/response-utils";
import { buildCacheKey, getCache, setCache } from "@/utils/cache-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedParams, getValidatedQuery } from "@/helpers/validated-context";

/**
 * @desc    Lista tutte le valute con filtri
 * @route   GET /api/currencies
 * @access  Private/Admin
 */
export const getAllCurrencies = async (c: Context<AppBindings>) => {
  const {
    limit = 100,
    page = 1,
    search,
    active,
    isBaseCurrency,
    sortBy = "priority",
    sortOrder = "asc",
  } = getValidatedQuery<CurrencyQueryInput>(c);

  const languageId = c.get("user")!.preferredLanguageId;

  if (!languageId) {
    throw new Error("User language not defined");
  }

  const safeLimit = Math.min(limit, 200);
  const safePage = Math.max(page, 1);

  const where: Prisma.CurrencyWhereInput = {
    ...(active !== undefined && { active }),
    ...(isBaseCurrency !== undefined && { isBaseCurrency }),
    ...(search && {
      OR: [
        { code: { contains: search, mode: "insensitive" } },
        { symbol: { contains: search, mode: "insensitive" } },
        {
          translations: {
            some: {
              languageId,
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { namePlural: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    }),
  };

  const cacheKey = buildCacheKey("currencies", {
    where,
    safePage,
    safeLimit,
    languageId,
    sortBy,
    sortOrder,
  });

  // Try cache
  const cached = await getCache<PaginatedResponse<Currency>>(cacheKey);

  if (cached) {
    return c.json(cached);
  }

  // Query parallele
  const [currencies, total] = await prisma.$transaction([
    prisma.currency.findMany({
      where,
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        translations: {
          where: { languageId },
          select: {
            name: true,
            namePlural: true,
          },
        },
      },
    }),
    prisma.currency.count({ where }),
  ]);

  const response = formatPaginatedResponse(currencies, total, safePage, safeLimit);

  // Cache 10 minuti (valute sono semi-statiche)
  await setCache(cacheKey, response, { ttl: 600 });

  return c.json(response);
};

/**
 * @desc    Dettaglio della valuta
 * @route   GET /api/currencies/:code
 * @access  Private/Admin
 */
export const getCurrencyByCode = async (c: Context<AppBindings>) => {
  const { code } = getValidatedParams<CurrencyCodeParam>(c);

  const languageId = c.get("user")!.preferredLanguageId;

  if (!languageId) {
    throw new Error("User language not defined");
  }

  const currency = await prisma.currency.findUnique({
    where: { code },
    include: {
      translations: {
        where: { languageId },
        select: {
          name: true,
          namePlural: true,
          language: {
            select: { name: true }
          }
        },
      },
    },
  });

  if (!currency) return sendNotFound(c, "Valuta non trovata");

  return sendSuccess(c, currency);
};
