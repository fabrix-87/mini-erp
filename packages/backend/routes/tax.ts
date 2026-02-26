import express from "express";
import { authenticateToken, authorize } from "../middleware/auth";
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
} from "../validators/tax";
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
} from "../controllers/tax";

const router = express.Router();

// ============================================================================
// TAX RULE ROUTES
// ============================================================================

router.get(
  "/rules",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateTaxRuleQuery,
  getAllTaxRules,
);

router.get(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateTaxRuleId,
  getTaxRuleById,
);

router.post(
  "/rules",
  authenticateToken,
  authorize(["tax:create", "tax:manage"]),
  validateCreateTaxRule,
  createTaxRule,
);

router.put(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateUpdateTaxRule,
  updateTaxRule,
);

router.patch(
  "/rules/:id/toggle-active",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateToggleTaxStatus,
  toggleTaxRuleActive,
);

router.delete(
  "/rules/:id",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateTaxRuleId,
  deleteTaxRule,
);

// ============================================================================
// TAX RULE TRANSLATION ROUTES
// ============================================================================

router.post(
  "/rules/:id/translations",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleId,
  validateCreateTaxRuleTranslation,
  createTaxRuleTranslation,
);

router.put(
  "/rules/:taxRuleId/translations/:languageId",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateTaxRuleTranslationId,
  validateUpdateTaxRuleTranslation,
  updateTaxRuleTranslation,
);

router.delete(
  "/rules/:taxRuleId/translations/:languageId",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateTaxRuleTranslationId,
  deleteTaxRuleTranslation,
);

// ============================================================================
// VAT NATURE ROUTES
// ============================================================================

router.get(
  "/vat-natures",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateVatNatureQuery,
  getAllVatNatures,
);

router.get(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:read", "tax:manage"]),
  validateVatNatureId,
  getVatNatureById,
);

router.post(
  "/vat-natures",
  authenticateToken,
  authorize(["tax:create", "tax:manage"]),
  validateCreateVatNature,
  createVatNature,
);

router.put(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateUpdateVatNature,
  updateVatNature,
);

router.patch(
  "/vat-natures/:id/toggle-active",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateToggleTaxStatus,
  toggleVatNatureActive,
);

router.delete(
  "/vat-natures/:id",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateVatNatureId,
  deleteVatNature,
);

// ============================================================================
// VAT NATURE TRANSLATION ROUTES
// ============================================================================

router.post(
  "/vat-natures/:id/translations",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureId,
  validateCreateVatNatureTranslation,
  createVatNatureTranslation,
);

router.put(
  "/vat-natures/:vatNatureId/translations/:languageId",
  authenticateToken,
  authorize(["tax:update", "tax:manage"]),
  validateVatNatureTranslationId,
  validateUpdateVatNatureTranslation,
  updateVatNatureTranslation,
);

router.delete(
  "/vat-natures/:vatNatureId/translations/:languageId",
  authenticateToken,
  authorize(["tax:delete", "tax:manage"]),
  validateVatNatureTranslationId,
  deleteVatNatureTranslation,
);

export default router;
