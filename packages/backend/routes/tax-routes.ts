import { authenticateToken, authorize } from "../middleware/auth-middleware";
import {
  // Tax Rule
  validateCreateTaxRule,
  validateUpdateTaxRule,
  validateTaxRuleId,
  validateTaxRuleQuery,
  validateToggleTaxStatus,
  validateTaxRuleTranslationId,
  validateCreateTaxRuleTranslation,
  validateUpdateTaxRuleTranslation,
  // VatNature
  validateCreateVatNature,
  validateUpdateVatNature,
  validateVatNatureId,
  validateVatNatureQuery,
  validateVatNatureTranslationId,
  validateCreateVatNatureTranslation,
  validateUpdateVatNatureTranslation,
} from "../validators/tax-validator";
import {
  // Tax Rule
  getAllTaxRules,
  getTaxRuleById,
  createTaxRule,
  updateTaxRule,
  toggleTaxRuleActive,
  deleteTaxRule,
  // Tax Rule Translation
  createTaxRuleTranslation,
  updateTaxRuleTranslation,
  deleteTaxRuleTranslation,
  // VatNature
  getAllVatNatures,
  getVatNatureById,
  createVatNature,
  updateVatNature,
  toggleVatNatureActive,
  deleteVatNature,
  // VatNature Translation
  createVatNatureTranslation,
  updateVatNatureTranslation,
  deleteVatNatureTranslation,
} from "../controllers/tax-controller";
import { createHonoApp } from "@/lib/hono-app";

const taxRoutes = createHonoApp();

// ============================================================================
// TAX RULE ROUTES
// ============================================================================

taxRoutes.get(
  "/rules",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateTaxRuleQuery,
  getAllTaxRules,
);

taxRoutes.get(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateTaxRuleId,
  getTaxRuleById,
);

taxRoutes.post(
  "/rules",
  authenticateToken,
  authorize(["tax:create", "tax:manage"]),
  validateCreateTaxRule,
  createTaxRule,
);

taxRoutes.put(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateUpdateTaxRule,
  updateTaxRule,
);

taxRoutes.patch(
  "/rules/:id/toggle-active",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateToggleTaxStatus,
  toggleTaxRuleActive,
);

taxRoutes.delete(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateTaxRuleId,
  deleteTaxRule,
);

// ============================================================================
// TAX RULE TRANSLATION ROUTES
// ============================================================================

taxRoutes.post(
  "/rules/:id/translations",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateCreateTaxRuleTranslation,
  createTaxRuleTranslation,
);

taxRoutes.put(
  "/rules/:taxRuleId/translations/:languageId",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleTranslationId,
  validateUpdateTaxRuleTranslation,
  updateTaxRuleTranslation,
);

taxRoutes.delete(
  "/rules/:taxRuleId/translations/:languageId",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateTaxRuleTranslationId,
  deleteTaxRuleTranslation,
);

// ============================================================================
// VAT NATURE ROUTES
// ============================================================================

taxRoutes.get(
  "/vat-natures",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateVatNatureQuery,
  getAllVatNatures,
);

taxRoutes.get(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateVatNatureId,
  getVatNatureById,
);

taxRoutes.post(
  "/vat-natures",
  authenticateToken,
  authorize(["tax:create", "tax:manage"]),
  validateCreateVatNature,
  createVatNature,
);

taxRoutes.put(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateUpdateVatNature,
  updateVatNature,
);

taxRoutes.patch(
  "/vat-natures/:id/toggle-active",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateToggleTaxStatus,
  toggleVatNatureActive,
);

taxRoutes.delete(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateVatNatureId,
  deleteVatNature,
);

// ============================================================================
// VAT NATURE TRANSLATION ROUTES
// ============================================================================

taxRoutes.post(
  "/vat-natures/:id/translations",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateCreateVatNatureTranslation,
  createVatNatureTranslation,
);

taxRoutes.put(
  "/vat-natures/:vatNatureId/translations/:languageId",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureTranslationId,
  validateUpdateVatNatureTranslation,
  updateVatNatureTranslation,
);

taxRoutes.delete(
  "/vat-natures/:vatNatureId/translations/:languageId",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateVatNatureTranslationId,
  deleteVatNatureTranslation,
);

export default taxRoutes;
