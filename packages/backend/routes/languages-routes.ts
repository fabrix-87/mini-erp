import { getAllLanguages } from "@/controllers/language-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authenticateToken, authorize } from "@/middleware/auth-middleware";

const languageRoutes = createHonoApp();

/**
 * @route  GET /api/languages
 * @access Private (language:read)
 */
languageRoutes.get(
  "/",
  authenticateToken,
  authorize(["language:read", "language:manage"]),
  getAllLanguages,
);

export default languageRoutes;
