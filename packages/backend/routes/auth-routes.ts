import { createHonoApp } from "../lib/hono-app";

import {
  loginRateLimiter,
  passwordResetRateLimiter,
  refreshTokenRateLimiter,
  registerRateLimiter,
} from "@/middleware/rate-limit-middleware";

import {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/user-controller";

import {
  validateRegisterUser,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from "../validators/user-validator";
import { authenticateToken } from "@/middleware/auth-middleware";

const authRoutes = createHonoApp();

// ============================================================================
// PUBLIC ROUTES - Authentication
// ============================================================================

/**
 * @route   POST /api/users/register
 * @desc    Registra nuovo utente (pubblico)
 * @access  Public
 */
authRoutes.post("/register", registerRateLimiter, validateRegisterUser, register);

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
authRoutes.post("/refresh-token", refreshTokenRateLimiter, refreshToken);

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
authRoutes.get("/verify-email/:token", verifyEmail);

export default authRoutes;
