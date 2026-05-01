import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { Currency, CurrencyQueryInput, PaginatedResponse } from "@mini-erp/shared";
import { formatPaginatedResponse } from "@/utils/response-utils";
import { buildCacheKey, getCache, setCache } from "@/utils/cache-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedQuery } from "@/helpers/validated-context";

/**
 * @desc    Lista tutte le valute con filtri
 * @route   GET /api/currencies
 * @access  Private/Admin
 */
export const getAllCurrencies = async (c: Context<AppBindings>) => {
  const { limit = 100, page = 1, search, active } = getValidatedQuery<CurrencyQueryInput>(c);

  const languageId = c.get("user")!.preferredLanguageId;

  if (!languageId) {
    throw new Error("User language not defined");
  }

  const safeLimit = Math.min(limit, 200);
  const safePage = Math.max(page, 1);

  const where: Prisma.CurrencyWhereInput = {
    ...(active !== undefined && { active }),
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
      orderBy: { priority: "asc" },
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
