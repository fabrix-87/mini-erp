import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createHonoApp } from "../lib/hono-app";

const authRoutes = createHonoApp();

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

/**
 * Temporary login route used to validate the new Hono routing structure.
 */
authRoutes.post("/login", zValidator("json", loginSchema), async (c) => {
  const payload = c.req.valid("json");

  return c.json({
    success: true,
    message: "Auth route migrated to Hono structure",
    data: {
      email: payload.email,
    },
  });
});

export default authRoutes;