import express from 'express'
import { authenticateToken, authorize } from '../middleware/auth';
import { validateCountryCode, validateCountryQuery } from '../validators/country';
import { getAllCountries, getCountryByCode } from '../controllers/country';

const router = express.Router();

router.get(
    '/',
    authenticateToken,
    authorize(['country:read', 'country:manage']),
    validateCountryQuery,
    getAllCountries
)

router.get(
    '/:code',
    authenticateToken,
    authorize(['country:read', 'country:manage']),
    validateCountryCode,
    getCountryByCode
)

export default router;