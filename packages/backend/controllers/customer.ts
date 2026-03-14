import {
  buildCustomerWhereClause,
  getCustomerInclude,
  generateCompanyCode,
} from "../helpers/company";
import { prisma } from "../config/prisma-client";
import { calculateCustomerStats, validateFiscalData } from "../utils/company";
import {  
  sendCreated,
  sendDeleted,
  sendFail,
  sendPaginatedResponse,
  sendSuccess,
} from "../utils/response";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import {
  CustomerIdParam,
  CustomerQueryInput,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
} from "@mini-erp/shared";
import asyncHandler from "@/middleware/async-handler";
import { Prisma } from "@/generated/prisma/client";
import { buildPagination } from "@/utils/query";

// ============================================================================
// CUSTOMER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i customers
 * @route   GET /api/customers
 * @access  Private (customer:read)
 */
export const getAllCustomers = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "id",
      sortOrder = "desc",
      ...filters
    } = req.validatedQuery as CustomerQueryInput;

    const where = buildCustomerWhereClause(filters as any);
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
  },
);

/**
 * @desc    Ottieni customer per ID
 * @route   GET /api/customers/:id
 * @access  Private (customer:read)
 */
export const getCustomerById = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
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
  },
);

/**
 * @desc    Crea nuovo customer (con company)
 * @route   POST /api/customers
 * @access  Private (customer:create)
 */
export const createCustomer = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { company: companyData, ...customerData } = req.validatedBody;

    // Genera codice company se non fornito
    if (!companyData.code) {
      companyData.code = await generateCompanyCode(prisma, "CUS");
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
      sendFail(res, {
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
      sendFail(res, {
        message: "Codice company già esistente",
      });
      return;
    }

    // Verifica country esiste
    const country = await prisma.country.findUnique({
      where: { code: companyData.countryCode },
    });

    if (!country) {
      sendFail(res, {
        statusCode: 404,
        message: "Paese non trovato",
      });
      return;
    }

    // Verifica relazioni opzionali
    if (customerData.defaultPriceListId) {
      const priceList = await prisma.priceList.findUnique({
        where: { id: customerData.defaultPriceListId },
      });
      if (!priceList) {
        sendFail(res, {
          statusCode: 404,
          message: "Price List non trovato",
        });
        return;
      }
    }

    if (customerData.customerTaxRuleId) {
      const taxRule = await prisma.taxRule.findUnique({
        where: { id: customerData.customerTaxRuleId },
      });
      if (!taxRule) {
        sendFail(res, {
          statusCode: 404,
          message: "Tax Rule non trovato",
        });
        return;
      }
    }

    if (customerData.paymentMethodId) {
      const paymentMethod = await prisma.paymentMethod.findUnique({
        where: { id: customerData.paymentMethodId },
      });
      if (!paymentMethod) {
        sendFail(res, {
          statusCode: 404,
          message: "Payment Method non trovato",
        });
        return;
      }
    }

    // Crea company e customer in transazione
    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        company: {
          create: companyData,
        },
      },
      include: getCustomerInclude(true),
    });

    sendCreated(res, customer, "Customer creato con successo");
  },
);

/**
 * @desc    Aggiorna customer
 * @route   PUT /api/customers/:id
 * @access  Private (customer:update)
 */
export const updateCustomer = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
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
      data: data as Prisma.CustomerUncheckedUpdateInput,
      include: getCustomerInclude(true),
    });

    sendSuccess(res, customer, {
      message: "Customer aggiornato con successo",
    });
  },
);

/**
 * @desc    Aggiorna company del customer
 * @route   PUT /api/customers/:id/company
 * @access  Private (customer:update)
 */
export const updateCustomerCompany =
  asyncHandler<AuthenticatedValidatedRequest>(async (req, res) => {
    const { id } = req.validatedParams as CustomerIdParam;
    const companyData = req.validatedBody as UpdateCustomerCompanyInput;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!customer) {
      sendFail(res, {
        statusCode: 404,
        message: "Customer non trovato",
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
        entityType: companyData.entityType || customer.company.entityType,
        countryCode: companyData.countryCode || customer.company.countryCode,
        vatNumber:
          companyData.vatNumber !== undefined
            ? companyData.vatNumber
            : customer.company.vatNumber,
        taxCode:
          companyData.taxCode !== undefined
            ? companyData.taxCode
            : customer.company.taxCode,
        sdiCode:
          companyData.sdiCode !== undefined
            ? companyData.sdiCode
            : customer.company.sdiCode,
        pec:
          companyData.pec !== undefined
            ? companyData.pec
            : customer.company.pec,
      });

      if (!fiscalValidation.valid) {
        sendFail(res, {
          statusCode: 404,
          message: "Dati fiscali non validi",
          errors: fiscalValidation.errors,
        });
        return;
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        company: {
          update: companyData,
        },
      },
      include: getCustomerInclude(true),
    });

    sendSuccess(res, updatedCustomer, {
      message: "Company aggiornata con successo",
    });
  });

/**
 * @desc    Ottieni statistiche customer
 * @route   GET /api/customers/:id/stats
 * @access  Private (customer:read)
 */
export const getCustomerStats = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
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
  },
);

/**
 * @desc    Elimina customer
 * @route   DELETE /api/customers/:id
 * @access  Private (customer:delete)
 */
export const deleteCustomer = asyncHandler<AuthenticatedValidatedRequest>(
  async (req, res) => {
    const { id } = req.validatedParams as CustomerIdParam;

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

    const totalRelations =
      customer._count.documentsOut + customer._count.opportunities;

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
    await prisma.customer.delete({
      where: { id },
    });

    sendDeleted(res, "Customer eliminato con successo");
  },
);
