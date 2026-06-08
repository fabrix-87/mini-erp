import { prisma } from "@/config/prisma-config";
import { Prisma } from "@/generated/prisma/client";
import { AppBindings } from "@/lib/hono-app";
import { sendSuccess } from "@/utils/response-utils";
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
  const [languages, total] = await Promise.all([
    prisma.language.findMany({
      select: languageSelect,
    }),
    prisma.language.count(),
  ]);

  return sendSuccess(c, languages, {
    results: total,
  });
};
