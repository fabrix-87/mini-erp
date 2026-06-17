// ============================================================================
// DOCUMENT SELECTION HELPERS
// Prisma query selections for consistent data fetching
// ============================================================================

import { Prisma } from "@/generated/prisma/client";

/**
 * Standard document selection with relations
 * Use this for consistent document queries across controllers
 */
export const getDocumentSelection = () =>
  ({
    id: true,
    documentType: true,
    status: true,
    direction: true,
    documentNumber: true,
    documentYear: true,
    sequenceNumber: true,

    // === NUMERAZIONE INBOUND ===
    counterpartyDocumentNumber: true,

    // === REGISTRO IVA ===
    vatRegisterProtocol: true,
    vatRegisterYear: true,

    tenantId: true,
    customerId: true,
    supplierId: true,
    contactId: true,
    opportunityId: true,
    leadId: true,
    warehouseId: true,
    assignedUserId: true,
    createdByUserId: true,

    // === KEY DATES ===
    documentDate: true,
    dueDate: true,
    deliveryDate: true,
    validUntil: true,
    sentDate: true,
    receivedDate: true,
    registrationDate: true,

    // === SNAPSHOT CONTROPARTE ===
    counterpartyName: true,
    counterpartyVatNumber: true,
    counterpartyTaxCode: true,
    counterpartyPec: true,
    counterpartySdiCode: true,
    counterpartyAddress: true,
    counterpartyCity: true,
    counterpartyPostalCode: true,
    counterpartyProvince: true,
    counterpartyCountryCode: true,
    counterpartyEmail: true,
    counterpartyPhone: true,

    // === SNAPSHOT SPEDIZIONE ===
    shippingName: true,
    shippingAddress: true,
    shippingCity: true,
    shippingPostalCode: true,
    shippingProvince: true,
    shippingCountryCode: true,

    // === IMPORTI ===
    subtotal: true,
    discountPercent: true,
    discountAmount: true,
    shippingCost: true,
    shippingTaxAmount: true,
    taxableAmount: true,
    taxAmount: true,
    totalAmount: true,
    netPayableAmount: true,
    paidAmount: true,

    // === VALUTA ===
    currencyCode: true,
    exchangeRate: true,
    exchangeRateDate: true,
    baseCurrencyCode: true,

    // === PAGAMENTO ===
    paymentMethodId: true,
    paymentMethodCode: true,
    paymentTermsLabel: true,

    // === SNAPSHOT BANCA ===
    bankName: true,
    bankIban: true,
    bankSwift: true,
    bankAccountHolder: true,
    bankDetailsMismatch: true,
    bankDetailsVerifiedAt: true,

    // === RITENUTA D'ACCONTO ===
    withholdingTaxTypeCode: true,
    withholdingTaxBase: true,
    withholdingTaxPercent: true,
    withholdingTaxAmount: true,

    // === CASSA PREVIDENZIALE ===
    contributionPercent: true,
    contributionAmount: true,

    // === NOTE ===
    notes: true,
    internalNotes: true,
    termsAndConditions: true,

    // === LIFECYCLE TIMESTAMPS ===
    approvedAt: true,
    invoicedAt: true,
    deliveredAt: true,
    closedAt: true,
    voidedAt: true,
    voidedReason: true,

    createdAt: true,
    updatedAt: true,

    // === RELATIONS ===
    tenant: {
      select: {
        id: true,
        company: {
          select: {
            companyName: true,
            vatNumber: true,
          },
        },
      },
    },
    customer: {
      select: {
        id: true,
        company: {
          select: {
            companyName: true,
            vatNumber: true,
            mainEmail: true,
          },
        },
      },
    },
    supplier: {
      select: {
        id: true,
        company: {
          select: {
            companyName: true,
            vatNumber: true,
            mainEmail: true,
          },
        },
      },
    },
    warehouse: {
      select: {
        id: true,
        name: true,
        location: true,
      },
    },
    paymentMethodRel: {
      select: {
        id: true,
        code: true,
        translations: {
          select: {
            name: true,
          },
        },
      },
    },
    createdBy: {
      select: {
        id: true,
        username: true,
        email: true,
      },
    },
    assignedUser: {
      select: {
        id: true,
        username: true,
        email: true,
      },
    },
    lines: {
      select: {
        id: true,
        lineNumber: true,
        lineType: true,
        code: true,
        nameSystem: true,
        descriptionSystem: true,
        nameCustomer: true,
        descriptionCustomer: true,
        quantity: true,
        quantityDelivered: true,
        quantityInvoiced: true,
        quantityReturned: true,
        unit: true,
        unitPrice: true,
        unitCost: true,
        discountPercent: true,
        discountAmount: true,
        lineTotal: true,
        taxPercent: true,
        taxAmount: true,
        vatNatureCode: true,
        lineTotalWithTax: true,
        isReverseCharge: true,
        isSelfInvoice: true,
        matchStatus: true,
        productVariantId: true,
        productId: true,
        warehouseId: true,
        parentLineId: true,
        isComponent: true,
        originalUnitPrice: true,
        priceOverrideReason: true,
      },
      orderBy: { lineNumber: "asc" as const },
    },
    installments: {
      select: {
        id: true,
        installmentNumber: true,
        percentage: true,
        amount: true,
        dueDate: true,
        paidDate: true,
        paidAmount: true,
        status: true,
      },
      orderBy: { installmentNumber: "asc" as const },
    },
  }) satisfies Prisma.DocumentSelect;

/**
 * Minimal document selection for lists
 */
export const getDocumentListSelection = () =>
  ({
    id: true,
    documentType: true,
    direction: true,
    status: true,
    documentNumber: true,
    documentYear: true,
    documentDate: true,
    dueDate: true,
    counterpartyName: true,
    totalAmount: true,
    paidAmount: true,
    currencyCode: true,
    createdAt: true,
  }) satisfies Prisma.DocumentSelect;

/**
 * Document line selection with product info
 */
export const getDocumentLineWithProductSelection = () =>
  ({
    id: true,
    lineNumber: true,
    nameSystem: true,
    quantity: true,
    quantityDelivered: true,
    unitPrice: true,
    lineTotal: true,
    productVariant: {
      select: {
        id: true,
        sku: true,
        minimalQuantity: true,
        product: {
          select: {
            id: true,
            reference: true,
          },
        },
      },
    },
  }) satisfies Prisma.DocumentLineSelect;
