import { authorize } from "../middleware/auth-middleware";
import {
  validateCreateCompanyContact,
  validateUpdateCompanyContact,
  validateCompanyContactParams,
} from "../validators/company-contact-validator";
import {
  createCompanyContact,
  updateCompanyContact,
  deleteCompanyContact,
} from "../controllers/company-contact-controller";
import { createHonoApp } from "@/lib/hono-app";
import { requireTenantScope } from "@/middleware/tenant-scope-middleware";

const companyContactRoutes = createHonoApp();

// ============================================================================
// COMPANY CONTACT ROUTES
// ============================================================================

/**
 * @route   POST /api/company-contacts
 * @desc    Crea una nuova associazione contatto-company
 * @access  Private (contact:update | contact:manage)
 * @body    { contactId, companyId, position?, department?, isPrimaryContact? }
 */
companyContactRoutes.post(
  "/",
  requireTenantScope,
  authorize(["contact:update", "contact:manage"]),
  validateCreateCompanyContact,
  createCompanyContact,
);

/**
 * @route   PATCH /api/company-contacts/:contactId/:companyId
 * @desc    Aggiorna position, department e/o isPrimaryContact di un'associazione
 * @access  Private (contact:update | contact:manage)
 * @body    { position?, department?, isPrimaryContact? }
 */
companyContactRoutes.patch(
  "/:contactId/:companyId",
  requireTenantScope,
  authorize(["contact:update", "contact:manage"]),
  validateCompanyContactParams,
  validateUpdateCompanyContact,
  updateCompanyContact,
);

/**
 * @route   DELETE /api/company-contacts/:contactId/:companyId
 * @desc    Rimuove l'associazione contatto-company
 * @access  Private (contact:delete | contact:manage)
 */
companyContactRoutes.delete(
  "/:contactId/:companyId",
  requireTenantScope,
  authorize(["contact:delete", "contact:manage"]),
  validateCompanyContactParams,
  deleteCompanyContact,
);

// ============================================================================
// EXPORT
// ============================================================================

export default companyContactRoutes;
