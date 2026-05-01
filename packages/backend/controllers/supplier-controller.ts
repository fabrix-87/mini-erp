import {
  buildSupplierWhereClause,
  generateUniqueCompanyCode,
  getSupplierInclude,
} from "../helpers/company-helper";

import {
  calculateSupplierStats,
  formatCompanyResponse,
  validateFiscalData,
} from "../utils/company-utils";
import {
  sendCreated,
  sendDeleted,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response-utils";

import { prisma } from "../config/prisma-config";
import { buildPagination } from "@/utils/query-utils";

import {
  CreateSupplierInput,
  SupplierIdParam,
  SupplierQueryInput,
  UpdateSupplierCompanyInput,
  UpdateSupplierInput,
  UpdateSupplierRatingInput,
} from "@mini-erp/shared";
import { AddressType, Prisma } from "@/generated/prisma/client";

import {
  buildAddressCreateData,
  buildCompanyCreateData,
  buildSupplierCreateData,
  buildSupplierUpdateData,
} from "@/services/company/company";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { SupplierFilters } from "@/types/company-types";

// ============================================================================
// SUPPLIER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i suppliers
 * @route   GET /api/suppliers
 * @access  Private (supplier:read)
 */
export const getAllSuppliers = async (c: Context<AppBindings>) => {
  const { page = 1, limit = 10, ...filters } = getValidatedQuery<SupplierQueryInput>(c);

  const where = buildSupplierWhereClause(filters as SupplierFilters);
  const { skip, take } = buildPagination(page, limit);

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

  return sendPaginatedResponse(c, suppliers, total, page, limit);
};

/**
 * @desc    Ottieni supplier per ID
 * @route   GET /api/suppliers/:id
 * @access  Private (supplier:read)
 */
export const getSupplierById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: getSupplierInclude(true),
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }

  const stats = calculateSupplierStats(supplier);

  return sendSuccess(c, {
    ...supplier,
    stats,
  });
};

/**
 * @desc    Crea nuovo supplier (con company)
 * @route   POST /api/suppliers
 * @access  Private (supplier:create)
 */
export const createSupplier = async (c: Context<AppBindings>) => {
  const { company: companyData, ...supplierData } = getValidatedBody<CreateSupplierInput>(c);

  // Verifica country esiste
  const country = await prisma.country.findUnique({
    where: { code: companyData.countryCode },
  });

  if (!country) {
    return sendNotFound(c, "Paese non trovato");
  }

  const supplier = await prisma.$transaction(async (tx) => {
    const code = await generateUniqueCompanyCode("supplier", tx);
    return tx.supplier.create({
      data: buildSupplierCreateData(supplierData, buildCompanyCreateData(companyData, code)),
      include: getSupplierInclude(true),
    });
  });

  return sendCreated(c, formatCompanyResponse(supplier), "Supplier creato con successo");
};

/**
 * @desc    Aggiorna supplier
 * @route   PUT /api/suppliers/:id
 * @access  Private (supplier:update)
 */
export const updateSupplier = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);
  const data = getValidatedBody<UpdateSupplierInput>(c);

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
    return sendNotFound(c, "Supplier non trovato");
  }
  if (!taxRule) {
    return sendNotFound(c, "Tax Rule non trovata");
  }
  if (!parent) {
    return sendNotFound(c, "ParentId non valido");
  }

  const supplier = await prisma.supplier.update({
    where: { id },
    data: buildSupplierUpdateData(data),
    include: getSupplierInclude(true),
  });

  return sendSuccess(c, supplier, {
    message: "Supplier aggiornato con successo",
  });
};

/**
 * @desc    Valida i dati fiscali della company del supplier
 * @route   POST /api/suppliers/:id/validate-fiscal
 * @access  Private (supplier:read)
 */
export const validateSupplierFiscal = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: { company: true },
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }

  const fiscalValidation = validateFiscalData({
    entityType: supplier.company.entityType,
    countryCode: supplier.company.countryCode,
    vatNumber: supplier.company.vatNumber,
    taxCode: supplier.company.taxCode,
    sdiCode: supplier.company.sdiCode,
    pec: supplier.company.pec,
  });

  return sendSuccess(c, {
    valid: fiscalValidation.valid,
    errors: fiscalValidation.errors ?? [],
  });
};

/**
 * @desc    Aggiorna company del supplier
 * @route   PUT /api/suppliers/:id/company
 * @access  Private (supplier:update)
 */
export const updateSupplierCompany = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);
  const companyData = getValidatedBody<UpdateSupplierCompanyInput>(c);

  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
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

  return sendSuccess(c, updatedSupplier, {
    message: "Supplier Company aggiornata con successo",
  });
};

/**
 * @desc    Aggiorna rating supplier
 * @route   PATCH /api/suppliers/:id/rating
 * @access  Private (supplier:update)
 */
export const updateSupplierRating = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);
  const { rating, notes } = getValidatedBody<UpdateSupplierRatingInput>(c);

  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }

  const updatedSupplier = await prisma.supplier.update({
    where: { id },
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
        authorId: c.get("user")!.userId,
      },
    });
  }
  return sendSuccess(c, updatedSupplier, {
    message: "Rating aggiornato",
  });
};

/**
 * @desc    Ottieni statistiche supplier
 * @route   GET /api/suppliers/:id/stats
 * @access  Private (supplier:read)
 */
export const getSupplierStats = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);

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
    return sendNotFound(c, "Supplier non trovato");
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

  return sendSuccess(c, result);
};

/**
 * @desc    Elimina supplier
 * @route   DELETE /api/suppliers/:id
 * @access  Private (supplier:delete)
 */
export const deleteSupplier = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);
  const { userId } = c.get("user")!;

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
    return sendNotFound(c, "Supplier non trovato");
  }

  const totalRelations = supplier._count.documentsIn + supplier._count.products;

  if (totalRelations > 0) {
    return c.json({
      success: false,
      statusCode: 409,
      message: `Impossibile eliminare: Supplier ha ${totalRelations} relazioni attive`,
    });
  }

  // Elimina supplier (cascade elimina anche company)
  await prisma.supplier.update({
    where: { id },
    data: {
      deletedBy: userId,
      deletedAt: new Date(),
    },
  });

  return sendDeleted(c, "Supplier eliminato con successo");
};
