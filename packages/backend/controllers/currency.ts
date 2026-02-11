import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import asyncHandler from "@/middleware/async-handler";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import {
  Currency,
  CurrencyQueryInput,
  PaginatedResponse,
} from "@mini-erp/shared";
import { formatPaginatedResponse } from "@/utils/response";
import { buildCacheKey, getCache, setCache } from "@/utils/cache";

/**
 * @desc    Lista tutte le valute con filtri
 * @route   GET /api/currencies
 * @access  Private/Admin
 */
export const getAllCurrencies = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const {
      limit = 100,
      page = 1,
      search,
      active,
    } = req.validatedQuery as CurrencyQueryInput;

    const languageId = req.user?.preferredLanguageId;

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
      res.json(cached);
      return;
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

    const response = formatPaginatedResponse(
      currencies,
      total,
      safePage,
      safeLimit,
    );

    // Cache 10 minuti (valute sono semi-statiche)
    await setCache(cacheKey, response, { ttl: 600 });

    res.json(response);
  },
);
