import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma-client';
import { Prisma } from '../generated/prisma/client';
import { AuthenticatedValidatedRequest } from '@/types/validate';

// ============================================================================
// TAX RATE CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Tax Rates
 * @route   GET /api/tax/rates
 * @access  Private (tax:read)
 */
export const getAllTaxRates = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { active, sortBy = 'rate', sortOrder = 'asc' } = req.query;

    const where: Prisma.TaxRateWhereInput = {};

    if (active !== undefined) {
      where.active = active === 'true';
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
      success: true,
      data: taxRates,
      count: taxRates.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni Tax Rate per ID
 * @route   GET /api/tax/rates/:id
 * @access  Private (tax:read)
 */
export const getTaxRateById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: parseInt(id) },
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
        success: false,
        message: 'Tax Rate non trovata',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: taxRate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuova Tax Rate
 * @route   POST /api/tax/rates
 * @access  Private (tax:create)
 */
export const createTaxRate = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rate, name, active = true } = req.validatedBody;

    // Verifica unicità rate
    const existingRate = await prisma.taxRate.findUnique({
      where: { rate: new Prisma.Decimal(rate) },
    });

    if (existingRate) {
      res.status(400).json({
        success: false,
        message: 'Aliquota già esistente',
      });
      return;
    }

    // Verifica unicità name
    const existingName = await prisma.taxRate.findUnique({
      where: { name },
    });

    if (existingName) {
      res.status(400).json({
        success: false,
        message: 'Nome già esistente',
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
      success: true,
      message: 'Tax Rate creata con successo',
      data: taxRate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna Tax Rate
 * @route   PUT /api/tax/rates/:id
 * @access  Private (tax:update)
 */
export const updateTaxRate = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { rate, name, active } = req.validatedBody;

    const existingTaxRate = await prisma.taxRate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTaxRate) {
      res.status(404).json({
        success: false,
        message: 'Tax Rate non trovata',
      });
      return;
    }

    // Se rate cambia, verifica unicità
    if (rate && rate !== existingTaxRate.rate.toString()) {
      const duplicateRate = await prisma.taxRate.findUnique({
        where: { rate: new Prisma.Decimal(rate) },
      });

      if (duplicateRate) {
        res.status(400).json({
          success: false,
          message: 'Aliquota già esistente',
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
          success: false,
          message: 'Nome già esistente',
        });
        return;
      }
    }

    const updateData: any = {};
    if (rate !== undefined) updateData.rate = new Prisma.Decimal(rate);
    if (name !== undefined) updateData.name = name;
    if (active !== undefined) updateData.active = active;

    const taxRate = await prisma.taxRate.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'Tax Rate aggiornata con successo',
      data: taxRate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle active status Tax Rate
 * @route   PATCH /api/tax/rates/:id/toggle-active
 * @access  Private (tax:update)
 */
export const toggleTaxRateActive = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { active } = req.validatedBody;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: parseInt(id) },
    });

    if (!taxRate) {
      res.status(404).json({
        success: false,
        message: 'Tax Rate non trovata',
      });
      return;
    }

    const updatedTaxRate = await prisma.taxRate.update({
      where: { id: parseInt(id) },
      data: { active },
    });

    res.status(200).json({
      success: true,
      message: `Tax Rate ${active ? 'attivata' : 'disattivata'} con successo`,
      data: updatedTaxRate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Tax Rate
 * @route   DELETE /api/tax/rates/:id
 * @access  Private (tax:delete)
 */
export const deleteTaxRate = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const taxRate = await prisma.taxRate.findUnique({
      where: { id: parseInt(id) },
      include: {
        rules: {
          select: { id: true },
        },
      },
    });

    if (!taxRate) {
      res.status(404).json({
        success: false,
        message: 'Tax Rate non trovata',
      });
      return;
    }

    if (taxRate.rules.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Impossibile eliminare: Tax Rate associata a regole esistenti',
        rulesCount: taxRate.rules.length,
      });
      return;
    }

    await prisma.taxRate.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Tax Rate eliminata con successo',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// TAX RULE CONTROLLER
// ============================================================================

/**
 * @desc    Ottieni tutte le Tax Rules
 * @route   GET /api/tax/rules
 * @access  Private (tax:read)
 */
export const getAllTaxRules = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { active, operationType, sortBy = 'code', sortOrder = 'asc' } = req.query;

    const where: Prisma.TaxRuleWhereInput = {};

    if (active !== undefined) {
      where.active = active === 'true';
    }

    if (operationType) {
      where.operationType = operationType as string;
    }

    const taxRules = await prisma.taxRule.findMany({
      where,
      orderBy: { [sortBy as string]: sortOrder },
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
      success: true,
      data: taxRules,
      count: taxRules.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni Tax Rule per ID
 * @route   GET /api/tax/rules/:id
 * @access  Private (tax:read)
 */
export const getTaxRuleById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id: parseInt(id) },
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
        success: false,
        message: 'Tax Rule non trovata',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: taxRule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuova Tax Rule
 * @route   POST /api/tax/rules
 * @access  Private (tax:create)
 */
export const createTaxRule = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      code,
      name,
      description,
      operationType,
      taxRateId,
      active = true,
      translations,
    } = req.validatedBody;

    // Verifica unicità code
    const existingCode = await prisma.taxRule.findUnique({
      where: { code },
    });

    if (existingCode) {
      res.status(400).json({
        success: false,
        message: 'Codice già esistente',
      });
      return;
    }

    // Verifica esistenza Tax Rate
    const taxRate = await prisma.taxRate.findUnique({
      where: { id: taxRateId },
    });

    if (!taxRate) {
      res.status(404).json({
        success: false,
        message: 'Tax Rate non trovata',
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
      success: true,
      message: 'Tax Rule creata con successo',
      data: taxRule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna Tax Rule
 * @route   PUT /api/tax/rules/:id
 * @access  Private (tax:update)
 */
export const updateTaxRule = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { code, name, description, operationType, taxRateId, active } = req.validatedBody;

    const existingTaxRule = await prisma.taxRule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTaxRule) {
      res.status(404).json({
        success: false,
        message: 'Tax Rule non trovata',
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
          success: false,
          message: 'Codice già esistente',
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
          success: false,
          message: 'Tax Rate non trovata',
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
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        taxRate: true,
        taxRuleTranslations: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Tax Rule aggiornata con successo',
      data: taxRule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle active status Tax Rule
 * @route   PATCH /api/tax/rules/:id/toggle-active
 * @access  Private (tax:update)
 */
export const toggleTaxRuleActive = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { active } = req.validatedBody;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id: parseInt(id) },
    });

    if (!taxRule) {
      res.status(404).json({
        success: false,
        message: 'Tax Rule non trovata',
      });
      return;
    }

    const updatedTaxRule = await prisma.taxRule.update({
      where: { id: parseInt(id) },
      data: { active },
      include: {
        taxRate: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Tax Rule ${active ? 'attivata' : 'disattivata'} con successo`,
      data: updatedTaxRule,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina Tax Rule
 * @route   DELETE /api/tax/rules/:id
 * @access  Private (tax:delete)
 */
export const deleteTaxRule = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const taxRule = await prisma.taxRule.findUnique({
      where: { id: parseInt(id) },
      include: {
        products: { select: { id: true } },
        documentLines: { select: { id: true } },
        customers: { select: { id: true } },
      },
    });

    if (!taxRule) {
      res.status(404).json({
        success: false,
        message: 'Tax Rule non trovata',
      });
      return;
    }

    const totalUsage =
      taxRule.products.length + taxRule.documentLines.length + taxRule.customers.length;

    if (totalUsage > 0) {
      res.status(400).json({
        success: false,
        message: 'Impossibile eliminare: Tax Rule in uso',
        usage: {
          products: taxRule.products.length,
          documentLines: taxRule.documentLines.length,
          customers: taxRule.customers.length,
        },
      });
      return;
    }

    await prisma.taxRule.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({
      success: true,
      message: 'Tax Rule eliminata con successo',
    });
  } catch (error) {
    next(error);
  }
};