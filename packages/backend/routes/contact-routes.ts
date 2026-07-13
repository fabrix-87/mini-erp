import { authorize } from '../middleware/auth-middleware';
import {  
  validateContactQuery,
  validateContactId,
  validateCreateContact,
  validateUpdateContact,
  validateCheckEmail,
  validateCompanyId,
  validateToggleContactActive,
  validateSetPrimaryContactId,
} from '../validators/contact-validator';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  toggleContactActive,
  setPrimaryContact,
  deleteContact,
  checkEmail,
  getPrimaryContactByCompany,
  getContactsByCompany,
} from '../controllers/contact-controller';
import { createHonoApp } from '@/lib/hono-app';
import { requireTenantScope } from '@/middleware/tenant-scope-middleware';

const contactRoutes = createHonoApp();

// ============================================================================
// CONTACT ROUTES
// ============================================================================

/**
 * @route   GET /api/contacts
 * @desc    Ottieni tutti i contatti con filtri e paginazione
 * @access  Private (contact:read)
 * @query   page, limit, search, companyId, active, isPrimaryContact, sortBy, sortOrder
 */
contactRoutes.get(
  '/',
  requireTenantScope,
  authorize(['contact:read', 'contact:manage']),
  validateContactQuery,
  getAllContacts
);

/**
 * @route   GET /api/contacts/check-email
 * @desc    Verifica se una mail è già registrata
 * @access  Private (contact:read)
 * @query   contactId, email
 */
contactRoutes.get(
  '/check-email',
  requireTenantScope,
  authorize(['contact:read', 'contact:manage']),
  validateCheckEmail,
  checkEmail
)

/**
 * @route   GET /api/contacts/company/:companyId
 * @desc    Ottieni tutti i contatti di una company
 * @access  Private (contact:read)
 * @query   active
 */
contactRoutes.get(
  '/company/:companyId',
  requireTenantScope,
  authorize(['contact:read', 'contact:manage']),
  validateCompanyId,
  getContactsByCompany
);

/**
 * @route   GET /api/contacts/company/:companyId/primary
 * @desc    Ottieni il contatto primario di una company
 * @access  Private (contact:read)
 */
contactRoutes.get(
  '/company/:companyId/primary',
  requireTenantScope,
  authorize(['contact:read', 'contact:manage']),
  validateCompanyId,
  getPrimaryContactByCompany
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Ottieni dettagli di un contatto specifico
 * @access  Private (contact:read)
 */
contactRoutes.get(
  '/:id',
  requireTenantScope,
  authorize(['contact:read', 'contact:manage']),
  validateContactId,
  getContactById
);

/**
 * @route   POST /api/contacts
 * @desc    Crea nuovo contatto
 * @access  Private (contact:create)
 */
contactRoutes.post(
  '/',
  requireTenantScope,
  authorize(['contact:create', 'contact:manage']),
  validateCreateContact,
  createContact
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Aggiorna contatto esistente
 * @access  Private (contact:update)
 */
contactRoutes.put(
  '/:id',
  requireTenantScope,
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
contactRoutes.patch(
  '/:id/toggle-active',
  requireTenantScope,
  authorize(['contact:update', 'contact:manage']),
  validateContactId,
  validateToggleContactActive,
  toggleContactActive
);

/**
 * @route   PATCH /api/contacts/:id/set-primary/:companyId
 * @desc    Imposta contatto come primario per la company
 * @access  Private (contact:update)
 */
contactRoutes.patch(
  '/:id/set-primary/:companyId',
  requireTenantScope,
  authorize(['contact:update', 'contact:manage']),
  validateSetPrimaryContactId,
  setPrimaryContact
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Elimina un contatto
 * @access  Private (contact:delete)
 */
contactRoutes.delete(
  '/:id',
  requireTenantScope,
  authorize(['contact:delete', 'contact:manage']),
  validateContactId,
  deleteContact
);

// ============================================================================
// EXPORT
// ============================================================================

export default contactRoutes;