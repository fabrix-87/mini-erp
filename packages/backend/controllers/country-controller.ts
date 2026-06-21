import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma-config";
import {
  formatPaginatedResponse,
  sendNotFound,
  sendSuccess,
} from "../utils/response-utils";
import { Country, CountryCodeParam, CountryQueryInput, PaginatedResponse } from "@mini-erp/shared";
import { buildCacheKey, getCache, setCache } from "@/utils/cache-utils";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import { getValidatedParams, getValidatedQuery } from "@/helpers/validated-context";

/**
 * @desc    Lista tutti i Paesi con filtri
 * @route   GET /api/country
 * @access  Private/Admin
 */
export const getAllCountries = async (c: Context<AppBindings>) => {
  const { limit = 10, page = 1, isEU, search } = getValidatedQuery<CountryQueryInput>(c);
/*
  const languageId = c.get("user")?.preferredLanguageId;

  if (!languageId) {
    throw new Error("User language not defined");
  }
*/
  const safeLimit = Math.min(limit, 200);
  const safePage = Math.max(page, 1);

  const where: Prisma.CountryWhereInput = {
    ...(isEU && isEU !== undefined && { isEU }),
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
    //languageId,
  });

  // Try cache
  const cached = await getCache<PaginatedResponse<Country>>(cacheKey);

  if (cached) {
    return c.json(cached);
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

  const response = formatPaginatedResponse(countries, totalCount, page, limit);

  await setCache(cacheKey, response, { ttl: 600 });

  return c.json(response);
};

export const getCountryByCode = async (c: Context<AppBindings>) => {
  const { code } = getValidatedParams<CountryCodeParam>(c);

  const cacheKey = buildCacheKey("countries", { code });

  // Try cache
  const cached = await getCache<Country>(cacheKey);

  if (cached) {
    return sendSuccess(c, cached);
  }

  const country = await prisma.country.findUnique({
    where: { code },
    include: {
      languages: {
        select: {
          name: true,
          iso_code: true,
          language_code: true,
        },
      },
    },
  });

  if (!country) {
    return sendNotFound(c, "Country non trovato");
  }

  await setCache(cacheKey, country, { ttl: 600 });

  return sendSuccess(c, country);
};
