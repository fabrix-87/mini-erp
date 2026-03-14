import { Response, NextFunction } from "express";
import {
  buildSupplierWhereClause,  
  getSupplierInclude,
  generateCompanyCode,
} from "../helpers/company";

import {
  calculateSupplierStats,
  validateFiscalData,
} from "../utils/company";
import { formatPaginatedResponse } from "../utils/response";
import { AuthenticatedValidatedRequest } from '@/types/validate';

import { prisma } from "../config/prisma-client";
import { buildPagination } from "@/utils/query";

// ============================================================================
// SUPPLIER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i suppliers
 * @route   GET /api/suppliers
 * @access  Private (supplier:read)
 */
export const getAllSuppliers = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = 1, limit = 10, ...filters } = req.query;

    const where = buildSupplierWhereClause(filters as any);
    const { skip, take } = buildPagination(Number(page), Number(limit));

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take,
        include: getSupplierInclude(false),
        orderBy: { id: "desc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    res.json(
      formatPaginatedResponse(suppliers, total, Number(page), Number(limit))
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni supplier per ID
 * @route   GET /api/suppliers/:id
 * @access  Private (supplier:read)
 */
export const getSupplierById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: getSupplierInclude(true),
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    const stats = calculateSupplierStats(supplier);

    res.json({
      success: true,
      data: {
        ...supplier,
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Crea nuovo supplier (con company)
 * @route   POST /api/suppliers
 * @access  Private (supplier:create)
 */
export const createSupplier = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { company: companyData, ...supplierData } = req.validatedBody;

    // Genera codice company se non fornito
    if (!companyData.code) {
      companyData.code = await generateCompanyCode(prisma, "SUP");
    }

    // Valida dati fiscali
    const fiscalValidation = validateFiscalData({
      entityType: companyData.entityType,
      countryCode: companyData.countryCode,
      vatNumber: companyData.vatNumber,
      taxCode: companyData.taxCode,
      sdiCode: companyData.sdiCode,
      pec: companyData.pec,
    });

    if (!fiscalValidation.valid) {
      res.status(400).json({
        success: false,
        message: "Dati fiscali non validi",
        errors: fiscalValidation.errors,
      });
      return;
    }

    // Verifica unicità codice
    const existingCode = await prisma.company.findUnique({
      where: { code: companyData.code },
    });

    if (existingCode) {
      res.status(400).json({
        success: false,
        message: "Codice company già esistente",
      });
      return;
    }

    // Verifica country esiste
    const country = await prisma.country.findUnique({
      where: { code: companyData.countryCode },
    });

    if (!country) {
      res.status(404).json({
        success: false,
        message: "Paese non trovato",
      });
      return;
    }

    // Crea company e supplier in transazione
    const supplier = await prisma.supplier.create({
      data: {
        ...supplierData,
        company: {
          create: companyData,
        },
      },
      include: getSupplierInclude(true),
    });

    res.status(201).json({
      success: true,
      message: "Supplier creato con successo",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private (supplier:update)
 */
export const updateSupplier = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const data = req.validatedBody;

    const existing = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    const supplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data,
      include: getSupplierInclude(true),
    });

    res.json({
      success: true,
      message: "Supplier aggiornato con successo",
      data: supplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna company del supplier
 * @route   PUT /api/suppliers/:id/company
 * @access  Private (supplier:update)
 */
export const updateSupplierCompany = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const companyData = req.validatedBody;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: { company: true },
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    // Valida dati fiscali se modificati
    if (
      companyData.entityType ||
      companyData.countryCode ||
      companyData.vatNumber ||
      companyData.taxCode ||
      companyData.sdiCode ||
      companyData.pec
    ) {
      const fiscalValidation = validateFiscalData({
        entityType: companyData.entityType || supplier.company.entityType,
        countryCode: companyData.countryCode || supplier.company.countryCode,
        vatNumber:
          companyData.vatNumber !== undefined
            ? companyData.vatNumber
            : supplier.company.vatNumber,
        taxCode:
          companyData.taxCode !== undefined
            ? companyData.taxCode
            : supplier.company.taxCode,
        sdiCode:
          companyData.sdiCode !== undefined
            ? companyData.sdiCode
            : supplier.company.sdiCode,
        pec:
          companyData.pec !== undefined
            ? companyData.pec
            : supplier.company.pec,
      });

      if (!fiscalValidation.valid) {
        res.status(400).json({
          success: false,
          message: "Dati fiscali non validi",
          errors: fiscalValidation.errors,
        });
        return;
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: {
        company: {
          update: companyData,
        },
      },
      include: getSupplierInclude(true),
    });

    res.json({
      success: true,
      message: "Company aggiornata con successo",
      data: updatedSupplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Aggiorna rating supplier
 * @route   PATCH /api/suppliers/:id/rating
 * @access  Private (supplier:update)
 */
export const updateSupplierRating = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;
    const { rating, notes } = req.validatedBody;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id: parseInt(id) },
      data: { rating },
      include: getSupplierInclude(false),
    });

    // Se fornite note, creiamole
    if (notes) {
      await prisma.companyNote.create({
        data: {
          companyId: supplier.companyId,
          title: `Rating aggiornato: ${supplier.rating} → ${rating} stelle`,
          content: notes,
          authorId: (req as any).user.id,
        },
      });
    }

    res.json({
      success: true,
      message: "Rating aggiornato",
      data: updatedSupplier,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ottieni statistiche supplier
 * @route   GET /api/suppliers/:id/stats
 * @access  Private (supplier:read)
 */
export const getSupplierStats = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            documentsIn: true,
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    const [recentOrders, topProducts] = await Promise.all([
      // Ultimi ordini
      prisma.document.findMany({
        where: {
          supplierId: supplier.id,
          documentType: { in: ["SUPPLIER_ORDER", "INVOICE"] },
        },
        orderBy: { documentDate: "desc" },
        take: 10,
        select: {
          id: true,
          documentNumber: true,
          documentType: true,
          documentDate: true,
          totalAmount: true,
          status: true,
        },
      }),

      // Prodotti forniti più ordinati
      prisma.product.findMany({
        where: {
          supplierId: supplier.id,
        },
        select: {
          id: true,
          reference: true,
          translations: {
            take: 1,
            select: { name: true },
          },
          _count: {
            select: {
              documentLines: true,
            },
          },
        },
        orderBy: {
          documentLines: {
            _count: "desc",
          },
        },
        take: 10,
      }),
    ]);

    const stats = calculateSupplierStats(supplier);

    res.json({
      success: true,
      data: {
        summary: stats,
        recentOrders,
        topProducts: topProducts.map((p) => ({
          productId: p.id,
          productName: p.translations[0]?.name || p.reference,
          orderCount: p._count.documentLines,
        })),
        totals: {
          orders: supplier._count.documentsIn,
          products: supplier._count.products,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Elimina supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private (supplier:delete)
 */
export const deleteSupplier = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.validatedParams;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            documentsIn: true,
            products: true,
          },
        },
      },
    });

    if (!supplier) {
      res.status(404).json({
        success: false,
        message: "Supplier non trovato",
      });
      return;
    }

    const totalRelations =
      supplier._count.documentsIn + supplier._count.products;

    if (totalRelations > 0) {
      res.status(400).json({
        success: false,
        message: `Impossibile eliminare: Supplier ha ${totalRelations} relazioni attive`,
        details: {
          documents: supplier._count.documentsIn,
          products: supplier._count.products,
        },
      });
      return;
    }

    // Elimina supplier (cascade elimina anche company)
    await prisma.supplier.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Supplier eliminato con successo",
    });
  } catch (error) {
    next(error);
  }
};
