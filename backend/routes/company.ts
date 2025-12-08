import express from 'express';
import { authenticateToken, authorize } from '../middleware/auth';
import { validateCompanyQuery } from '../validators/company'
import { listCompanies } from '../controllers/company';


const router = express.Router();

// ============================================================================
// COMPANY ROUTES
// ============================================================================

/**
 * @route   GET /api/companies
 * @desc    Ottieni tutti le aziende con filtri e paginazione
 * @access  Private (company:read)
 * @query   search, page, limit, countryCode, status, sortBy, sortOrder
 */
router.get(
    '/',
    authenticateToken,
    authorize(['company:read', 'company:manage']),
    validateCompanyQuery,
    listCompanies
)


export default router;