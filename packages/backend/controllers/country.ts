import { Response } from "express";
import asyncHandler from "../middleware/async-handler-middleware";
import { AuthenticatedValidatedRequest } from "../types/validate-types";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma-config";
import { formatPaginatedResponse, sendFail, sendSuccess } from "../utils/response-utils";
import {
  Country,
  CountryCodeParam,
  CountryQueryInput,
  PaginatedResponse,
} from "@mini-erp/shared";
import { buildCacheKey, getCache, setCache } from "@/utils/cache";

/**
 * @desc    Lista tutti i Paesi con filtri
 * @route   GET /api/country
 * @access  Private/Admin
 */
export const getAllCountries = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const {
      limit = 10,
      page = 1,
      isEU,
      search,
    } = req.validatedQuery as CountryQueryInput;

    const languageId = req.user?.preferredLanguageId;

    if (!languageId) {
      throw new Error("User language not defined");
    }

    const safeLimit = Math.min(limit, 200);
    const safePage = Math.max(page, 1);

    const where: Prisma.CountryWhereInput = {
      ...(isEU !== undefined && { isEU }),
      ...(search && {
        OR: [
          { code: { contains: search, mode: "insensitive" } },
          { name: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const cacheKey = buildCacheKey("countries", {
      where,
      safePage,
      safeLimit,
      languageId,
    });

    // Try cache
    const cached = await getCache<PaginatedResponse<Country>>(cacheKey);

    if (cached) {
      res.json(cached);
      return;
    }

    const [countries, totalCount] = await prisma.$transaction([
      prisma.country.findMany({
        where,
        orderBy: { code: "asc" },
        skip: (safePage - 1) * safeLimit,
        take: safeLimit,
      }),
      prisma.country.count({ where }),
    ]);

    const response = formatPaginatedResponse(
      countries,
      totalCount,
      page,
      limit,
    );

    await setCache(cacheKey, response, { ttl: 600 });

    res.json(response);
  },
);

export const getCountryByCode = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { code } = req.validatedParams as CountryCodeParam;

    const cacheKey = buildCacheKey("countries", { code });

    // Try cache
    const cached = await getCache<Country>(cacheKey);

    if (cached) {
      sendSuccess(res, cached);
      return;
    }

    const country = await prisma.country.findUnique({
      where: { code },
      include: {
        languages: {
          select: {
            name: true,
            iso_code: true,
            language_code: true,
          }
        },
      },
    });

    if (!country) {
      sendFail(res, { statusCode: 404, message: "Country non trovato"});
      return;
    }

    await setCache(cacheKey, country, { ttl: 600 });

    sendSuccess(res, country);
  },
);
