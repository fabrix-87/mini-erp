import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import asyncHandler from "@/middleware/async-handler";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import { sendSuccess } from "@/utils/response";
import { CurrencyQueryInput } from "@mini-erp/shared";
import { Response } from "express";

/**
 * @desc    Lista tutte le valute con filtri
 * @route   GET /api/currencies
 * @access  Private/Admin
 */
export const getAllCurrencies = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response) => {
    const {
      limit = 100,
      page = 1,
      search,
    } = req.validatedQuery as CurrencyQueryInput;

    const languageId = req.user!.preferredLanguageId;

    const where: any[] = [
      { active: true }, // Solo valute attive
    ];

    if (search) {
      where.push({
        OR: [
          {
            code: { contains: search, mode: "insensitive" },
          },
          {
            symbol: { contains: search, mode: "insensitive" },
          },
          {
            translations: {
              some: {
                AND: [
                  { languageId },
                  {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        namePlural: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      });
    }

    const currencies = await prisma.currency.findMany({
      where: {
        AND: where,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { priority: "asc" },
      include: {
        translations: {
          select: {
            name: true,
            namePlural: true,
          },
          where: {
            languageId: languageId,
          },
        },
      },
    });

    sendSuccess(res, currencies);
  },
);
