import {
  buildCustomerWhereClause,
  getCustomerInclude,
  generateUniqueCompanyCode,
} from "../helpers/company";
import { prisma } from "../config/prisma-config";
import {
  calculateCustomerStats,
  formatCompanyResponse,
  validateFiscalData,
} from "../utils/company";
import {
  sendCreated,
  sendDeleted,
  sendFail,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response-utils";
import { AuthenticatedValidatedRequest } from "@/types/validate-types";
import {
  CreateCustomerInput,
  CustomerIdParam,
  CustomerQueryInput,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
} from "@mini-erp/shared";
import asyncHandler from "@/middleware/async-handler-middleware";
import { AddressType, Prisma } from "@/generated/prisma/client";
import { buildPagination } from "@/utils/query";
import { CustomerFilters } from "@/types/company";
import { connectOrDisconnectById, parseOptionalDecimal } from "@/helpers/prisma";
import {
  buildAddressCreateData,
  buildCompanyCreateData,
  buildCustomerCreateData,
  buildCustomerUpdateData,
} from "@/services/company/company";

// ============================================================================
// CUSTOMER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i customers
 * @route   GET /api/customers
 * @access  Private (customer:read)
 */
export const getAllCustomers = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "desc",
    ...filters
  } = req.validatedQuery as CustomerQueryInput;

  const where = buildCustomerWhereClause(filters as CustomerFilters);
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
  sendPaginatedResponse(res, customers, total, page, limit);
});

/**
 * @desc    Ottieni customer per ID
 * @route   GET /api/customers/:id
 * @access  Private (customer:read)
 */
export const getCustomerById = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as CustomerIdParam;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: getCustomerInclude(true),
  });

  if (!customer) {
    sendFail(res, {
      message: "Customer non trovato",
    });
    return;
  }

  const stats = calculateCustomerStats(customer);

  sendSuccess(res, {
    ...customer,
    stats,
  });
});

/**
 * @desc    Crea nuovo customer (con company e indirizzo legale)
 * @route   POST /api/customers
 * @access  Private (customer:create)
 */
export const createCustomer = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { company: companyData, ...customerData } = req.validatedBody as CreateCustomerInput;

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
          where: { id: customerData.defaultPriceListId },
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
          where: { id: customerData.paymentMethodId },
          select: { id: true },
        })
      : Promise.resolve(true),
  ]);

  if (!country) {
    sendFail(res, { statusCode: 404, message: "Paese non trovato" });
    return;
  }
  if (!priceList) {
    sendFail(res, { statusCode: 404, message: "Price List non trovata" });
    return;
  }
  if (!taxRule) {
    sendFail(res, { statusCode: 404, message: "Tax Rule non trovata" });
    return;
  }
  if (!paymentMethod) {
    sendFail(res, { statusCode: 404, message: "Payment Method non trovato" });
    return;
  }

  // -------------------------------------------------------------------------
  // 2. Transazione: generazione codice + creazione company + customer + address
  //    La generazione del codice è dentro la transazione per evitare race
  //    conditions in ambienti con richieste concorrenti.
  // -------------------------------------------------------------------------
  const customer = await prisma.$transaction(async (tx) => {
    const code = await generateUniqueCompanyCode("customer", tx);
    return tx.customer.create({
      data: buildCustomerCreateData(customerData, buildCompanyCreateData(companyData, code)),
      include: getCustomerInclude(true),
    });
  });

  sendCreated(res, formatCompanyResponse(customer), "Customer creato con successo");
});

/**
 * @desc    Aggiorna customer
 * @route   PUT /api/customers/:id
 * @access  Private (customer:update)
 */
export const updateCustomer = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as CustomerIdParam;
  const data = req.validatedBody as UpdateCustomerInput;

  const existing = await prisma.customer.findUnique({
    where: { id },
  });

  if (!existing) {
    sendFail(res, {
      statusCode: 404,
      message: "Customer non trovato",
    });
    return;
  }

  // Verifica relazioni se modificate
  if (data.defaultPriceListId) {
    const priceList = await prisma.priceList.findUnique({
      where: { id: data.defaultPriceListId },
    });
    if (!priceList) {
      sendFail(res, {
        statusCode: 404,
        message: "Price List non trovato",
      });
      return;
    }
  }

  const customer = await prisma.customer.update({
    where: { id },
    data: buildCustomerUpdateData(data),
    include: getCustomerInclude(true),
  });

  sendSuccess(res, customer, {
    message: "Customer aggiornato con successo",
  });
});

/**
 * @desc    Aggiorna company del customer
 * @route   PUT /api/customers/:id/company
 * @access  Private (customer:update)
 */
export const updateCustomerCompany = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams as CustomerIdParam;
    const companyData = req.validatedBody as UpdateCustomerCompanyInput;

    const customer = await prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      sendFail(res, { statusCode: 404, message: "Customer non trovato" });
      return;
    }

    const { legalAddress, ...companyScalarData } = companyData;

    const updatedCustomer = await prisma.$transaction(async (tx) => {
      // 1. Aggiorna i campi scalari della company
      if (Object.keys(companyScalarData).length > 0) {
        await tx.company.update({
          where: { id: customer.companyId },
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
            companyId: customer.companyId,
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
            data: { ...addressData, companyId: customer.companyId },
          });
        }
      }

      // 3. Ritorna il customer aggiornato con tutti i dati
      return tx.customer.findUnique({
        where: { id },
        include: getCustomerInclude(true),
      });
    });

    sendSuccess(res, updatedCustomer, {
      message: "Company aggiornata con successo",
    });
  },
);

/**
 * @desc    Valida i dati fiscali della company del customer
 * @route   POST /api/customers/:id/validate-fiscal
 * @access  Private (customer:read)
 */
export const validateCustomerFiscal = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams as CustomerIdParam;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!customer) {
      sendFail(res, { statusCode: 404, message: "Customer non trovato" });
      return;
    }

    const fiscalValidation = validateFiscalData({
      entityType: customer.company.entityType,
      countryCode: customer.company.countryCode,
      vatNumber: customer.company.vatNumber,
      taxCode: customer.company.taxCode,
      sdiCode: customer.company.sdiCode,
      pec: customer.company.pec,
    });

    sendSuccess(res, {
      valid: fiscalValidation.valid,
      errors: fiscalValidation.errors ?? [],
    });
  },
);

/**
 * @desc    Ottieni statistiche customer
 * @route   GET /api/customers/:id/stats
 * @access  Private (customer:read)
 */
export const getCustomerStats = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as CustomerIdParam;
  const { preferredLanguageId } = req.user!;

  const customer = await prisma.customer.findUnique({
    where: { id },
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
    res.status(404).json({
      success: false,
      message: "Customer non trovato",
    });
    return;
  }

  const [recentOrders, topProducts] = await Promise.all([
    // Ultimi ordini
    prisma.document.findMany({
      where: {
        customerId: customer.id,
        documentType: { in: ["ORDER", "INVOICE"] },
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

    // Prodotti più acquistati
    prisma.documentLine.groupBy({
      by: ["productId", "productVariantId"],
      where: {
        document: {
          customerId: customer.id,
          documentType: { in: ["ORDER", "INVOICE"] },
        },
        productId: { not: null },
      },
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

  // Arricchisci prodotti con dettagli
  const enrichedProducts = await Promise.all(
    topProducts.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId! },
        select: {
          id: true,
          reference: true,
          variants: {
            where: { id: item.productVariantId! },
            select: {
              id: true,
            },
          },
          translations: {
            where: {
              languageId: preferredLanguageId,
            },
            take: 1,
            select: {
              name: true,
            },
          },
        },
      });

      return {
        productId: item.productId,
        variantId: item.productVariantId,
        productName: product?.translations[0].name || product?.reference,
        totalQuantity: item._sum.quantity,
        orderCount: item._count.id,
      };
    }),
  );

  const stats = calculateCustomerStats(customer);

  sendSuccess(res, {
    summary: stats,
    recentOrders,
    topProducts: enrichedProducts,
    totals: {
      orders: customer._count.documentsOut,
      opportunities: customer._count.opportunities,
    },
  });
});

/**
 * @desc    Elimina customer
 * @route   DELETE /api/customers/:id
 * @access  Private (customer:delete)
 */
export const deleteCustomer = asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
  const { id } = req.validatedParams as CustomerIdParam;
  const { userId } = req.user!;

  const customer = await prisma.customer.findUnique({
    where: { id },
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
    sendFail(res, {
      statusCode: 404,
      message: "Customer non trovato",
    });
    return;
  }

  const totalRelations = customer._count.documentsOut + customer._count.opportunities;

  if (totalRelations > 0) {
    sendFail(res, {
      message: `Impossibile eliminare: Customer ha ${totalRelations} relazioni attive`,
      errors: [
        {
          field: "documents",
          message: customer._count.documentsOut.toString(),
        },
        {
          field: "opportunities",
          message: customer._count.opportunities.toString(),
        },
      ],
    });
    return;
  }

  // Elimina customer (cascade elimina anche company)
  await prisma.customer.update({
    where: { id },
    data: {
      deletedBy: userId,
      deletedAt: new Date(),
    },
  });

  sendDeleted(res, "Customer eliminato con successo");
});
