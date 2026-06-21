import {
  validateCreateUser,
  validateUpdateUserProfile,
  validateUpdateUserDetails,
  validateChangePassword,
  validateToggleUserStatus,
  validateUserId,
  validateUserQuery,
  validateUpdateUser,
} from "../validators/user-validator";
import {
  getAllUsers,
  getUserById,
  getMe,
  createUser,
  updateProfile,
  updateDetails,
  changePassword,
  toggleUserActive,
  deleteUser,
  updateUser,
} from "../controllers/user-controller";

import { createHonoApp } from "@/lib/hono-app";

import { authenticateToken, authorize } from "@/middleware/auth-middleware";

const userRoutes = createHonoApp();

// ============================================================================
// PRIVATE ROUTES - Current User (Authenticated)
// ============================================================================

/**
 * @route   GET /api/users/me
 * @desc    Ottieni info utente corrente
 * @access  Private
 */
userRoutes.get("/me", authenticateToken, getMe);

/**
 * @route   PUT /api/users/me/profile
 * @desc    Aggiorna profilo utente corrente (username, email, preferenze)
 * @access  Private
 */
userRoutes.put("/me/profile", authenticateToken, validateUpdateUserProfile, updateProfile);

/**
 * @route   PUT /api/users/me/details
 * @desc    Aggiorna dettagli personali utente corrente (nome, cognome, indirizzo, etc.)
 * @access  Private
 */
userRoutes.put("/me/details", authenticateToken, validateUpdateUserDetails, updateDetails);

/**
 * @route   PUT /api/users/me/change-password
 * @desc    Cambia password utente corrente
 * @access  Private
 */
userRoutes.put("/me/change-password", authenticateToken, validateChangePassword, changePassword);

// ============================================================================
// ADMIN ROUTES - User Management
// ============================================================================

/**
 * @route   GET /api/users
 * @desc    Lista tutti gli utenti con filtri e paginazione
 * @access  Private/Admin (user:read)
 * @query   page, limit, search, active, roleId, sortBy, sortOrder
 */
userRoutes.get(
  "/",
  authenticateToken,
  authorize(["user:read", "user:manage"]),
  validateUserQuery,
  getAllUsers,
);

/**
 * @route   GET /api/users/:id
 * @desc    Ottieni dettagli di un utente specifico
 * @access  Private/Admin (user:read)
 */
userRoutes.get(
  "/:id",
  authenticateToken,
  authorize(["user:read", "user:manage"]),
  validateUserId,
  getUserById,
);

/**
 * @route   POST /api/users
 * @desc    Crea un nuovo utente (solo Admin)
 * @access  Private/Admin (user:create)
 */
userRoutes.post(
  "/",
  authenticateToken,
  authorize(["user:create", "user:manage"]),
  validateCreateUser,
  createUser,
);

/**
 * @route   PUT /api/users/:id/profile
 * @desc    Aggiorna profilo di un utente (Admin)
 * @access  Private/Admin (user:update)
 */
userRoutes.put(
  "/:id/profile",
  authenticateToken,
  authorize(["user:update", "user:manage"]),
  validateUpdateUserProfile,
  updateProfile,
);

/**
 * @route   PUT /api/users/:id/details
 * @desc    Aggiorna dettagli di un utente (Admin)
 * @access  Private/Admin (user:update)
 */
userRoutes.put(
  "/:id/details",
  authenticateToken,
  authorize(["user:update", "user:manage"]),
  validateUserId,
  validateUpdateUserDetails,
  updateDetails,
);

/**
 * @route   PUT /api/users/:id
 * @desc    Aggiorna tutto l'utente (Admin)
 * @access  Private/Admin (user:update)
 */
userRoutes.put(
  "/:id",
  authenticateToken,
  authorize(["user:update", "user:manage"]),
  validateUserId,
  validateUpdateUser,
  updateUser,
);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Attiva/Disattiva un utente
 * @access  Private/Admin (user:manage)
 */
userRoutes.patch(
  "/:id/toggle-active",
  authenticateToken,
  authorize(["user:manage"]),
  validateUserId,
  validateToggleUserStatus,
  toggleUserActive,
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Elimina un utente (soft delete)
 * @access  Private/Admin (user:delete)
 */
userRoutes.delete(
  "/:id",
  authenticateToken,
  authorize(["user:delete", "user:manage"]),
  validateUserId,
  deleteUser,
);

// ============================================================================
// EXPORT
// ============================================================================

export default userRoutes;
