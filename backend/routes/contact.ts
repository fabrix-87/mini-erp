import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {  
  validateContactQuery,
  validateContactId,
  validateCreateContact,
  validateUpdateContact,
} from '../validators/contact';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  toggleContactActive,
  setPrimaryContact,
  deleteContact,
} from '../controllers/contact';

const router = express.Router();

// ============================================================================
// CONTACT ROUTES
// ============================================================================

/**
 * @route   GET /api/contacts
 * @desc    Ottieni tutti i contatti con filtri e paginazione
 * @access  Private (contact:read)
 * @query   page, limit, search, companyId, active, isPrimaryContact, sortBy, sortOrder
 */
router.get(
  '/',
  authenticateToken,
  authorize(['contact:read', 'contact:manage']),
  validateContactQuery,
  getAllContacts
);

/**
 * @route   GET /api/contacts/company/:companyId
 * @desc    Ottieni tutti i contatti di una company
 * @access  Private (contact:read)
 * @query   active
 */
/*
router.get(
  '/company/:companyId',
  authenticateToken,
  authorize(['contact:read', 'contact:manage']),
  validate(CompanyIdSchema, 'Company ID', { source: ['params'] }),
  getContactsByCompany
);

/**
 * @route   GET /api/contacts/company/:companyId/primary
 * @desc    Ottieni il contatto primario di una company
 * @access  Private (contact:read)
 
router.get(
  '/company/:companyId/primary',
  authenticateToken,
  authorize(['contact:read', 'contact:manage']),
  validate(CompanyIdSchema, 'Company ID', { source: ['params'] }),
  getPrimaryContactByCompany
);
*/
/**
 * @route   GET /api/contacts/:id
 * @desc    Ottieni dettagli di un contatto specifico
 * @access  Private (contact:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['contact:read', 'contact:manage']),
  validateContactId,
  getContactById
);

/**
 * @route   POST /api/contacts
 * @desc    Crea nuovo contatto
 * @access  Private (contact:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['contact:create', 'contact:manage']),
  validateCreateContact,
  createContact
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Aggiorna contatto esistente
 * @access  Private (contact:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['contact:update', 'contact:manage']),
  validateContactId,
  validateUpdateContact,
  updateContact
);

/**
 * @route   PATCH /api/contacts/:id/toggle-active
 * @desc    Attiva/Disattiva un contatto
 * @access  Private (contact:update)
 */
router.patch(
  '/:id/toggle-active',
  authenticateToken,
  authorize(['contact:update', 'contact:manage']),
  validateContactId,
  toggleContactActive
);

/**
 * @route   PATCH /api/contacts/:id/set-primary
 * @desc    Imposta contatto come primario per la company
 * @access  Private (contact:update)
 */
router.patch(
  '/:id/set-primary',
  authenticateToken,
  authorize(['contact:update', 'contact:manage']),
  validateContactId,
  setPrimaryContact
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Elimina un contatto
 * @access  Private (contact:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['contact:delete', 'contact:manage']),
  validateContactId,
  deleteContact
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;