import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import {
  validateOpportunityQuery,
  validateGetOpportunitiesByCustomer,
  validateCreateOpportunity,
  validateGetOpportunity,
  validateUpdateOpportunity,
  validateUpdateOpportunityStage,
  validateOpportunityWon,
  validateOpportunityLost,
  validateOpportunityAssignUser,
  validateCustomerIdParam,
} from '../validators/opportunity';
import {
  getAllOpportunities,
  getOpportunitiesByCustomer,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateStage,
  closeOpportunityWon,
  closeOpportunityLost,
  assignOpportunity,
  deleteOpportunity,
  getPipelineStats,
} from '../controllers/opportunity';

const router = express.Router();

// ============================================================================
// OPPORTUNITY ROUTES (CRM / Lead Management)
// ============================================================================

/**
 * @route   GET /api/opportunities/stats/pipeline
 * @desc    Ottieni statistiche pipeline vendite
 * @access  Private (opportunity:read)
 * @query   assignedUserId
 */
router.get(
  '/stats/pipeline',
  authenticateToken,
  authorize(['opportunity:read', 'opportunity:manage']),
  getPipelineStats
);

/**
 * @route   GET /api/opportunities
 * @desc    Ottieni tutte le opportunità con filtri e paginazione
 * @access  Private (opportunity:read)
 * @query   page, limit, search, customerId, assignedUserId, status, stage,
 *          minValue, maxValue, minProbability, maxProbability,
 *          expectedCloseDateFrom, expectedCloseDateTo, sortBy, sortOrder
 */
router.get(
  '/',
  authenticateToken,
  authorize(['opportunity:read', 'opportunity:manage']),
  validateOpportunityQuery,
  getAllOpportunities
);

/**
 * @route   GET /api/opportunities/customer/:customerId
 * @desc    Ottieni tutte le opportunità di un customer
 * @access  Private (opportunity:read)
 * @query   status
 */
router.get(
  '/customer/:customerId',
  authenticateToken,
  authorize(['opportunity:read', 'opportunity:manage']),
  validateCustomerIdParam,
  validateGetOpportunitiesByCustomer,
  getOpportunitiesByCustomer
);

/**
 * @route   GET /api/opportunities/:id
 * @desc    Ottieni dettagli di un'opportunità specifica
 * @access  Private (opportunity:read)
 */
router.get(
  '/:id',
  authenticateToken,
  authorize(['opportunity:read', 'opportunity:manage']),
  validateGetOpportunity,
  getOpportunityById
);

/**
 * @route   POST /api/opportunities
 * @desc    Crea nuova opportunità
 * @access  Private (opportunity:create)
 */
router.post(
  '/',
  authenticateToken,
  authorize(['opportunity:create', 'opportunity:manage']),
  validateCreateOpportunity,
  createOpportunity
);

/**
 * @route   PUT /api/opportunities/:id
 * @desc    Aggiorna opportunità esistente
 * @access  Private (opportunity:update)
 */
router.put(
  '/:id',
  authenticateToken,
  authorize(['opportunity:update', 'opportunity:manage']),
  validateGetOpportunity,
  validateUpdateOpportunity,
  updateOpportunity
);

/**
 * @route   PATCH /api/opportunities/:id/stage
 * @desc    Aggiorna stage dell'opportunità (muovi nella pipeline)
 * @access  Private (opportunity:update)
 */
router.patch(
  '/:id/stage',
  authenticateToken,
  authorize(['opportunity:update', 'opportunity:manage']),
  validateGetOpportunity,
  validateUpdateOpportunityStage,
  updateStage
);

/**
 * @route   PATCH /api/opportunities/:id/close-won
 * @desc    Chiudi opportunità come WON (vendita conclusa)
 * @access  Private (opportunity:update)
 */
router.patch(
  '/:id/close-won',
  authenticateToken,
  authorize(['opportunity:update', 'opportunity:manage']),
  validateGetOpportunity,
  validateOpportunityWon,
  closeOpportunityWon
);

/**
 * @route   PATCH /api/opportunities/:id/close-lost
 * @desc    Chiudi opportunità come LOST (vendita persa)
 * @access  Private (opportunity:update)
 */
router.patch(
  '/:id/close-lost',
  authenticateToken,
  authorize(['opportunity:update', 'opportunity:manage']),
  validateGetOpportunity,
  validateOpportunityLost,
  closeOpportunityLost
);

/**
 * @route   PATCH /api/opportunities/:id/assign
 * @desc    Assegna opportunità a un utente
 * @access  Private (opportunity:update)
 */
router.patch(
  '/:id/assign',
  authenticateToken,
  authorize(['opportunity:update', 'opportunity:manage']),
  validateGetOpportunity,
  validateOpportunityAssignUser,
  assignOpportunity
);

/**
 * @route   DELETE /api/opportunities/:id
 * @desc    Elimina un'opportunità
 * @access  Private (opportunity:delete)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize(['opportunity:delete', 'opportunity:manage']),
  validateGetOpportunity,
  deleteOpportunity
);

// ============================================================================
// EXPORT
// ============================================================================

export default router;