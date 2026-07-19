import {
  buildCustomerWhereClause,
  getCustomerInclude,
  generateUniqueCompanyCode,
  executeCompanyUpdate,
} from "../helpers/company-helper";
import { prisma } from "../config/prisma-config";
import {
  calculateCustomerStats,
  formatCompanyResponse,
  validateFiscalData,
} from "../utils/company-utils";
import {
  sendCreated,
  sendDeleted,
  sendError,
  sendNotFound,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response-utils";

import {
  CreateCustomerInput,
  CustomerFilters,
  CustomerIdParam,
  CustomerQueryInput,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
} from "@mini-erp/shared";
import { buildPagination } from "@/utils/query-utils";
import {
  buildCompanyCreateData,
  buildCustomerCreateData,
  buildCustomerUpdateData,
} from "@/services/company/company";
import { Context } from "hono";
import { AppBindings } from "@/lib/hono-app";
import {
  getRequiredLanguageId,
  getRequiredTenantId,
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "@/helpers/validated-context";
import { tenantFilter } from "@/helpers/prisma-helper";
import {
  createInitialCompanyVersion,
} from "@/helpers/company-version-helper";
import { upsertLegalAddress } from "@/helpers/address-helper";
import { ConflictError } from "@/utils/app-error-utils";

// ============================================================================
// CUSTOMER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i customers
 * @route   GET /api/customers
 * @access  Private (customer:read)
 */
export const getAllCustomers = async (c: Context<AppBindings>) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "desc",
    ...filters
  } = getValidatedQuery<CustomerQueryInput>(c);
  const tenantId = getRequiredTenantId(c);

  const where = buildCustomerWhereClause(filters as CustomerFilters, tenantId);
  const { skip, take } = buildPagination(page, limit);

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take,
      include: getCustomerInclude(false),
      orderBy: { id: sortOrder },
    }),
    prisma.customer.count({ where }),
  ]);
  return sendPaginatedResponse(c, customers, total, page, limit);
};

/**
 * @desc    Ottieni customer per ID
 * @route   GET /api/customers/:id
 * @access  Private (customer:read)
 */
export const getCustomerById = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: getCustomerInclude(true),
  });

  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  const stats = calculateCustomerStats(customer);

  return sendSuccess(c, {
    ...formatCompanyResponse(customer),
    stats,
  });
};

/**
 * @desc    Crea nuovo customer (con company e indirizzo legale)
 * @route   POST /api/customers
 * @access  Private (customer:create)
 */
export const createCustomer = async (c: Context<AppBindings>) => {
  const { company: companyData, ...customerData } = getValidatedBody<CreateCustomerInput>(c);
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  // -------------------------------------------------------------------------
  // 1. Verifica esistenza relazioni — in parallelo per minimizzare la latenza
  // -------------------------------------------------------------------------
  const [country, priceList, taxRule, paymentMethod] = await Promise.all([
    prisma.country.findUnique({
      where: { code: companyData.countryCode },
      select: { code: true },
    }),
    customerData.defaultPriceListId
      ? prisma.priceList.findUnique({
          where: { id: customerData.defaultPriceListId, tenantId },
          select: { id: true },
        })
      : Promise.resolve(true), // null check skippato se non fornito
    customerData.customerTaxRuleId
      ? prisma.taxRule.findUnique({
          where: { id: customerData.customerTaxRuleId },
          select: { id: true },
        })
      : Promise.resolve(true),
    customerData.paymentMethodId
      ? prisma.paymentMethod.findUnique({
          where: { id: customerData.paymentMethodId, tenantId },
          select: { id: true },
        })
      : Promise.resolve(true),
  ]);

  if (!country) {
    return sendNotFound(c, "Paese non trovato");
  }
  if (!priceList) {
    return sendNotFound(c, "Price List non trovata");
  }
  if (!taxRule) {
    return sendNotFound(c, "Tax Rule non trovata");
  }
  if (!paymentMethod) {
    return sendNotFound(c, "Payment Method non trovata");
  }

  // -------------------------------------------------------------------------
  // 2. Transazione: generazione codice + creazione company + customer + address
  //    La generazione del codice è dentro la transazione per evitare race
  //    conditions in ambienti con richieste concorrenti.
  // -------------------------------------------------------------------------
  const customer = await prisma.$transaction(async (tx) => {
    const code = await generateUniqueCompanyCode("customer", tenantId, tx);

    const created = await tx.customer.create({
      data: buildCustomerCreateData(
        customerData,
        buildCompanyCreateData(companyData, code, tenantId),
        tenantId,
      ),
      include: getCustomerInclude(true),
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

  return sendCreated(c, formatCompanyResponse(customer), "Customer creato con successo");
};

/**
 * @desc    Aggiorna customer
 * @route   PUT /api/customers/:id
 * @access  Private (customer:update)
 */
export const updateCustomer = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const data = getValidatedBody<UpdateCustomerInput>(c);
  const tenantId = getRequiredTenantId(c);

  const existing = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
  });

  if (!existing) {
    return sendNotFound(c, "Customer non trovato");
  }

  // Verifica relazioni se modificate
  if (data.defaultPriceListId) {
    const priceList = await prisma.priceList.findUnique({
      where: { id: data.defaultPriceListId, tenantId },
    });
    if (!priceList) {
      return sendNotFound(c, "Price List non trovata");
    }
  }

  const customer = await prisma.customer.update({
    where: { id, tenantId },
    data: buildCustomerUpdateData(data),
    include: getCustomerInclude(true),
  });

  return sendSuccess(c, customer, {
    message: "Customer aggiornato con successo",
  });
};

/**
 * Updates the anagraphic data of a company linked to a customer.
 * When `storicize` is provided in the body, the current company state is
 * historized BEFORE the update is applied, so the new CompanyVersion
 * snapshot captures the incoming (post-update) data.
 *
 * Route:   PUT /customers/:id/company
 * Access:  Protected — requires customer:update permission
 */
export const updateCustomerCompany = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const data = getValidatedBody<UpdateCustomerCompanyInput>(c);
  const tenantId = getRequiredTenantId(c);
  const { userId } = c.get("user")!;

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
    select: { companyId: true },
  });

  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  const { storicize, legalAddress, ...companyScalarData } = data;

  const result = await prisma.$transaction(async (tx) => {
    await executeCompanyUpdate(tx, {
      companyId: customer.companyId,
      tenantId,
      userId,
      companyScalarData,
      legalAddress,
      storicize,
    });

    return tx.customer.findUniqueOrThrow({
      where: { id },
      include: getCustomerInclude(true),
    });
  });

  return sendSuccess(c, result, {
    message: storicize
      ? "Company updated and previous version historized successfully."
      : "Company updated successfully.",
  });
};

/**
 * @desc    Valida i dati fiscali della company del customer
 * @route   POST /api/customers/:id/validate-fiscal
 * @access  Private (customer:read)
 */
export const validateCustomerFiscal = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const tenantId = getRequiredTenantId(c);

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: { company: true },
  });

  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  const fiscalValidation = validateFiscalData({
    entityType: customer.company.entityType,
    countryCode: customer.company.countryCode,
    vatNumber: customer.company.vatNumber,
    taxCode: customer.company.taxCode,
    sdiCode: customer.company.sdiCode,
    pec: customer.company.pec,
  });

  return sendSuccess(c, {
    valid: fiscalValidation.valid,
    errors: fiscalValidation.errors ?? [],
  });
};

/**
 * @desc    Ottieni statistiche customer
 * @route   GET /api/customers/:id/stats
 * @access  Private (customer:read)
 */
export const getCustomerStats = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const languageId = getRequiredLanguageId(c);
  const tenantId = getRequiredTenantId(c);

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: {
      _count: {
        select: {
          documentsOut: true,
          opportunities: true,
        },
      },
    },
  });

  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  const [recentOrders, topProducts] = await Promise.all([
    // Ultimi ordini
    prisma.document.findMany({
      where: tenantFilter(tenantId, {
        customerId: customer.id,
        documentType: { in: ["ORDER", "INVOICE"] },
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

    // Prodotti più acquistati
    prisma.documentLine.groupBy({
      by: ["productId", "productVariantId"],
      where: tenantFilter(tenantId, {
        document: {
          customerId: customer.id,
          documentType: { in: ["ORDER", "INVOICE"] },
        },
        productId: { not: null },
      }),
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 10,
    }),
  ]);

  const productIds = topProducts
    .map((item) => item.productId)
    .filter((id): id is string => id !== null);

  const products = await prisma.product.findMany({
    where: tenantFilter(tenantId, { id: { in: productIds } }),
    select: {
      id: true,
      reference: true,
      translations: {
        where: { languageId },
        take: 1,
        select: { name: true },
      },
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const enrichedProducts = topProducts.map((item) => {
    const product = productMap.get(item.productId!);
    return {
      productId: item.productId,
      variantId: item.productVariantId,
      productName: product?.translations[0]?.name ?? product?.reference,
      totalQuantity: item._sum.quantity,
      orderCount: item._count.id,
    };
  });

  const stats = calculateCustomerStats(customer);

  return sendSuccess(c, {
    summary: stats,
    recentOrders,
    topProducts: enrichedProducts,
    totals: {
      orders: customer._count.documentsOut,
      opportunities: customer._count.opportunities,
    },
  });
};

/**
 * @desc    Elimina customer
 * @route   DELETE /api/customers/:id
 * @access  Private (customer:delete)
 */
export const deleteCustomer = async (c: Context<AppBindings>) => {
  const { id } = getValidatedParams<CustomerIdParam>(c);
  const { userId } = c.get("user")!;
  const tenantId = getRequiredTenantId(c);

  const customer = await prisma.customer.findFirst({
    where: tenantFilter(tenantId, { id }),
    include: {
      _count: {
        select: {
          documentsOut: true,
          opportunities: true,
        },
      },
    },
  });

  if (!customer) {
    return sendNotFound(c, "Customer non trovato");
  }

  const totalRelations = customer._count.documentsOut + customer._count.opportunities;

  if (totalRelations > 0) {
    throw new ConflictError(
      `Impossibile eliminare: Customer ha ${totalRelations} relazioni attive`,
    );
  }

  // Elimina customer (cascade elimina anche company)
  await prisma.customer.update({
    where: { id, tenantId },
    data: {
      deletedBy: userId,
      deletedAt: new Date(),
    },
  });

  return sendDeleted(c, "Customer eliminato con successo");
};

/**
 * @desc    Statistiche aggregate su tutti i customers (per la list view)
 * @route   GET /api/customers/stats
 * @access  Private (customer:read)
 */
export const getCustomerListStats = async (c: Context<AppBindings>) => {
  const filters = getValidatedQuery<CustomerQueryInput>(c);
  const tenantId = getRequiredTenantId(c);
  const where = buildCustomerWhereClause(filters as CustomerFilters, tenantId);

  const [total, revenueAgg, bySegment] = await Promise.all([
    // Totale customers (rispettando i filtri attivi)
    prisma.customer.count({ where }),

    // Somma revenue + media valore ordine
    prisma.customer.aggregate({
      where,
      _sum: { totalRevenue: true },
      _avg: { totalRevenue: true },
    }),

    // Distribuzione per segmento
    prisma.customer.groupBy({
      by: ["segment"],
      where,
      _count: { id: true },
    }),
  ]);

  const bySegmentMap = Object.fromEntries(bySegment.map((s) => [s.segment ?? "NONE", s._count.id]));

  // Calcolo avgOrderValue aggregando i documenti
  const orderStats = await prisma.document.aggregate({
    where: {
      customer: { ...where },
      documentType: { in: ["ORDER", "INVOICE"] },
    },
    _avg: { totalAmount: true },
  });

  return sendSuccess(c, {
    totalCustomers: total,
    totalRevenue: revenueAgg._sum.totalRevenue ?? 0,
    averageOrderValue: orderStats._avg.totalAmount ?? 0,
    bySegment: bySegmentMap,
  });
};
