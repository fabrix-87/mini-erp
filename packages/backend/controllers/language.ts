import { prisma } from "@/config/prisma-client";
import { Prisma } from "@/generated/prisma/client";
import asyncHandler from "@/middleware/async-handler";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import { sendSuccess } from "@/utils/response";
import { Response } from "express";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Selezione standard per Role con relazioni
 */
export const languageSelect = {
  id: true,
  name: true,
  iso_code: true,
  language_code: true,
} satisfies Prisma.LanguageSelect;

// ============================================================================
// LANGUAGE - CRUD Operations
// ============================================================================

/**
 * @desc    Lista tutte le lingue
 * @route   GET /api/languages
 * @access  Private (language:read)
 */
export const getAllLanguages = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const [languages, total] = await Promise.all([
      prisma.language.findMany({
        select: languageSelect,
      }),
      prisma.language.count(),
    ]);

    sendSuccess(res, languages);
  },
);
