import { Response } from "express";
import { prisma } from "../config/prisma-config";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate-types";
import asyncHandler from "@/middleware/async-handler-middleware";
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "@/utils/app-error-utils";
import { sendCreated, sendDeleted, sendSuccess } from "@/utils/response-utils";
import {
  // Tax Rule
  CreateTaxRuleInput,
  UpdateTaxRuleInput,
  TaxRuleIdParam,
  TaxRuleQueryInput,
  ToggleTaxStatusInput,
  // Tax Rule Translation
  CreateTaxRuleTranslationInput,
  UpdateTaxRuleTranslationInput,
  TaxRuleTranslationIdParam,
  // VatNature
  CreateVatNatureInput,
  UpdateVatNatureInput,
  VatNatureIdParam,
  VatNatureQueryInput,
  // VatNature Translation
  CreateVatNatureTranslationInput,
  UpdateVatNatureTranslationInput,
  VatNatureTranslationIdParam,
} from "@mini-erp/shared";
import {
  clean,
  connectOrDisconnectByCode,
  connectOrDisconnectById,
  ifDefined,
  toDate,
  toRequiredDate,
} from "@/helpers/prisma";

// ============================================================================
// TAX RULE CONTROLLER
// ============================================================================

/**
 * @desc   List all Tax Rules with optional filters
 * @route  GET /api/tax/rules
 * @access Private (tax:read)
 */
export const getAllTaxRules = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      active,
      applicableFor,
      countryCode,
      vatNatureId,
      isDefault,
      search,
      minRate,
      maxRate,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.validatedQuery as TaxRuleQueryInput;

    const where: Prisma.TaxRuleWhereInput = {};

    if (active !== undefined) where.active = active;
    if (isDefault !== undefined) where.isDefault = isDefault;
    if (applicableFor) where.applicableFor = applicableFor;
    if (countryCode) where.countryCode = countryCode;
    if (vatNatureId) where.vatNatureId = vatNatureId;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (minRate || maxRate) {
      where.rate = {
        ...(minRate && { gte: new Prisma.Decimal(minRate.toString()) }),
        ...(maxRate && { lte: new Prisma.Decimal(maxRate.toString()) }),
      };
    }

    const taxRules = await prisma.taxRule.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        vatNature: { select: { id: true, code: true, description: true } },
        translations: {
          include: {
            language: { select: { id: true, name: true, iso_code: true } },
          },
        },
      },
    });

    sendSuccess(res, taxRules, { results: taxRules.length });
  },
);

/**
 * @desc   Get Tax Rule by ID
 * @route  GET /api/tax/rules/:id
 * @access Private (tax:read)
 */
export const getTaxRuleById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id },
      include: {
        vatNature: true,
        translations: { include: { language: true } },
        products: {
          select: { id: true, reference: true },
          take: 10,
        },
        documentLines: {
          select: { id: true, documentId: true },
          take: 10,
        },
        customers: {
          select: {
            id: true,
            company: { select: { companyName: true } },
          },
          take: 10,
        },
      },
    });

    if (!taxRule) throw new NotFoundError("Tax Rule non trovata");

    sendSuccess(res, taxRule);
  },
);

/**
 * @desc   Create a new Tax Rule
 * @route  POST /api/tax/rules
 * @access Private (tax:create)
 */
export const createTaxRule = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      code,
      name,
      description,
      rate,
      vatNatureId,
      normativeReference,
      countryCode,
      applicableFor,
      productCategory,
      customerType,
      isSplitPayment,
      deductibilityPercent,
      vatDeductible,
      validFrom,
      validTo,
      active,
      isDefault,
      displayOrder,
      color,
      translations,
    } = req.validatedBody as CreateTaxRuleInput;

    const existing = await prisma.taxRule.findUnique({ where: { code } });
    if (existing) throw new ConflictError("Codice Tax Rule già esistente");

    // Verify vatNature exists if provided
    if (vatNatureId) {
      const vn = await prisma.vatNature.findUnique({
        where: { id: vatNatureId },
      });
      if (!vn) throw new NotFoundError("Natura IVA non trovata");
    }

    const taxRule = await prisma.taxRule.create({
      data: {
        code,
        name,
        description,
        rate: new Prisma.Decimal(rate.toString()),
        vatNatureId,
        normativeReference,
        countryCode,
        applicableFor,
        productCategory,
        customerType,
        isSplitPayment,
        deductibilityPercent: new Prisma.Decimal(
          deductibilityPercent.toString(),
        ),
        vatDeductible,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validTo: validTo ? new Date(validTo) : undefined,
        active,
        isDefault,
        displayOrder,
        color,
        translations: translations?.length
          ? {
              create: translations.map((t) => ({
                languageId: t.languageId,
                name: t.name,
                description: t.description,
              })),
            }
          : undefined,
      },
      include: {
        vatNature: { select: { id: true, code: true } },
        translations: true,
      },
    });

    sendCreated(res, taxRule, "Tax Rule creata con successo");
  },
);

/**
 * @desc   Update a Tax Rule
 * @route  PUT /api/tax/rules/:id
 * @access Private (tax:update)
 */
export const updateTaxRule = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;
    const updateData = req.validatedBody as UpdateTaxRuleInput;

    const existing = await prisma.taxRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Tax Rule non trovata");

    // Verify vatNature if changed
    if (
      updateData.vatNatureId &&
      updateData.vatNatureId !== existing.vatNatureId
    ) {
      const vn = await prisma.vatNature.findUnique({
        where: { id: updateData.vatNatureId },
      });
      if (!vn) throw new NotFoundError("Natura IVA non trovata");
    }

    const { translations: _translations, ...scalarData } = updateData;

    const data = clean({
      ...ifDefined(scalarData.name, (v) => ({ name: v })),
      ...ifDefined(scalarData.description, (v) => ({ description: v })),
      ...ifDefined(scalarData.normativeReference, (v) => ({
        normativeReference: v,
      })),

      ...ifDefined(scalarData.countryCode, (code) => ({
        country: { connect: { code } },
      })),

      ...ifDefined(scalarData.applicableFor, (v) => ({ applicableFor: v })),
      ...ifDefined(scalarData.productCategory, (v) => ({ productCategory: v })),
      ...ifDefined(scalarData.customerType, (v) => ({ customerType: v })),
      ...ifDefined(scalarData.isSplitPayment, (v) => ({ isSplitPayment: v })),
      ...ifDefined(scalarData.vatDeductible, (v) => ({ vatDeductible: v })),
      ...ifDefined(scalarData.active, (v) => ({ active: v })),
      ...ifDefined(scalarData.isDefault, (v) => ({ isDefault: v })),
      ...ifDefined(scalarData.displayOrder, (v) => ({ displayOrder: v })),
      ...ifDefined(scalarData.color, (v) => ({ color: v })),

      rate: scalarData.rate,
      deductibilityPercent: scalarData.deductibilityPercent,

      validFrom: scalarData.validFrom,
      validTo: scalarData.validTo,

      vatNature: connectOrDisconnectById(scalarData.vatNatureId),
    }) satisfies Prisma.TaxRuleUpdateInput;

    const taxRule = await prisma.taxRule.update({
      where: { id },
      data,
      include: {
        vatNature: { select: { id: true, code: true } },
        translations: true,
      },
    });

    sendSuccess(res, taxRule, { message: "Tax Rule aggiornata con successo" });
  },
);

/**
 * @desc   Toggle active status of a Tax Rule
 * @route  PATCH /api/tax/rules/:id/toggle-active
 * @access Private (tax:update)
 */
export const toggleTaxRuleActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;
    const { active } = req.validatedBody as ToggleTaxStatusInput;

    const existing = await prisma.taxRule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Tax Rule non trovata");

    const taxRule = await prisma.taxRule.update({
      where: { id },
      data: { active },
      include: { vatNature: { select: { id: true, code: true } } },
    });

    sendSuccess(res, taxRule, {
      message: `Tax Rule ${active ? "attivata" : "disattivata"} con successo`,
    });
  },
);

/**
 * @desc   Delete a Tax Rule (blocked if in use)
 * @route  DELETE /api/tax/rules/:id
 * @access Private (tax:delete)
 */
export const deleteTaxRule = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id },
      include: {
        products: { select: { id: true } },
        documentLines: { select: { id: true } },
        customers: { select: { id: true } },
      },
    });

    if (!taxRule) throw new NotFoundError("Tax Rule non trovata");

    const totalUsage =
      taxRule.products.length +
      taxRule.documentLines.length +
      taxRule.customers.length;

    if (totalUsage > 0) {
      throw new BadRequestError(
        `Impossibile eliminare: Tax Rule in uso (prodotti: ${taxRule.products.length}, righe documento: ${taxRule.documentLines.length}, clienti: ${taxRule.customers.length})`,
      );
    }

    await prisma.taxRule.delete({ where: { id } });
    sendDeleted(res);
  },
);

// ============================================================================
// TAX RULE TRANSLATION CONTROLLER
// ============================================================================

/**
 * @desc   Create a translation for a Tax Rule
 * @route  POST /api/tax/rules/:id/translations
 * @access Private (tax:update)
 */
export const createTaxRuleTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;
    const translationData = req.validatedBody as CreateTaxRuleTranslationInput;

    const taxRule = await prisma.taxRule.findUnique({ where: { id } });
    if (!taxRule) throw new NotFoundError("Tax Rule non trovata");

    const existing = await prisma.taxRuleTranslation.findUnique({
      where: {
        taxRuleId_languageId: {
          taxRuleId: id,
          languageId: translationData.languageId,
        },
      },
    });
    if (existing)
      throw new ConflictError("Traduzione già esistente per questa lingua");

    const translation = await prisma.taxRuleTranslation.create({
      data: { ...translationData, taxRuleId: id },
    });

    sendCreated(res, translation, "Traduzione creata con successo");
  },
);

/**
 * @desc   Update a Tax Rule translation
 * @route  PUT /api/tax/rules/:taxRuleId/translations/:languageId
 * @access Private (tax:update)
 */
export const updateTaxRuleTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { taxRuleId, languageId } =
      req.validatedParams as TaxRuleTranslationIdParam;
    const updateData = req.validatedBody as UpdateTaxRuleTranslationInput;

    const translation = await prisma.taxRuleTranslation.update({
      where: { taxRuleId_languageId: { taxRuleId, languageId } },
      data: updateData,
    });

    sendSuccess(res, translation, {
      message: "Traduzione aggiornata con successo",
    });
  },
);

/**
 * @desc   Delete a Tax Rule translation
 * @route  DELETE /api/tax/rules/:taxRuleId/translations/:languageId
 * @access Private (tax:delete)
 */
export const deleteTaxRuleTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { taxRuleId, languageId } =
      req.validatedParams as TaxRuleTranslationIdParam;

    await prisma.taxRuleTranslation.delete({
      where: { taxRuleId_languageId: { taxRuleId, languageId } },
    });

    sendDeleted(res);
  },
);

// ============================================================================
// VAT NATURE CONTROLLER
// ============================================================================

/**
 * @desc   List all VAT Natures
 * @route  GET /api/tax/vat-natures
 * @access Private (tax:read)
 */
export const getAllVatNatures = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      active,
      category,
      validForSales,
      validForPurchases,
      search,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.validatedQuery as VatNatureQueryInput;

    const where: Prisma.VatNatureWhereInput = {};

    if (active !== undefined) where.active = active;
    if (category) where.category = category;
    if (validForSales !== undefined) where.validForSales = validForSales;
    if (validForPurchases !== undefined)
      where.validForPurchases = validForPurchases;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const vatNatures = await prisma.vatNature.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        translations: {
          include: {
            language: { select: { id: true, name: true, iso_code: true } },
          },
        },
      },
    });

    sendSuccess(res, vatNatures, { results: vatNatures.length });
  },
);

/**
 * @desc   Get VAT Nature by ID
 * @route  GET /api/tax/vat-natures/:id
 * @access Private (tax:read)
 */
export const getVatNatureById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as VatNatureIdParam;

    const vatNature = await prisma.vatNature.findUnique({
      where: { id },
      include: {
        translations: { include: { language: true } },
        taxRules: { select: { id: true, code: true, name: true, rate: true } },
        replacedBy: { select: { id: true, code: true } },
        replacements: { select: { id: true, code: true } },
      },
    });

    if (!vatNature) throw new NotFoundError("Natura IVA non trovata");

    sendSuccess(res, vatNature);
  },
);

/**
 * @desc   Create a new VAT Nature
 * @route  POST /api/tax/vat-natures
 * @access Private (tax:create)
 */
export const createVatNature = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { translations, ...data } = req.validatedBody as CreateVatNatureInput;

    const existing = await prisma.vatNature.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new ConflictError("Codice Natura IVA già esistente");

    const vatNature = await prisma.vatNature.create({
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined,
        translations: translations?.length
          ? {
              create: translations.map((t) => ({
                languageId: t.languageId,
                description: t.description,
                notes: t.notes,
              })),
            }
          : undefined,
      },
      include: { translations: true },
    });

    sendCreated(res, vatNature, "Natura IVA creata con successo");
  },
);

/**
 * @desc   Update a VAT Nature
 * @route  PUT /api/tax/vat-natures/:id
 * @access Private (tax:update)
 */
export const updateVatNature = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as VatNatureIdParam;
    const { translations: _translations, ...scalarData } =
      req.validatedBody as UpdateVatNatureInput;

    const existing = await prisma.vatNature.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Natura IVA non trovata");

    const data = clean({
      category: scalarData.category,
      description: scalarData.description,
      extendedDescription: scalarData.extendedDescription,
      legalReference: scalarData.legalReference,
      applicableToEntityTypes: scalarData.applicableToEntityTypes,
      validForSales: scalarData.validForSales,
      validForPurchases: scalarData.validForPurchases,
      vatReturnLine: scalarData.vatReturnLine,
      requiresNormReference: scalarData.requiresNormReference,
      usageExamples: scalarData.usageExamples,
      operationalNotes: scalarData.operationalNotes,
      active: scalarData.active,
      displayOrder: scalarData.displayOrder,
      validFrom: toRequiredDate(scalarData.validFrom ?? undefined),
      validTo: toDate(scalarData.validTo ?? undefined),

      replacedBy: connectOrDisconnectByCode(scalarData.replacedByCode),
    }) satisfies Prisma.VatNatureUpdateInput;

    const vatNature = await prisma.vatNature.update({
      where: { id },
      data,
      include: { translations: true },
    });

    sendSuccess(res, vatNature, {
      message: "Natura IVA aggiornata con successo",
    });
  },
);

/**
 * @desc   Toggle active status of a VAT Nature
 * @route  PATCH /api/tax/vat-natures/:id/toggle-active
 * @access Private (tax:update)
 */
export const toggleVatNatureActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as VatNatureIdParam;
    const { active } = req.validatedBody as ToggleTaxStatusInput;

    const existing = await prisma.vatNature.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Natura IVA non trovata");

    const vatNature = await prisma.vatNature.update({
      where: { id },
      data: { active },
    });

    sendSuccess(res, vatNature, {
      message: `Natura IVA ${active ? "attivata" : "disattivata"} con successo`,
    });
  },
);

/**
 * @desc   Delete a VAT Nature (blocked if linked to Tax Rules)
 * @route  DELETE /api/tax/vat-natures/:id
 * @access Private (tax:delete)
 */
export const deleteVatNature = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as VatNatureIdParam;

    const vatNature = await prisma.vatNature.findUnique({
      where: { id },
      include: { taxRules: { select: { id: true } } },
    });

    if (!vatNature) throw new NotFoundError("Natura IVA non trovata");

    if (vatNature.taxRules.length > 0) {
      throw new BadRequestError(
        `Impossibile eliminare: Natura IVA usata da ${vatNature.taxRules.length} regole fiscali`,
      );
    }

    await prisma.vatNature.delete({ where: { id } });
    sendDeleted(res);
  },
);

// ============================================================================
// VAT NATURE TRANSLATION CONTROLLER
// ============================================================================

/**
 * @desc   Create a translation for a VAT Nature
 * @route  POST /api/tax/vat-natures/:id/translations
 * @access Private (tax:update)
 */
export const createVatNatureTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as VatNatureIdParam;
    const translationData =
      req.validatedBody as CreateVatNatureTranslationInput;

    const vatNature = await prisma.vatNature.findUnique({ where: { id } });
    if (!vatNature) throw new NotFoundError("Natura IVA non trovata");

    const existing = await prisma.vatNatureTranslation.findUnique({
      where: {
        vatNatureId_languageId: {
          vatNatureId: id,
          languageId: translationData.languageId,
        },
      },
    });
    if (existing)
      throw new ConflictError("Traduzione già esistente per questa lingua");

    const translation = await prisma.vatNatureTranslation.create({
      data: { ...translationData, vatNatureId: id },
    });

    sendCreated(res, translation, "Traduzione creata con successo");
  },
);

/**
 * @desc   Update a VAT Nature translation
 * @route  PUT /api/tax/vat-natures/:vatNatureId/translations/:languageId
 * @access Private (tax:update)
 */
export const updateVatNatureTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { vatNatureId, languageId } =
      req.validatedParams as VatNatureTranslationIdParam;
    const updateData = req.validatedBody as UpdateVatNatureTranslationInput;

    const translation = await prisma.vatNatureTranslation.update({
      where: { vatNatureId_languageId: { vatNatureId, languageId } },
      data: updateData,
    });

    sendSuccess(res, translation, {
      message: "Traduzione aggiornata con successo",
    });
  },
);

/**
 * @desc   Delete a VAT Nature translation
 * @route  DELETE /api/tax/vat-natures/:vatNatureId/translations/:languageId
 * @access Private (tax:delete)
 */
export const deleteVatNatureTranslation = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { vatNatureId, languageId } =
      req.validatedParams as VatNatureTranslationIdParam;

    await prisma.vatNatureTranslation.delete({
      where: { vatNatureId_languageId: { vatNatureId, languageId } },
    });

    sendDeleted(res);
  },
);
