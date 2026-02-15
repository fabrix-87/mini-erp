import { Response } from "express";
import {
  buildCustomerWhereClause,
  buildPagination,
  getCustomerInclude,
  generateCompanyCode,
} from "../helpers/company";
import { prisma } from "../config/prisma-client";
import { calculateCustomerStats, validateFiscalData } from "../utils/company";
import { formatPaginatedResponse } from "../utils/response";
import { AuthenticatedValidatedRequest } from "@/types/validate";
import {
  CustomerIdParam,
  CustomerQueryInput,
  UpdateCustomerCompanyInput,
  UpdateCustomerInput,
} from "@mini-erp/shared";
import asyncHandler from "@/middleware/async-handler";

// ============================================================================
// CUSTOMER CONTROLLERS
// ============================================================================

/**
 * @desc    Ottieni tutti i customers
 * @route   GET /api/customers
 * @access  Private (customer:read)
 */
export const getAllCustomers = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
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

    res.json(formatPaginatedResponse(customers, total, page, limit));
  },
);

/**
 * @desc    Ottieni customer per ID
 * @route   GET /api/customers/:id
 * @access  Private (customer:read)
 */
export const getCustomerById = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as CustomerIdParam;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: getCustomerInclude(true),
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer non trovato",
      });
      return;
    }

    const stats = calculateCustomerStats(customer);

    res.json({
      success: true,
      data: {
        ...customer,
        stats,
      },
    });
  },
);

/**
 * @desc    Crea nuovo customer (con company)
 * @route   POST /api/customers
 * @access  Private (customer:create)
 */
export const createCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
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

    // Verifica relazioni opzionali
    if (customerData.defaultPriceListId) {
      const priceList = await prisma.priceList.findUnique({
        where: { id: customerData.defaultPriceListId },
      });
      if (!priceList) {
        res.status(404).json({
          success: false,
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
        res.status(404).json({
          success: false,
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
        res.status(404).json({
          success: false,
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

    res.status(201).json({
      success: true,
      message: "Customer creato con successo",
      data: customer,
    });
  },
);

/**
 * @desc    Aggiorna customer
 * @route   PUT /api/customers/:id
 * @access  Private (customer:update)
 */
export const updateCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as CustomerIdParam;
    const data = req.validatedBody as UpdateCustomerInput;

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
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
        res.status(404).json({
          success: false,
          message: "Price List non trovato",
        });
        return;
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data,
      include: getCustomerInclude(true),
    });

    res.json({
      success: true,
      message: "Customer aggiornato con successo",
      data: customer,
    });
  },
);

/**
 * @desc    Aggiorna company del customer
 * @route   PUT /api/customers/:id/company
 * @access  Private (customer:update)
 */
export const updateCustomerCompany = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
    const { id } = req.validatedParams as CustomerIdParam;
    const companyData = req.validatedBody as UpdateCustomerCompanyInput;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
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
        res.status(400).json({
          success: false,
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

    res.json({
      success: true,
      message: "Company aggiornata con successo",
      data: updatedCustomer,
    });
  },
);

/**
 * @desc    Ottieni statistiche customer
 * @route   GET /api/customers/:id/stats
 * @access  Private (customer:read)
 */
export const getCustomerStats = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
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
        by: ["productId"],
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
            translations: {
              take: 1,
              select: { name: true },
            },
          },
        });

        return {
          productId: item.productId,
          productName: product?.translations[0]?.name || product?.reference,
          totalQuantity: item._sum.quantity,
          orderCount: item._count.id,
        };
      }),
    );

    const stats = calculateCustomerStats(customer);

    res.json({
      success: true,
      data: {
        summary: stats,
        recentOrders,
        topProducts: enrichedProducts,
        totals: {
          orders: customer._count.documentsOut,
          opportunities: customer._count.opportunities,
        },
      },
    });
  },
);

/**
 * @desc    Elimina customer
 * @route   DELETE /api/customers/:id
 * @access  Private (customer:delete)
 */
export const deleteCustomer = asyncHandler(
  async (req: AuthenticatedValidatedRequest, res: Response): Promise<void> => {
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
      res.status(404).json({
        success: false,
        message: "Customer non trovato",
      });
      return;
    }

    const totalRelations =
      customer._count.documentsOut + customer._count.opportunities;

    if (totalRelations > 0) {
      res.status(400).json({
        success: false,
        message: `Impossibile eliminare: Customer ha ${totalRelations} relazioni attive`,
        details: {
          documents: customer._count.documentsOut,
          opportunities: customer._count.opportunities,
        },
      });
      return;
    }

    // Elimina customer (cascade elimina anche company)
    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Customer eliminato con successo",
    });
  },
);
