import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { 
  validateCreateUser,
  validateRegisterUser,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateUpdateUserProfile,
  validateUpdateUserDetails,
  validateChangePassword,
  validateUpdateUserRoles,
  validateToggleUserStatus,
  validateUserId,
  validateUserQuery,
} from '../validators/user';
import { 
  register, 
  login, 
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getAllUsers, 
  getUserById,
  getMe,
  createUser,
  updateProfile,
  updateDetails,
  changePassword,
  updateRole, 
  toggleUserActive,
  deleteUser,
} from '../controllers/user';

import {
  loginRateLimiter,
  registerRateLimiter,
  refreshTokenRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/redis-rate-limit';

const router = express.Router();

// ============================================================================
// PUBLIC ROUTES - Authentication
// ============================================================================

/**
 * @route   POST /api/users/register
 * @desc    Registra nuovo utente (pubblico)
 * @access  Public
 */
router.post('/register', registerRateLimiter, validateRegisterUser, register);

/**
 * @route   POST /api/users/login
 * @desc    Login utente
 * @access  Public
 */
router.post('/login', loginRateLimiter, validateLogin, login);

/**
 * @route   POST /api/users/logout
 * @desc    Logout utente (invalidazione token)
 * @access  Public
 */
router.post('/logout', authenticateToken, logout);

/**
 * @route   POST /api/users/refresh-token
 * @desc    Refresh access token usando refresh token
 * @access  Public
 */
router.post('/refresh-token', refreshTokenRateLimiter, refreshToken);

/**
 * @route   POST /api/users/forgot-password
 * @desc    Richiesta reset password (invia email)
 * @access  Public
 */
router.post('/forgot-password', passwordResetRateLimiter, validateForgotPassword, forgotPassword);

/**
 * @route   POST /api/users/reset-password
 * @desc    Reset password con token ricevuto via email
 * @access  Public
 */
router.post('/reset-password', validateResetPassword, resetPassword);

/**
 * @route   GET /api/users/verify-email/:token
 * @desc    Verifica email utente
 * @access  Public
 */
router.get('/verify-email/:token', verifyEmail);

// ============================================================================
// PRIVATE ROUTES - Current User (Authenticated)
// ============================================================================

/**
 * @route   GET /api/users/me
 * @desc    Ottieni info utente corrente
 * @access  Private
 */
router.get('/me', authenticateToken, getMe);

/**
 * @route   PUT /api/users/me/profile
 * @desc    Aggiorna profilo utente corrente (username, email, preferenze)
 * @access  Private
 */
router.put('/me/profile', authenticateToken, validateUpdateUserProfile, updateProfile);

/**
 * @route   PUT /api/users/me/details
 * @desc    Aggiorna dettagli personali utente corrente (nome, cognome, indirizzo, etc.)
 * @access  Private
 */
router.put('/me/details', authenticateToken, validateUpdateUserDetails, updateDetails);

/**
 * @route   PUT /api/users/me/change-password
 * @desc    Cambia password utente corrente
 * @access  Private
 */
router.put('/me/change-password', authenticateToken, validateChangePassword, changePassword);

// ============================================================================
// ADMIN ROUTES - User Management
// ============================================================================

/**
 * @route   GET /api/users
 * @desc    Lista tutti gli utenti con filtri e paginazione
 * @access  Private/Admin (user:read)
 * @query   page, limit, search, active, roleId, sortBy, sortOrder
 */
router.get(
  '/', 
  authenticateToken, 
  authorize(['user:read', 'user:manage']),
  validateUserQuery,
  getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Ottieni dettagli di un utente specifico
 * @access  Private/Admin (user:read)
 */
router.get(
  '/:id', 
  authenticateToken, 
  authorize(['user:read', 'user:manage']),
  validateUserId,
  getUserById
);

/**
 * @route   POST /api/users
 * @desc    Crea un nuovo utente (solo Admin)
 * @access  Private/Admin (user:create)
 */
router.post(
  '/', 
  authenticateToken, 
  authorize(['user:create', 'user:manage']),
  validateCreateUser,
  createUser
);

/**
 * @route   PUT /api/users/:id/profile
 * @desc    Aggiorna profilo di un utente (Admin)
 * @access  Private/Admin (user:update)
 */
router.put(
  '/:id/profile', 
  authenticateToken, 
  authorize(['user:update', 'user:manage']),
  validateUpdateUserProfile,
  updateProfile
);

/**
 * @route   PUT /api/users/:id/details
 * @desc    Aggiorna dettagli di un utente (Admin)
 * @access  Private/Admin (user:update)
 */
router.put(
  '/:id/details', 
  authenticateToken, 
  authorize(['user:update', 'user:manage']),
  validateUpdateUserDetails,
  updateDetails
);

/**
 * @route   PUT /api/users/:id/roles
 * @desc    Aggiorna ruoli di un utente
 * @access  Private/Admin (user:manage)
 */
router.put(
  '/:id/roles', 
  authenticateToken, 
  authorize(['user:manage']),
  validateUpdateUserRoles,
  updateRole
);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Attiva/Disattiva un utente
 * @access  Private/Admin (user:manage)
 */
router.patch(
  '/:id/toggle-active', 
  authenticateToken, 
  authorize(['user:manage']),
  validateToggleUserStatus,
  toggleUserActive
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Elimina un utente (soft delete)
 * @access  Private/Admin (user:delete)
 */
router.delete(
  '/:id', 
  authenticateToken, 
  authorize(['user:delete', 'user:manage']),
  validateUserId,
  deleteUser
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;