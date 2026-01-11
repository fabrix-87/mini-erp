import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  // Role validators
  validateCreateRole,
  validateUpdateRole,
  validateRoleId,
  validateRoleCode,
  validateRoleQuery,
  validateAssignPermissions,
  validateRemovePermissions,
  // Permission validators
  validateCreatePermission,
  validateUpdatePermission,
  validatePermissionId,
  validatePermissionQuery,
  // Utility validators
  validateAssignRolesToUser,
  validateCheckPermission,
} from '../validators/role';
import {
  // Roles
  getAllRoles,
  getRoleById,
  getRoleByCode,
  createRole,
  updateRole,
  deleteRole,
  assignPermissionsToRole,
  removePermissionsFromRole,
  getRolePermissions,
  getRoleUsers,
  // Permissions
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionRoles,
  // Utilities
  assignRolesToUser,
  removeRolesFromUser,
  getUserRoles,
  getUserPermissions,
  checkUserPermission,
  syncPermissions,
} from '../controllers/role'

const router = express.Router();

// ============================================================================
// PERMISSIONS - Public/Read Routes
// ============================================================================

/**
 * @route   GET /api/roles/permissions
 * @desc    Lista tutti i permessi con filtri
 * @access  Private/Admin (permission:read)
 * @query   search, resource, action, sortBy, sortOrder
 */
router.get(
  '/permissions',
  authenticateToken,
  authorize(['permission:read', 'permission:manage', 'role:manage']),
  validatePermissionQuery,
  getAllPermissions
);

/**
 * @route   GET /api/roles/permissions/:id
 * @desc    Ottieni dettagli permesso
 * @access  Private/Admin (permission:read)
 */
router.get(
  '/permissions/:id',
  authenticateToken,
  authorize(['permission:read', 'permission:manage', 'role:manage']),
  validatePermissionId,
  getPermissionById
);

/**
 * @route   GET /api/roles/permissions/:id/roles
 * @desc    Lista ruoli che hanno questo permesso
 * @access  Private/Admin (permission:read)
 */
router.get(
  '/permissions/:id/roles',
  authenticateToken,
  authorize(['permission:read', 'permission:manage', 'role:manage']),
  validatePermissionId,
  getPermissionRoles
);

// ============================================================================
// PERMISSIONS - Admin Routes
// ============================================================================

/**
 * @route   POST /api/roles/permissions
 * @desc    Crea un nuovo permesso
 * @access  Private/Admin (permission:create)
 */
router.post(
  '/permissions',
  authenticateToken,
  authorize(['permission:create', 'permission:manage']),
  validateCreatePermission,
  createPermission
);

/**
 * @route   PUT /api/roles/permissions/:id
 * @desc    Aggiorna un permesso
 * @access  Private/Admin (permission:update)
 */
router.put(
  '/permissions/:id',
  authenticateToken,
  authorize(['permission:update', 'permission:manage']),
  validatePermissionId,
  validateUpdatePermission,
  updatePermission
);

/**
 * @route   DELETE /api/roles/permissions/:id
 * @desc    Elimina un permesso
 * @access  Private/Admin (permission:delete)
 */
router.delete(
  '/permissions/:id',
  authenticateToken,
  authorize(['permission:delete', 'permission:manage']),
  validatePermissionId,
  deletePermission
);

// ============================================================================
// USER ROLE MANAGEMENT
// ============================================================================

/**
 * @route   POST /api/roles/users/assign
 * @desc    Assegna ruoli a un utente
 * @access  Private/Admin (user:manage)
 */
router.post(
  '/users/assign',
  authenticateToken,
  authorize(['user:manage']),
  validateAssignRolesToUser,
  assignRolesToUser
);

/**
 * @route   POST /api/roles/users/remove
 * @desc    Rimuovi ruoli da un utente
 * @access  Private/Admin (user:manage)
 */
router.post(
  '/users/remove',
  authenticateToken,
  authorize(['user:manage']),
  removeRolesFromUser
);

/**
 * @route   GET /api/roles/users/:userId/roles
 * @desc    Lista ruoli di un utente
 * @access  Private/Admin (user:read)
 */
router.get(
  '/users/:userId/roles',
  authenticateToken,
  authorize(['user:read', 'user:manage']),
  getUserRoles
);

/**
 * @route   GET /api/roles/users/:userId/permissions
 * @desc    Lista tutti i permessi di un utente (tramite ruoli)
 * @access  Private/Admin (user:read)
 */
router.get(
  '/users/:userId/permissions',
  authenticateToken,
  authorize(['user:read', 'user:manage']),
  getUserPermissions
);

/**
 * @route   POST /api/roles/users/check-permission
 * @desc    Verifica se un utente ha un permesso specifico
 * @access  Private/Admin (user:read)
 */
router.post(
  '/users/check-permission',
  authenticateToken,
  authorize(['user:read', 'user:manage']),
  validateCheckPermission,
  checkUserPermission
);

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * @route   POST /api/roles/sync-permissions
 * @desc    Sincronizza permessi dal codice al database
 * @access  Private/Admin (permission:manage)
 */
router.post(
  '/sync-permissions',
  authenticateToken,
  authorize(['permission:manage']),
  syncPermissions
);

// ============================================================================
// ROLES - Admin Routes
// ============================================================================

/**
 * @route   POST /api/roles
 * @desc    Crea un nuovo ruolo
 * @access  Private/Admin (role:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['role:create', 'role:manage']),
  validateCreateRole,
  createRole
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Aggiorna un ruolo
 * @access  Private/Admin (role:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['role:update', 'role:manage']),
  validateRoleId,
  validateUpdateRole,
  updateRole
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Elimina un ruolo
 * @access  Private/Admin (role:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['role:delete', 'role:manage']),
  validateRoleId,
  deleteRole
);

/**
 * @route   POST /api/roles/:id/permissions
 * @desc    Assegna permessi a un ruolo
 * @access  Private/Admin (role:manage)
 */
router.post(
  '/:id/permissions',
  authenticateToken,
  authorize(['role:manage']),
  validateRoleId,
  validateAssignPermissions,
  assignPermissionsToRole
);

/**
 * @route   DELETE /api/roles/:id/permissions
 * @desc    Rimuovi permessi da un ruolo
 * @access  Private/Admin (role:manage)
 */
router.delete(
  '/:id/permissions',
  authenticateToken,
  authorize(['role:manage']),
  validateRoleId,
  validateRemovePermissions,
  removePermissionsFromRole
);

// ============================================================================
// ROLES - Public/Read Routes
// ============================================================================

/**
 * @route   GET /api/roles
 * @desc    Lista tutti i ruoli con filtri
 * @access  Private/Admin (role:read)
 * @query   search, isDefault, sortBy, sortOrder
 */
router.get(
  '/',
  authenticateToken,
  authorize(['role:read', 'role:manage']),
  validateRoleQuery,
  getAllRoles
);

/**
 * @route   GET /api/roles/code/:code
 * @desc    Ottieni dettagli ruolo per codice
 * @access  Private/Admin (role:read)
*/
router.get(
  '/code/:code',
  authenticateToken,
  authorize(['role:read', 'role:manage']),
  validateRoleCode,
  getRoleByCode
);

/**
 * @route   GET /api/roles/:id/permissions
 * @desc    Lista permessi di un ruolo
 * @access  Private/Admin (role:read)
*/
router.get(
  '/:id/permissions',
  authenticateToken,
  authorize(['role:read', 'role:manage']),
  validateRoleId,
  getRolePermissions
);

/**
 * @route   GET /api/roles/:id/users
 * @desc    Lista utenti con questo ruolo
 * @access  Private/Admin (role:read)
*/
router.get(
  '/:id/users',
  authenticateToken,
  authorize(['role:read', 'role:manage']),
  validateRoleId,
  getRoleUsers
);

/**
 * @route   GET /api/roles/:id
 * @desc    Ottieni dettagli ruolo per ID
 * @access  Private/Admin (role:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['role:read', 'role:manage']),
  validateRoleId,
  getRoleById
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;