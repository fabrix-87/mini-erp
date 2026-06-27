import { getAllLanguages } from "@/controllers/language-controller";
import { createHonoApp } from "@/lib/hono-app";
import { authorize } from "@/middleware/auth-middleware";

const languageRoutes = createHonoApp();

/**
 * @route  GET /api/languages
 * @access Private (language:read)
 */
languageRoutes.get(
  "/",
  authorize(["language:read", "language:manage"]),
  getAllLanguages,
);

export default languageRoutes;
