import { Response, NextFunction } from "express";
import {
  buildSupplierWhereClause,
  generateUniqueCompanyCode,
  getSupplierInclude,
} from "../helpers/company";

import {
  calculateSupplierStats,
  formatCompanyResponse,
  validateFiscalData,
} from "../utils/company";
import { formatPaginatedResponse, sendCreated, sendDeleted, sendFail, sendSuccess } from "../utils/response";
import { AuthenticatedValidatedRequest } from "@/types/validate";

import { prisma } from "../config/prisma-client";
import { buildPagination } from "@/utils/query";
import asyncHandler from "@/middleware/async-handler";
import {
  CreateSupplierInput,
  SupplierIdParam,
  UpdateSupplierCompanyInput,
  UpdateSupplierInput,
} from "@mini-erp/shared";
import { AddressType, Prisma } from "@/generated/prisma/client";
import { clean, connectOrDisconnectById } from "@/helpers/prisma";
import {
  buildAddressCreateData,
  buildCompanyCreateData,
  buildSupplierCreateData,
  buildSupplierUpdateData,
} from "@/services/company/company";

// ============================================================================
// SUPPLIER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i suppliers
 * @route   GET /api/suppliers
 * @access  Private (supplier:read)
 */
export const getAllSuppliers = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
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

  res.json(formatPaginatedResponse(suppliers, total, Number(page), Number(limit)));
});

/**
 * @desc    Ottieni supplier per ID
 * @route   GET /api/suppliers/:id
 * @access  Private (supplier:read)
 */
export const getSupplierById = async (
  req: AuthenticatedValidatedRequest,
  res: Response,
  next: NextFunction,
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
export const createSupplier = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { company: companyData, ...supplierData } = req.validatedBody as CreateSupplierInput;

  // Verifica country esiste
  const country = await prisma.country.findUnique({
    where: { code: companyData.countryCode },
  });

  if (!country) {
    sendFail(res, { statusCode: 404, message: "Paese non trovato" });
    return;
  }

  const supplier = await prisma.$transaction(async (tx) => {
    const code = await generateUniqueCompanyCode("supplier", tx);
    return tx.supplier.create({
      data: buildSupplierCreateData(supplierData, buildCompanyCreateData(companyData, code)),
      include: getSupplierInclude(true),
    });
  });

  sendCreated(res, formatCompanyResponse(supplier), "Supplier creato con successo");
});

/**
 * @desc    Aggiorna supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private (supplier:update)
 */
export const updateSupplier = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as SupplierIdParam;
  const data = req.validatedBody as UpdateSupplierInput;

  const [existing, taxRule, parent] = await Promise.all([
    prisma.supplier.findUnique({
      where: { id },
    }),
    data.supplierTaxRuleId
      ? prisma.taxRule.findUnique({
          where: { id: data.supplierTaxRuleId },
          select: { id: true },
        })
      : Promise.resolve(true),
    data.parentSupplierId
      ? prisma.supplier.findUnique({
          where: { id: data.parentSupplierId },
          select: { id: true },
        })
      : Promise.resolve(true),
  ]);

  if (!existing) {
    sendFail(res, {
      statusCode: 404,
      message: "Supplier non trovato",
    });
    return;
  }
  if (!taxRule) {
    sendFail(res, { statusCode: 404, message: "Tax Rule non trovata" });
    return;
  }
  if (!parent) {
    sendFail(res, { statusCode: 404, message: "ParentId non valido" });
    return;
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: buildSupplierUpdateData(data),
    include: getSupplierInclude(true),
  });

  sendSuccess(res, supplier, {
    message: "Supplier aggiornato con successo",
  });
});

/**
 * @desc    Valida i dati fiscali della company del supplier
 * @route   POST /api/suppliers/:id/validate-fiscal
 * @access  Private (supplier:read)
 */
export const validateSupplierFiscal = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams as SupplierIdParam;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!supplier) {
      sendFail(res, { statusCode: 404, message: "Supplier non trovato" });
      return;
    }

    const fiscalValidation = validateFiscalData({
      entityType: supplier.company.entityType,
      countryCode: supplier.company.countryCode,
      vatNumber: supplier.company.vatNumber,
      taxCode: supplier.company.taxCode,
      sdiCode: supplier.company.sdiCode,
      pec: supplier.company.pec,
    });

    sendSuccess(res, {
      valid: fiscalValidation.valid,
      errors: fiscalValidation.errors ?? [],
    });
  },
);

/**
 * @desc    Aggiorna company del supplier
 * @route   PUT /api/suppliers/:id/company
 * @access  Private (supplier:update)
 */
export const updateSupplierCompany = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams as SupplierIdParam;
    const companyData = req.validatedBody as UpdateSupplierCompanyInput;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      sendFail(res, {
        statusCode: 404,
        message: "Supplier non trovato",
      });
      return;
    }
    const { legalAddress, ...companyScalarData } = companyData;

    const updatedSupplier = await prisma.$transaction(async (tx) => {
      // 1. Aggiorna i campi scalari della company
      if (Object.keys(companyScalarData).length > 0) {
        await tx.company.update({
          where: { id: supplier.companyId },
          data: companyScalarData as Prisma.CompanyUpdateInput,
        });
      }

      // 2. Upsert indirizzo legale tramite buildAddressCreateData
      if (legalAddress) {
        const addressData = buildAddressCreateData(legalAddress, {
          addressType: AddressType.LEGAL,
          isPrimary: true,
        });

        const existingLegal = await tx.companyAddress.findFirst({
          where: {
            companyId: supplier.companyId,
            addressType: AddressType.LEGAL,
          },
          select: { id: true },
        });

        if (existingLegal) {
          await tx.companyAddress.update({
            where: { id: existingLegal.id },
            data: addressData,
          });
        } else {
          await tx.companyAddress.create({
            data: { ...addressData, companyId: supplier.companyId },
          });
        }
      }

      // 3. Ritorna il customer aggiornato con tutti i dati
      return tx.supplier.findUnique({
        where: { id },
        include: getSupplierInclude(true),
      });
    });

    sendSuccess(res, updatedSupplier, {
      message: "Supplier Company aggiornata con successo",
    });
  },
);

/**
 * @desc    Aggiorna rating supplier
 * @route   PATCH /api/suppliers/:id/rating
 * @access  Private (supplier:update)
 */
export const updateSupplierRating = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams;
    const { rating, notes } = req.validatedBody;

    const supplier = await prisma.supplier.findUnique({
      where: { id: parseInt(id) },
    });

    if (!supplier) {
      sendFail(res, {
        statusCode: 404,
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
    sendSuccess(res, updatedSupplier, {
      message: "Rating aggiornato",
    });
  },
);

/**
 * @desc    Ottieni statistiche supplier
 * @route   GET /api/suppliers/:id/stats
 * @access  Private (supplier:read)
 */
export const getSupplierStats = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
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
    sendFail(res, {
      statusCode: 404,
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

  const result = {
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
  };

  sendSuccess(res, result);
});

/**
 * @desc    Elimina supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private (supplier:delete)
 */
export const deleteSupplier = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as SupplierIdParam;
  const { userId } = req.user!;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
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
    sendFail(res, {
      statusCode: 404,
      message: "Supplier non trovato",
    });
    return;
  }

  const totalRelations = supplier._count.documentsIn + supplier._count.products;

  if (totalRelations > 0) {
    sendFail(res, {
      message: `Impossibile eliminare: Supplier ha ${totalRelations} relazioni attive`,
    });
    /*
        details: {
          documents: supplier._count.documentsIn,
          products: supplier._count.products,
        },
      });
      */
    return;
  }

  // Elimina supplier (cascade elimina anche company)
  await prisma.supplier.update({
    where: { id },
    data: {
      deletedBy: userId,
      deletedAt: new Date(),
    },
  });

  sendDeleted(res, "Supplier eliminato con successo");
});
