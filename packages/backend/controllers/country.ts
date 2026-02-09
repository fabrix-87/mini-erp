import { Response } from "express";
import asyncHandler from "../middleware/async-handler";
import { AuthenticatedValidatedRequest } from "../types/validate";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../config/prisma-client";
import { formatPaginatedResponse } from "../utils/response";
import { CountryCodeParam, CountryQueryInput } from "@mini-erp/shared";


/**
 * @desc    Lista tutti i Paesi con filtri
 * @route   GET /api/country
 * @access  Private/Admin
 */
export const getAllCountries = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const {
      limit = 10,
      page = 1,
      isEU,
      search,
    } = req.validatedQuery as CountryQueryInput;

    const where: Prisma.CountryWhereInput = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (isEU !== undefined) {
      where.isEU = isEU === "true";
    }

    // Configurazione paginazione
    const skip = (page - 1) * limit;

    const [countries, totalCount] = await Promise.all([
      prisma.country.findMany({
        where,
        select: {
          code: true,
          name: true,
          isEU: true,
        },
        orderBy: { ["code"]: "asc" },
        skip,
        take: limit,
      }),
      prisma.country.count({ where }),
    ]);

    res.json(formatPaginatedResponse(countries, totalCount, page, limit));
  }
);

export const getCountryByCode = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const { code } = req.validatedParams as CountryCodeParam;

    const country = await prisma.country.findUnique({
      where: { code },
      include: {
        languages: true
      }
    });

    if (!country) {
      res.status(404).json({ status: "failed", message: "Country non trovato" });
      return;
    }

    res.json({ status: "success", data: country });
  }
);
