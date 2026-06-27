import { createHonoApp } from "../lib/hono-app";

import {
  loginRateLimiter,
  passwordResetRateLimiter,
  refreshTokenRateLimiter,
} from "@/middleware/rate-limit-middleware";

import {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/auth-controller";

import {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
} from "../validators/auth-validator";
import { authenticateToken } from "@/middleware/auth-middleware";

const authRoutes = createHonoApp();

// ============================================================================
// PUBLIC ROUTES - Authentication
// ============================================================================

/**
 * @route   POST /api/users/login
 * @desc    Login utente
 * @access  Public
 */
authRoutes.post("/login", loginRateLimiter, validateLogin, login);

/**
 * @route   POST /api/users/logout
 * @desc    Logout utente (invalidazione token)
 * @access  Public
 */
authRoutes.post("/logout", authenticateToken, logout);

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token usando refresh token
 * @access  Public
 */
authRoutes.post("/refresh-token", authenticateToken, refreshTokenRateLimiter, refreshToken);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Richiesta reset password (invia email)
 * @access  Public
 */
authRoutes.post(
  "/forgot-password",
  passwordResetRateLimiter,
  validateForgotPassword,
  forgotPassword,
);

/**
 * @route   POST /api/users/reset-password
 * @desc    Reset password con token ricevuto via email
 * @access  Public
 */
authRoutes.post("/reset-password", validateResetPassword, resetPassword);

/**
 * @route   GET /api/users/verify-email/:token
 * @desc    Verifica email utente
 * @access  Public
 */
authRoutes.get("/verify-email/:token", validateVerifyEmail, verifyEmail);

export default authRoutes;
