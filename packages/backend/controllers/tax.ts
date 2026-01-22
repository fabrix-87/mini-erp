import { Response } from "express";
import { prisma } from "../config/prisma-client";
import { Prisma } from "../generated/prisma/client";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import asyncHandler from "@/middleware/async-handler";
import {
  CreateTaxRateInput,
  CreateTaxRuleInput,
  TaxRateIdParam,
  TaxRateQueryInput,
  TaxRuleIdParam,
  TaxRuleQueryInput,
  ToggleTaxStatusInput,
  UpdateTaxRateInput,
  UpdateTaxRuleInput,
} from "@mini-erp/shared";

// ============================================================================
// TAX RATE CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Tax Rates
 * @route   GET /api/tax/rates
 * @access  Private (tax:read)
 */
export const getAllTaxRates = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      active,
      sortBy = "rate",
      sortOrder = "asc",
    } = req.validatedQuery as TaxRateQueryInput;

    const where: Prisma.TaxRateWhereInput = {};

    if (active !== undefined) {
      where.active = active;
    }

    const taxRates = await prisma.taxRate.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
      include: {
        rules: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: taxRates,
      count: taxRates.length,
    });
  },
);

/**
 * @desc    Ottieni Tax Rate per ID
 * @route   GET /api/tax/rates/:id
 * @access  Private (tax:read)
 */
export const getTaxRateById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRateIdParam;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
      include: {
        rules: {
          include: {
            taxRuleTranslations: true,
          },
        },
      },
    });

    if (!taxRate) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rate non trovata",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: taxRate,
    });
  },
);

/**
 * @desc    Crea nuova Tax Rate
 * @route   POST /api/tax/rates
 * @access  Private (tax:create)
 */
export const createTaxRate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      rate,
      name,
      active = true,
    } = req.validatedBody as CreateTaxRateInput;

    // Verifica unicità rate
    const existingRate = await prisma.taxRate.findUnique({
      where: { rate: new Prisma.Decimal(rate) },
    });

    if (existingRate) {
      res.status(400).json({
        status: "fail",
        message: "Aliquota già esistente",
      });
      return;
    }

    // Verifica unicità name
    const existingName = await prisma.taxRate.findUnique({
      where: { name },
    });

    if (existingName) {
      res.status(400).json({
        status: "fail",
        message: "Nome già esistente",
      });
      return;
    }

    const taxRate = await prisma.taxRate.create({
      data: {
        rate: new Prisma.Decimal(rate),
        name,
        active,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Tax Rate creata con successo",
      data: taxRate,
    });
  },
);

/**
 * @desc    Aggiorna Tax Rate
 * @route   PUT /api/tax/rates/:id
 * @access  Private (tax:update)
 */
export const updateTaxRate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRateIdParam;
    const { rate, name, active } = req.validatedBody as UpdateTaxRateInput;

    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!existingTaxRate) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rate non trovata",
      });
      return;
    }

    // Se rate cambia, verifica unicità
    if (rate && Prisma.Decimal(rate) !== existingTaxRate.rate) {
      const duplicateRate = await prisma.taxRate.findUnique({
        where: { rate: new Prisma.Decimal(rate) },
      });

      if (duplicateRate) {
        res.status(400).json({
          status: "fail",
          message: "Aliquota già esistente",
        });
        return;
      }
    }

    // Se name cambia, verifica unicità
    if (name && name !== existingTaxRate.name) {
      const duplicateName = await prisma.taxRate.findUnique({
        where: { name },
      });

      if (duplicateName) {
        res.status(400).json({
          status: "fail",
          message: "Nome già esistente",
        });
        return;
      }
    }

    const updateData: any = {};
    if (rate !== undefined) updateData.rate = new Prisma.Decimal(rate);
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;

    const taxRate = await prisma.taxRate.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: "success",
      message: "Tax Rate aggiornata con successo",
      data: taxRate,
    });
  },
);

/**
 * @desc    Toggle active status Tax Rate
 * @route   PATCH /api/tax/rates/:id/toggle-active
 * @access  Private (tax:update)
 */
export const toggleTaxRateActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRateIdParam;
    const { active } = req.validatedBody as ToggleTaxStatusInput;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
    });

    if (!taxRate) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rate non trovata",
      });
      return;
    }

    const updatedTaxRate = await prisma.taxRate.update({
      where: { id },
      data: { active },
    });

    res.status(200).json({
      status: "success",
      message: `Tax Rate ${active ? "attivata" : "disattivata"} con successo`,
      data: updatedTaxRate,
    });
  },
);

/**
 * @desc    Elimina Tax Rate
 * @route   DELETE /api/tax/rates/:id
 * @access  Private (tax:delete)
 */
export const deleteTaxRate = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRateIdParam;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id },
      include: {
        rules: {
          select: { id: true },
        },
      },
    });

    if (!taxRate) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rate non trovata",
      });
      return;
    }

    if (taxRate.rules.length > 0) {
      res.status(400).json({
        status: "fail",
        message: "Impossibile eliminare: Tax Rate associata a regole esistenti",
        rulesCount: taxRate.rules.length,
      });
      return;
    }

    await prisma.taxRate.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Tax Rate eliminata con successo",
    });
  },
);

// ============================================================================
// TAX RULE CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Tax Rules
 * @route   GET /api/tax/rules
 * @access  Private (tax:read)
 */
export const getAllTaxRules = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      active,
      operationType,
      sortBy = "code",
      sortOrder = "asc",
    } = req.validatedQuery as TaxRuleQueryInput;

    const where: Prisma.TaxRuleWhereInput = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (operationType) {
      where.operationType = operationType;
    }

    const taxRules = await prisma.taxRule.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        taxRate: true,
        taxRuleTranslations: {
          include: {
            language: {
              select: {
                id: true,
                name: true,
                iso_code: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      data: taxRules,
      count: taxRules.length,
    });
  },
);

/**
 * @desc    Ottieni Tax Rule per ID
 * @route   GET /api/tax/rules/:id
 * @access  Private (tax:read)
 */
export const getTaxRuleById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id },
      include: {
        taxRate: true,
        taxRuleTranslations: {
          include: {
            language: true,
          },
        },
        products: {
          select: {
            id: true,
            reference: true,
          },
          take: 10,
        },
        documentLines: {
          select: {
            id: true,
            documentId: true,
          },
          take: 10,
        },
        customers: {
          select: {
            id: true,
            company: {
              select: {
                companyName: true,
              },
            },
          },
          take: 10,
        },
      },
    });

    if (!taxRule) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rule non trovata",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: taxRule,
    });
  },
);

/**
 * @desc    Crea nuova Tax Rule
 * @route   POST /api/tax/rules
 * @access  Private (tax:create)
 */
export const createTaxRule = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const {
      code,
      name,
      description,
      operationType,
      taxRateId,
      active = true,
      translations,
    } = req.validatedBody as CreateTaxRuleInput;

    // Verifica unicità code
    const existingCode = await prisma.taxRule.findUnique({
      where: { code },
    });

    if (existingCode) {
      res.status(400).json({
        status: "fail",
        message: "Codice già esistente",
      });
      return;
    }

    // Verifica esistenza Tax Rate
    const taxRate = await prisma.taxRate.findUnique({
      where: { id: taxRateId },
    });

    if (!taxRate) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rate non trovata",
      });
      return;
    }

    const taxRule = await prisma.taxRule.create({
      data: {
        code,
        name,
        description,
        operationType,
        taxRateId,
        active,
        taxRuleTranslations: translations
          ? {
              create: translations.map((t: any) => ({
                languageId: t.languageId,
                name: t.name,
              })),
            }
          : undefined,
      },
      include: {
        taxRate: true,
        taxRuleTranslations: true,
      },
    });

    res.status(201).json({
      status: "success",
      message: "Tax Rule creata con successo",
      data: taxRule,
    });
  },
);

/**
 * @desc    Aggiorna Tax Rule
 * @route   PUT /api/tax/rules/:id
 * @access  Private (tax:update)
 */
export const updateTaxRule = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;
    const { code, name, description, operationType, taxRateId, active } =
      req.validatedBody as UpdateTaxRuleInput;

    const existingTaxRule = await prisma.taxRule.findUnique({
      where: { id },
    });

    if (!existingTaxRule) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rule non trovata",
      });
      return;
    }

    // Se code cambia, verifica unicità
    if (code && code !== existingTaxRule.code) {
      const duplicateCode = await prisma.taxRule.findUnique({
        where: { code },
      });

      if (duplicateCode) {
        res.status(400).json({
          status: "fail",
          message: "Codice già esistente",
        });
        return;
      }
    }

    // Se taxRateId cambia, verifica esistenza
    if (taxRateId && taxRateId !== existingTaxRule.taxRateId) {
      const taxRate = await prisma.taxRate.findUnique({
        where: { id: taxRateId },
      });

      if (!taxRate) {
        res.status(404).json({
          status: "fail",
          message: "Tax Rate non trovata",
        });
        return;
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (operationType !== undefined) updateData.operationType = operationType;
    if (taxRateId !== undefined) updateData.taxRateId = taxRateId;
    if (active !== undefined) updateData.active = active;

    const taxRule = await prisma.taxRule.update({
      where: { id },
      data: updateData,
      include: {
        taxRate: true,
        taxRuleTranslations: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Tax Rule aggiornata con successo",
      data: taxRule,
    });
  },
);

/**
 * @desc    Toggle active status Tax Rule
 * @route   PATCH /api/tax/rules/:id/toggle-active
 * @access  Private (tax:update)
 */
export const toggleTaxRuleActive = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as TaxRuleIdParam;
    const { active } = req.validatedBody as ToggleTaxStatusInput;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id },
    });

    if (!taxRule) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rule non trovata",
      });
      return;
    }

    const updatedTaxRule = await prisma.taxRule.update({
      where: { id },
      data: { active },
      include: {
        taxRate: true,
      },
    });

    res.status(200).json({
      status: "success",
      message: `Tax Rule ${active ? "attivata" : "disattivata"} con successo`,
      data: updatedTaxRule,
    });
  },
);

/**
 * @desc    Elimina Tax Rule
 * @route   DELETE /api/tax/rules/:id
 * @access  Private (tax:delete)
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

    if (!taxRule) {
      res.status(404).json({
        status: "fail",
        message: "Tax Rule non trovata",
      });
      return;
    }

    const totalUsage =
      taxRule.products.length +
      taxRule.documentLines.length +
      taxRule.customers.length;

    if (totalUsage > 0) {
      res.status(400).json({
        status: "fail",
        message: "Impossibile eliminare: Tax Rule in uso",
        usage: {
          products: taxRule.products.length,
          documentLines: taxRule.documentLines.length,
          customers: taxRule.customers.length,
        },
      });
      return;
    }

    await prisma.taxRule.delete({
      where: { id },
    });

    res.status(200).json({
      status: "success",
      message: "Tax Rule eliminata con successo",
    });
  },
);
