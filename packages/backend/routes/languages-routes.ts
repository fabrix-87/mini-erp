import { getAllLanguages } from "@/controllers/language-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "@/middleware/auth-middleware";
import { validateLanguageQuery } from "@/validators/language-validator";

const languageRoutes = createHonoApp();

/**
 * @route  GET /api/languages
 * @access Private (language:read)
 */
languageRoutes.get(
  "/",
  authorize(["language:read", "language:manage"]),
  validateLanguageQuery,
  getAllLanguages,
);

export default languageRoutes;
