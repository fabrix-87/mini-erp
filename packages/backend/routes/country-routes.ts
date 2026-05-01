import { authenticateToken, authorize } from '../middleware/auth-middleware';
import { validateCountryCode, validateCountryQuery } from '../validators/country-validator';
import { getAllCountries, getCountryByCode } from '../controllers/country-controller';
import { createHonoApp } from '@/lib/hono-app';

const countryRoutes = createHonoApp();

countryRoutes.get(
    '/',
    authenticateToken,
    authorize(['country:read', 'country:manage']),
    validateCountryQuery,
    getAllCountries
)

countryRoutes.get(
    '/:code',
    authenticateToken,
    authorize(['country:read', 'country:manage']),
    validateCountryCode,
    getCountryByCode
)

export default countryRoutes;