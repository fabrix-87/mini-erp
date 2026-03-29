import { getAllLanguages } from "@/controllers/language";
import { authenticateToken, authorize } from "@/middleware/auth";
import express from "express";

const router = express.Router();

/**
 * @route  GET /api/languages
 * @access Private (language:read)
 */
router.get(
  "/",
  authenticateToken,
  authorize(["language:read", "language:manage"]),
  getAllLanguages
);

export default router;
