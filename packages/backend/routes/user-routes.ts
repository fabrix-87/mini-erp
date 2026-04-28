import { createHonoApp } from "../lib/hono-app";
import { authMiddleware } from "../middleware/auth-middleware";

const userRoutes = createHonoApp();

/**
 * Returns the current authenticated user context.
 */
userRoutes.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");

  return c.json({
    success: true,
    data: user,
  });
});

export default userRoutes;