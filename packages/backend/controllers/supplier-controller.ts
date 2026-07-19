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
  sendFail,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response-utils";

import { prisma } from "../config/prisma-config";
import { buildPagination } from "@/utils/query-utils";

import {
  CreateSupplierInput,
  SupplierFilters,
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
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { tenantFilter, withSoftDelete, withTenantId } from "@/helpers/prisma-helper";
import { createInitialCompanyVersion, storicizeCompany, syncCurrentVersion } from "@/helpers/company-version-helper";
import { upsertLegalAddress } from "@/helpers/address-helper";

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
  const tenantId = getRequiredTenantId(c);

  const where = buildSupplierWhereClause(filters as SupplierFilters, tenantId);
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
  const tenantId = getRequiredTenantId(c);

  const supplier = await prisma.supplier.findFirst({
    where: withSoftDelete(withTenantId({ id }, tenantId)),
    include: getSupplierInclude(true),
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }

  const stats = calculateSupplierStats(supplier);

  return sendSuccess(c, {
    ...formatCompanyResponse(supplier),
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
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  // Verifica country esiste
  const country = await prisma.country.findUnique({
    where: { code: companyData.countryCode },
  });

  if (!country) {
    return sendNotFound(c, "Paese non trovato");
  }

  const supplier = await prisma.$transaction(async (tx) => {
    const code = await generateUniqueCompanyCode("supplier", tenantId, tx);

    const created = await tx.supplier.create({
      data: buildSupplierCreateData(
        supplierData,
        buildCompanyCreateData(companyData, code, tenantId),
        tenantId,
      ),
      include: getSupplierInclude(true),
    });

    if (companyData.legalAddress) {
      await upsertLegalAddress(tx, created.company.id, companyData.legalAddress);
    }

    await createInitialCompanyVersion(tx, {
      companyId: created.company.id,
      tenantId,
      userId,
      companyName: created.company.companyName,
      tradeName: created.company.tradeName,
      legalForm: created.company.legalForm,
      entityType: created.company.entityType,
      vatNumber: created.company.vatNumber,
      taxCode: created.company.taxCode,
      sdiCode: created.company.sdiCode,
      pec: created.company.pec,
      eoriNumber: created.company.eoriNumber,
      vatId: created.company.vatId,
      countryCode: created.company.countryCode,
      mainEmail: created.company.mainEmail,
      mainPhone: created.company.mainPhone,
    });

    return created;
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
  const tenantId = getRequiredTenantId(c);

  const [existing, taxRule, parent] = await Promise.all([
    prisma.supplier.findFirst({
      where: withSoftDelete(withTenantId({ id }, tenantId)),
    }),
    data.supplierTaxRuleId
      ? prisma.taxRule.findUnique({
          where: { id: data.supplierTaxRuleId },
          select: { id: true },
        })
      : Promise.resolve(true),
    data.parentSupplierId
      ? prisma.supplier.findFirst({
          where: withSoftDelete(withTenantId({ id: data.parentSupplierId }, tenantId)),
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
    where: { id, tenantId },
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
  const tenantId = getRequiredTenantId(c);

  const supplier = await prisma.supplier.findFirst({
    where: withSoftDelete(withTenantId({ id }, tenantId)),
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
 * Updates the anagraphic data of a company linked to a supplier.
 * When `storicize` is provided in the body, the current supplier state is
 * historized BEFORE the update is applied, so the new CompanyVersion
 * snapshot captures the incoming (post-update) data.
 *
 * Route:   PUT /suppliers/:id/company
 * Access:  Protected — requires supplier:update permission
 */
export const updateSupplierCompany = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<SupplierIdParam>(c);
  const data = getValidatedBody<UpdateSupplierCompanyInput>(c);
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  const supplier = await prisma.supplier.findFirst({
    where: tenantFilter(tenantId, { id }),
    select: { companyId: true },
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }
  const { storicize, legalAddress, ...companyScalarData } = data;

  const result = await prisma.$transaction(async (tx) => {
    if (Object.keys(companyScalarData).length > 0) {
      await tx.company.update({
        where: { id: supplier.companyId },
        data: companyScalarData,
      });
    }

    if (legalAddress) {
      await upsertLegalAddress(tx, supplier.companyId, legalAddress);
    }

    if (storicize) {
      await storicizeCompany(tx, {
        companyId: supplier.companyId,
        tenantId,
        userId,
        storicizeReason: storicize.reason,
        effectiveDate: storicize.effectiveDate ? new Date(storicize.effectiveDate) : undefined,
      });
    } else {
      await syncCurrentVersion(tx, supplier.companyId, userId);
    }

    return tx.supplier.findUniqueOrThrow({
      where: { id },
      include: getSupplierInclude(true),
    });
  });

  return sendSuccess(c, result, {
    message: storicize
      ? "Company updated and previous version historized successfully."
      : "Company updated successfully.",
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
  const tenantId = getRequiredTenantId(c);

  const supplier = await prisma.supplier.findFirst({
    where: tenantFilter(tenantId, { id }),
  });

  if (!supplier) {
    return sendNotFound(c, "Supplier non trovato");
  }

  const updatedSupplier = await prisma.supplier.update({
    where: { id, tenantId },
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
  const tenantId = getRequiredTenantId(c);

  const supplier = await prisma.supplier.findFirst({
    where: tenantFilter(tenantId, { id }),
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
      where: tenantFilter(tenantId, {
        supplierId: supplier.id,
        documentType: { in: ["SUPPLIER_ORDER", "INVOICE"] },
      }),
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
      where: tenantFilter(tenantId, {
        supplierId: supplier.id,
      }),
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
  const tenantId = getRequiredTenantId(c);

  const supplier = await prisma.supplier.findFirst({
    where: tenantFilter(tenantId, { id }),
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
    return sendFail(c, {
      statusCode: 409,
      message: `Impossibile eliminare: Supplier ha ${totalRelations} relazioni attive`,
    });
  }

  // Elimina supplier (cascade elimina anche company)
  await prisma.supplier.update({
    where: { id, tenantId },
    data: {
      deletedBy: userId,
      deletedAt: new Date(),
    },
  });

  return sendDeleted(c, "Supplier eliminato con successo");
};

/**
 * @desc    Statistiche aggregate su tutti i suppliers (per la list view)
 * @route   GET /api/suppliers/stats
 * @access  Private (supplier:read)
 */
export const getSupplierListStats = async (c: Context<AppBindings>) => {
  const filters = getValidatedQuery<SupplierQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where = buildSupplierWhereClause(filters as SupplierFilters, tenantId);

  const [total, spentAgg, byRating] = await Promise.all([
    prisma.supplier.count({ where }),

    prisma.supplier.aggregate({
      where,
      _sum: { totalSpent: true },
    }),

    // Distribuzione per rating (1–5)
    prisma.supplier.groupBy({
      by: ["rating"],
      where,
      _count: { id: true },
    }),
  ]);

  const byRatingMap = Object.fromEntries(
    byRating.filter((r) => r.rating !== null).map((r) => [String(r.rating), r._count.id]),
  );

  const avgRatingAgg = await prisma.supplier.aggregate({
    where: { ...where, rating: { not: null } },
    _avg: { rating: true },
  });

  return sendSuccess(c, {
    totalSuppliers: total,
    totalSpent: spentAgg._sum.totalSpent ?? 0,
    averageRating: avgRatingAgg._avg.rating ?? 0,
    byRating: byRatingMap,
  });
};
