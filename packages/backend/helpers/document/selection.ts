// ============================================================================
// DOCUMENT SELECTION HELPERS
// Prisma query selections for consistent data fetching
// ============================================================================

/**
 * Standard document selection with relations
 * Use this for consistent document queries across controllers
 */
export const getDocumentSelection = () => ({
  id: true,
  documentType: true,
  status: true,
  documentNumber: true,
  documentYear: true,
  companyId: true,
  customerId: true,
  supplierId: true,
  contactId: true,
  opportunityId: true,
  warehouseId: true,
  documentDate: true,
  dueDate: true,
  deliveryDate: true,
  validUntil: true,
  sentDate: true,
  relatedQuoteId: true,
  relatedOrderId: true,
  relatedInvoiceId: true,
  customerName: true,
  customerVatNumber: true,
  customerTaxCode: true,
  customerAddress: true,
  customerCity: true,
  customerPostalCode: true,
  customerProvince: true,
  customerCountryCode: true,
  customerEmail: true,
  customerPhone: true,
  shippingName: true,
  shippingAddress: true,
  shippingCity: true,
  shippingPostalCode: true,
  shippingProvince: true,
  shippingCountryCode: true,
  currency: true,
  subtotal: true,
  discountPercent: true,
  discountAmount: true,
  shippingCost: true,
  shippingTaxAmount: true,
  taxableAmount: true,
  taxAmount: true,
  totalAmount: true,
  paidAmount: true,
  paymentMethod: true,
  paymentTerms: true,
  notes: true,
  internalNotes: true,
  termsAndConditions: true,
  createdAt: true,
  updatedAt: true,
  company: {
    select: {
      id: true,
      companyName: true,
      vatNumber: true,
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
      quantity: true,
      quantityDelivered: true,
      quantityInvoiced: true,
      quantityReturned: true,
      unit: true,
      unitPrice: true,
      discountPercent: true,
      discountAmount: true,
      lineTotal: true,
      taxPercent: true,
      taxAmount: true,
      lineTotalWithTax: true,
      productVariantId: true,
      productId: true,
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
});

/**
 * Minimal document selection for lists
 */
export const getDocumentListSelection = () => ({
  id: true,
  documentType: true,
  status: true,
  documentNumber: true,
  documentYear: true,
  documentDate: true,
  dueDate: true,
  customerName: true,
  totalAmount: true,
  paidAmount: true,
  currencyCode: true,
  createdAt: true,
});

/**
 * Document line selection with product info
 */
export const getDocumentLineWithProductSelection = () => ({
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
      quantity: true,
      product: {
        select: {
          id: true,
          reference: true,
        },
      },
    },
  },
});
