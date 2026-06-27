import { validateCompanyQuery } from "../validators/company-validator";
import { listCompanies } from "../controllers/company-controller";
import { authorize } from "@/middleware/auth-middleware";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const companyRoutes = createHonoApp();

// ============================================================================
// COMPANY ROUTES
// ============================================================================

/**
 * @route   GET /api/companies
 * @desc    Ottieni tutti le aziende con filtri e paginazione
 * @access  Private (company:read)
 * @query   search, page, limit, countryCode, status, sortBy, sortOrder
 */
companyRoutes.get(
  "/",
  requireTenantScope,
  authorize(["company:read", "company:manage"]),
  validateCompanyQuery,
  listCompanies,
);

export default companyRoutes;
