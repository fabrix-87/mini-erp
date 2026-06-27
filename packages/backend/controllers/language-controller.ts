import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { getValidatedQuery } from "@/helpers/validated-context";
import { AppBindings } from "@/lib/hono-app";
import { sendPaginatedResponse } from "@/utils/response-utils";
import { LanguageQueryInput } from "@mini-erp/shared";
import { Context } from "hono";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Selezione standard per language
 */
export const languageSelect = {
  id: true,
  name: true,
  isoCode: true,
  languageCode: true,
} satisfies Prisma.LanguageSelect;

// ============================================================================
// LANGUAGE - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutte le lingue
 * @route   GET /api/languages
 * @access  Private (language:read)
 */
export const getAllLanguages = async (c: Context<AppBindings>) => {
  const {
    search,
    page = 1,
    limit = 20,
    sortBy = "id",
    sortOrder = "asc",
  } = getValidatedQuery<LanguageQueryInput>(c);

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const take = limitNumber;

  const where: Prisma.LanguageWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { isoCode: { contains: search, mode: "insensitive" } },
      { languageCode: { contains: search, mode: "insensitive" } },
    ];
  }

  const [languages, total] = await Promise.all([
    prisma.language.findMany({
      where,
      select: languageSelect,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.language.count(),
  ]);

  return sendPaginatedResponse(c, languages, total, pageNumber, limitNumber);
};
