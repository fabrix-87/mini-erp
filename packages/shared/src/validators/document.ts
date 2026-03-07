import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { isoDateSchema } from "./primitives/date";

import { emailSchema, phoneSchema } from "./primitives/string";
import {
  countryCodeBaseSchema,
  currencyCodeBaseSchema,
  inputJsonValueSchema,
} from "./base";
import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema, queryNumberSchema } from "./query/params";
import {
  DOCUMENT_TYPES,
  DOCUMENT_STATUS_CATEGORIES,
  DOCUMENT_STATUSES,
  DOCUMENT_RELATION_TYPES,
  DOCUMENT_LINE_TYPES,
  INSTALLMENT_STATUSES,
  MAX_DOCUMENT_LINES,
  MAX_INSTALLMENTS,
  MAX_DISCOUNT_PERCENT,
  MIN_DISCOUNT_PERCENT,
  MAX_LINE_QUANTITY,
  MAX_DOCUMENT_AMOUNT,
  DOCUMENTS_REQUIRING_SUPPLIER_ARRAY,
  DOCUMENTS_REQUIRING_CUSTOMER_ARRAY,
} from "../constants/document";
import { priceSchema } from "./business";
import Decimal from "decimal.js";

// ============================================================================
// ENUMS
// ============================================================================

export const documentTypeSchema = z.enum([
  DOCUMENT_TYPES.QUOTE,
  DOCUMENT_TYPES.PROFORMA,
  DOCUMENT_TYPES.ORDER,
  DOCUMENT_TYPES.DELIVERY_NOTE,
  DOCUMENT_TYPES.INVOICE,
  DOCUMENT_TYPES.CREDIT_NOTE,
  DOCUMENT_TYPES.DEBIT_NOTE,
  DOCUMENT_TYPES.SUPPLIER_ORDER,
  DOCUMENT_TYPES.ARCHIVED,
]);

export const documentStatusCategorySchema = z.enum([
  DOCUMENT_STATUS_CATEGORIES.DRAFT_PHASE,
  DOCUMENT_STATUS_CATEGORIES.APPROVAL_PHASE,
  DOCUMENT_STATUS_CATEGORIES.ACTIVE_PHASE,
  DOCUMENT_STATUS_CATEGORIES.FULFILLMENT_PHASE,
  DOCUMENT_STATUS_CATEGORIES.PAYMENT_PHASE,
  DOCUMENT_STATUS_CATEGORIES.CLOSED_PHASE,
]);

export const documentStatusSchema = z.enum([
  DOCUMENT_STATUSES.DRAFT,
  DOCUMENT_STATUSES.PENDING_APPROVAL,
  DOCUMENT_STATUSES.SENT,
  DOCUMENT_STATUSES.ACCEPTED,
  DOCUMENT_STATUSES.REJECTED,
  DOCUMENT_STATUSES.PREPARING,
  DOCUMENT_STATUSES.PARTIALLY_FULFILLED,
  DOCUMENT_STATUSES.FULFILLED,
  DOCUMENT_STATUSES.IN_TRANSIT,
  DOCUMENT_STATUSES.DELIVERED,
  DOCUMENT_STATUSES.UNPAID,
  DOCUMENT_STATUSES.PARTIALLY_PAID,
  DOCUMENT_STATUSES.PAID,
  DOCUMENT_STATUSES.OVERDUE,
  DOCUMENT_STATUSES.VOIDED,
  DOCUMENT_STATUSES.CLOSED,
]);

export const documentRelationTypeSchema = z.enum([
  DOCUMENT_RELATION_TYPES.CONVERTS_TO,
  DOCUMENT_RELATION_TYPES.SPLITS_FROM,
  DOCUMENT_RELATION_TYPES.MERGES_INTO,
  DOCUMENT_RELATION_TYPES.CREDITS,
  DOCUMENT_RELATION_TYPES.AMENDS,
]);

export const documentLineTypeSchema = z.enum([
  DOCUMENT_LINE_TYPES.PRODUCT,
  DOCUMENT_LINE_TYPES.SERVICE,
  DOCUMENT_LINE_TYPES.DISCOUNT,
  DOCUMENT_LINE_TYPES.SUBTOTAL,
  DOCUMENT_LINE_TYPES.TEXT,
  DOCUMENT_LINE_TYPES.PAGE_BREAK,
]);

export const installmentStatusSchema = z.enum([
  INSTALLMENT_STATUSES.PENDING,
  INSTALLMENT_STATUSES.PAID,
  INSTALLMENT_STATUSES.OVERDUE,
  INSTALLMENT_STATUSES.CANCELLED,
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

const moneySchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
  max: MAX_DOCUMENT_AMOUNT,
  defaultValue: 0,
});

const quantitySchema = (defaultValue?: number) =>
  createDecimalSchema(6, {
    positiveOnly: true,
    min: 0,
    max: MAX_LINE_QUANTITY,
    defaultValue: defaultValue,
  });

const discountPercentSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: MIN_DISCOUNT_PERCENT,
  max: MAX_DISCOUNT_PERCENT,
  defaultValue: 0,
});

const taxPercentSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
  max: 100,
});

const exchangeRateSchema = createDecimalSchema(6, {
  positiveOnly: true,
  min: 0,
});

const installmentPercentSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
  max: 100,
});

// ============================================================================
// DOCUMENT LINE SCHEMAS
// ============================================================================

export const documentLineIdSchema = createIdSchema(
  "ID Document Line non valido",
);

/**
 * Raw object shape for DocumentLine — no strict, used for omit/partial.
 */
const documentLineShape = z.object({
  productVariantId: createIdSchema("Product Variant ID non valido")
    .optional()
    .nullable(),
  productId: createIdSchema("Product ID non valido").optional().nullable(),
  lineNumber: z.number().int().positive("Line number deve essere positivo"),
  lineType: documentLineTypeSchema.default(DOCUMENT_LINE_TYPES.PRODUCT),
  code: z.string().max(100).optional().nullable(),
  nameSystem: z
    .string()
    .min(1, "Nome sistema obbligatorio")
    .max(255, "Nome max 255 caratteri"),
  descriptionSystem: z.string().max(5000).optional().nullable(),
  nameCustomer: z.string().max(255).optional().nullable(),
  descriptionCustomer: z.string().max(5000).optional().nullable(),
  quantity: quantitySchema(1),
  unit: z.string().max(20).default("pz"),
  unitPrice: priceSchema({ defaultValue: 0 }),
  unitCost: priceSchema({ defaultValue: 0 }),
  discountPercent: discountPercentSchema,
  discountAmount: moneySchema,
  lineTotal: moneySchema,
  taxRuleId: createIdSchema("Tax Rule ID non valido").optional().nullable(),
  taxPercent: taxPercentSchema.default(new Decimal(22)),
  taxAmount: moneySchema,
  vatNatureCode: z.string().max(10).optional().nullable(),
  vatNormReference: z.string().max(255).optional().nullable(),
  lineTotalWithTax: moneySchema,
  notes: z.string().max(1000).optional().nullable(),
  customFields: inputJsonValueSchema.optional().nullable(),
  warehouseId: createIdSchema("Warehouse ID non valido").optional().nullable(),
  parentLineId: documentLineIdSchema.optional().nullable(),
  isComponent: z.boolean().default(false),
  quantityInvoiced: quantitySchema(0),
  quantityDelivered: quantitySchema(0),
  quantityReturned: quantitySchema(0),
  originalUnitPrice: priceSchema().optional().nullable(),
  priceOverrideReason: z.string().max(500).optional().nullable(),
});

/** Schema for creating a DocumentLine. */
export const createDocumentLineSchema = documentLineShape.strict();

/** Schema for updating a DocumentLine — lineNumber is immutable. */
export const updateDocumentLineSchema = documentLineShape
  .omit({ lineNumber: true })
  .partial()
  .strict();

// ============================================================================
// PAYMENT INSTALLMENT SCHEMAS
// ============================================================================

export const installmentIdSchema = createIdSchema("ID Installment non valido");

/**
 * Raw object shape for Installment.
 */
const installmentShape = z.object({
  installmentNumber: z.number().int().positive().default(1),
  percentage: installmentPercentSchema,
  amount: moneySchema,
  dueDate: isoDateSchema(),
  notes: z.string().max(500).optional().nullable(),
  paymentMethodId: createIdSchema("Payment Method ID non valido")
    .optional()
    .nullable(),
});

/** Schema for creating an Installment. */
export const createInstallmentSchema = installmentShape.strict();

/** Schema for updating an Installment — all fields optional. */
export const updateInstallmentSchema = installmentShape.partial().strict();

export const payInstallmentSchema = z
  .object({
    paidAmount: moneySchema,

    paidDate: isoDateSchema().default(() => new Date().toISOString()),

    paymentReference: z.string().max(100).optional().nullable(),

    bankTransactionId: z.string().max(100).optional().nullable(),

    notes: z.string().max(500).optional().nullable(),
  })
  .strict();

// ============================================================================
// DOCUMENT SCHEMAS
// ============================================================================

export const documentIdSchema = createIdSchema("ID Document non valido");

/**
 * Raw object shape for Document — no refinements.
 */
const documentShape = z.object({
  documentType: documentTypeSchema,
  statusCategory: documentStatusCategorySchema.default(
    DOCUMENT_STATUS_CATEGORIES.DRAFT_PHASE,
  ),
  status: documentStatusSchema.default(DOCUMENT_STATUSES.DRAFT),
  documentYear: z
    .number()
    .int()
    .min(2000)
    .max(2100)
    .default(() => new Date().getFullYear()),

  companyId: createIdSchema("Company ID non valido"),
  customerId: createIdSchema("Customer ID non valido").optional().nullable(),
  supplierId: createIdSchema("Supplier ID non valido").optional().nullable(),
  contactId: createIdSchema("Contact ID non valido").optional().nullable(),
  opportunityId: createIdSchema("Opportunity ID non valido")
    .optional()
    .nullable(),
  leadId: createIdSchema("Lead ID non valido").optional().nullable(),
  warehouseId: createIdSchema("Warehouse ID non valido").optional().nullable(),

  documentDate: isoDateSchema().default(() => new Date().toISOString()),
  dueDate: isoDateSchema(),
  deliveryDate: isoDateSchema(),
  validUntil: isoDateSchema(),
  parentDocumentId: documentIdSchema.optional().nullable(),

  // Customer snapshot
  customerName: z.string().min(1, "Nome cliente obbligatorio").max(255),
  customerVatNumber: z.string().max(20).optional().nullable(),
  customerTaxCode: z.string().max(20).optional().nullable(),
  customerPec: z
    .string()
    .email("PEC non valida")
    .max(255)
    .optional()
    .nullable(),
  customerSdiCode: z.string().max(7).optional().nullable(),
  customerAddress: z.string().max(255).optional().nullable(),
  customerCity: z.string().max(100).optional().nullable(),
  customerPostalCode: z.string().max(20).optional().nullable(),
  customerProvince: z.string().max(2).optional().nullable(),
  customerCountryCode: countryCodeBaseSchema.default("IT"),
  customerEmail: emailSchema().optional().nullable(),
  customerPhone: phoneSchema,

  // Shipping
  shippingName: z.string().max(255).optional().nullable(),
  shippingAddress: z.string().max(255).optional().nullable(),
  shippingCity: z.string().max(100).optional().nullable(),
  shippingPostalCode: z.string().max(20).optional().nullable(),
  shippingProvince: z.string().max(2).optional().nullable(),
  shippingCountryCode: countryCodeBaseSchema.optional().nullable(),

  // Amounts
  subtotal: moneySchema,
  discountPercent: discountPercentSchema,
  discountAmount: moneySchema,
  shippingCost: moneySchema,
  shippingTaxAmount: moneySchema,
  taxableAmount: moneySchema,
  taxAmount: moneySchema,
  totalAmount: moneySchema,
  paidAmount: moneySchema,
  currencyCode: currencyCodeBaseSchema.default("EUR"),
  exchangeRate: exchangeRateSchema.default(new Decimal(1.0)),
  exchangeRateDate: isoDateSchema().default(() => new Date().toISOString()),
  baseCurrencyCode: currencyCodeBaseSchema.default("EUR"),

  // Payment
  paymentMethodId: createIdSchema("Payment Method ID non valido")
    .optional()
    .nullable(),
  paymentMethod: z.string().max(50).default("bank_transfer"),
  paymentTerms: z.string().max(100).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankIban: z.string().max(34).optional().nullable(),
  bankSwift: z.string().max(11).optional().nullable(),

  // Notes
  notes: z.string().max(5000).optional().nullable(),
  internalNotes: z.string().max(5000).optional().nullable(),
  termsAndConditions: z.string().max(10000).optional().nullable(),
  customFields: inputJsonValueSchema.optional().nullable(),

  // Lines & Installments
  lines: z
    .array(createDocumentLineSchema)
    .max(MAX_DOCUMENT_LINES, `Massimo ${MAX_DOCUMENT_LINES} righe`)
    .optional()
    .default([]),
  installments: z
    .array(createInstallmentSchema)
    .max(MAX_INSTALLMENTS, `Massimo ${MAX_INSTALLMENTS} rate`)
    .optional()
    .default([]),
});

/**
 * Schema for creating a Document — includes customer/supplier and
 * installment sum cross-field validation.
 */
export const createDocumentSchema = documentShape
  .strict()
  .refine(
    (data) => {
      if (
        DOCUMENTS_REQUIRING_CUSTOMER_ARRAY.includes(data.documentType as any) &&
        !data.customerId
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Cliente obbligatorio per questo tipo di documento",
      path: ["customerId"],
    },
  )
  .refine(
    (data) => {
      if (
        DOCUMENTS_REQUIRING_SUPPLIER_ARRAY.includes(data.documentType as any) &&
        !data.supplierId
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Fornitore obbligatorio per ordini fornitore",
      path: ["supplierId"],
    },
  )
  .refine(
    (data) => {
      if (data.installments && data.installments.length > 0) {
        const totalPercentage = data.installments.reduce(
          (sum, inst) => sum + Number(inst.percentage),
          0,
        );
        return Math.abs(totalPercentage - 100) < 0.01;
      }
      return true;
    },
    {
      message: "La somma delle percentuali delle rate deve essere 100%",
      path: ["installments"],
    },
  );

/**
 * Schema for updating a Document — immutable structural fields excluded.
 * documentType, documentYear, companyId, lines and installments cannot
 * change after creation; manage them via dedicated endpoints.
 */
export const updateDocumentSchema = documentShape
  .omit({
    documentType: true,
    documentYear: true,
    companyId: true,
    lines: true,
    installments: true,
  })
  .partial()
  .strict();

const documentStatusUpdateShape = z.object({
  status: documentStatusSchema,
  statusCategory: documentStatusCategorySchema.optional(),
  reason: z.string().max(500).optional().nullable(),
  voidedReason: z.string().max(1000).optional().nullable(),
});

/**
 * Schema for updating Document status — voidedReason required when VOIDED.
 */
export const updateDocumentStatusSchema = documentStatusUpdateShape
  .strict()
  .refine(
    (data) => {
      if (data.status === DOCUMENT_STATUSES.VOIDED && !data.voidedReason)
        return false;
      return true;
    },
    {
      message: "Motivo annullamento obbligatorio per documenti annullati",
      path: ["voidedReason"],
    },
  );

export const approveDocumentSchema = z
  .object({
    notes: z.string().max(500).optional().nullable(),
  })
  .strict();

export const rejectDocumentSchema = z
  .object({
    reason: z.string().min(1, "Motivo rifiuto obbligatorio").max(1000),
  })
  .strict();

export const sendDocumentSchema = z
  .object({
    email: emailSchema(),

    subject: z.string().min(1, "Oggetto obbligatorio").max(255),

    body: z.string().min(1, "Corpo email obbligatorio").max(10000),

    cc: z.array(emailSchema()).optional(),

    bcc: z.array(emailSchema()).optional(),

    attachPdf: z.boolean().default(true),

    attachXml: z.boolean().default(false),
  })
  .strict();

// ============================================================================
// DOCUMENT RELATION SCHEMAS
// ============================================================================

const documentRelationShape = z.object({
  sourceDocumentId: documentIdSchema,
  targetDocumentId: documentIdSchema,
  relationType: documentRelationTypeSchema,
});

/**
 * Schema for creating a Document relation — source and target must differ.
 */
export const createDocumentRelationSchema = documentRelationShape
  .strict()
  .refine((data) => data.sourceDocumentId !== data.targetDocumentId, {
    message: "Documento sorgente e destinazione devono essere diversi",
    path: ["targetDocumentId"],
  });

// ============================================================================
// BULK OPERATIONS SCHEMAS
// ============================================================================

export const bulkUpdateDocumentsStatusSchema = z
  .object({
    documentIds: z
      .array(documentIdSchema)
      .min(1, "Seleziona almeno un documento"),

    status: documentStatusSchema,

    reason: z.string().max(500).optional().nullable(),
  })
  .strict();

export const bulkDeleteDocumentsSchema = z
  .object({
    documentIds: z
      .array(documentIdSchema)
      .min(1, "Seleziona almeno un documento"),

    reason: z.string().max(500).optional().nullable(),
  })
  .strict();

export const bulkSendDocumentsSchema = z
  .object({
    documentIds: z
      .array(documentIdSchema)
      .min(1, "Seleziona almeno un documento"),

    emailTemplate: z.string().optional(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const documentQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  documentType: documentTypeSchema.optional(),
  status: documentStatusSchema.optional(),
  statusCategory: documentStatusCategorySchema.optional(),
  customerId: createIdSchema("Customer ID non valido").optional(),
  supplierId: createIdSchema("Supplier ID non valido").optional(),
  opportunityId: createIdSchema("Opportunity ID non valido").optional(),
  leadId: createIdSchema("Lead ID non valido").optional(),
  warehouseId: createIdSchema("Warehouse ID non valido").optional(),
  assignedUserId: createIdSchema("User ID non valido").optional(),
  currencyCode: currencyCodeBaseSchema.optional(),
  minAmount: queryNumberSchema("Importo minimo non valido")
    .pipe(z.number().nonnegative().optional())
    .optional(),
  maxAmount: queryNumberSchema("Importo massimo non valido")
    .pipe(z.number().nonnegative().optional())
    .optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  dueDateFrom: isoDateSchema(),
  dueDateTo: isoDateSchema(),
  overdue: queryBooleanSchema,
  hasParent: queryBooleanSchema,
  deleted: queryBooleanSchema,
  sortBy: z
    .enum([
      "documentNumber",
      "documentDate",
      "dueDate",
      "totalAmount",
      "status",
      "customerName",
      "createdAt",
    ])
    .default("createdAt"),
  sortOrder: sortOrderSchema,
});

export const documentLineQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  documentId: documentIdSchema.optional(),
  productVariantId: createIdSchema("Product Variant ID non valido").optional(),
  productId: createIdSchema("Product ID non valido").optional(),
  lineType: documentLineTypeSchema.optional(),
  warehouseId: createIdSchema("Warehouse ID non valido").optional(),
  isComponent: queryBooleanSchema,
  sortBy: z
    .enum([
      "lineNumber",
      "code",
      "nameSystem",
      "quantity",
      "unitPrice",
      "lineTotal",
    ])
    .default("lineNumber"),
  sortOrder: sortOrderSchema,
});

export const installmentQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  documentId: documentIdSchema.optional(),
  status: installmentStatusSchema.optional(),
  dueDateFrom: isoDateSchema(),
  dueDateTo: isoDateSchema(),
  overdue: queryBooleanSchema,
  unpaid: queryBooleanSchema,
  sortBy: z
    .enum(["installmentNumber", "dueDate", "amount", "status"])
    .default("dueDate"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const documentIdParamSchema = z.object({
  id: documentIdSchema,
});

export const documentLineIdParamSchema = z.object({
  lineId: documentLineIdSchema,
});

export const documentCustomerIdParamSchema = z.object({
  customerId: createIdSchema("Customer ID non valido"),
});

export const documentSupplierIdParamSchema = z.object({
  supplierId: createIdSchema("Supplier ID non valido"),
});

export const documentAttachmentIdParamSchema = z.object({
  attachmentId: createIdSchema("Attachment ID non valido"),
});

export const installmentIdParamSchema = z.object({
  installmentId: installmentIdSchema,
});

// ============================================================================
// STATISTICS & REPORTS SCHEMAS
// ============================================================================

export const documentStatsSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  documentType: documentTypeSchema.optional(),
  customerId: createIdSchema("Customer ID non valido").optional(),
  groupBy: z
    .enum(["documentType", "status", "customer", "day", "week", "month"])
    .default("documentType"),
});

export const salesReportSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  customerId: createIdSchema("Customer ID non valido").optional(),
  productId: createIdSchema("Product ID non valido").optional(),
  groupBy: z
    .enum(["customer", "product", "category", "day", "week", "month"])
    .default("month"),
  includeVoided: z.boolean().default(false),
});

export const agingReportSchema = z.object({
  asOfDate: isoDateSchema().default(() => new Date().toISOString()),
  customerId: createIdSchema("Customer ID non valido").optional(),
  intervals: z.array(z.number().int().nonnegative()).default([30, 60, 90, 120]),
});

export const topProductsReportSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  limit: limitSchema,
});

// ============================================================================
// CALCULATION SCHEMAS
// ============================================================================

/**
 * Schema per ricalcolare totali documento
 */
export const recalculateDocumentSchema = z
  .object({
    applyDiscount: z.boolean().default(true),
    recalculateTax: z.boolean().default(true),
  })
  .strict();

// ============================================================================
// CONVERSION SCHEMAS
// ============================================================================

/**
 * Schema per duplicare documento
 */
export const duplicateDocumentSchema = z
  .object({
    includeLines: z.boolean().default(true),
    includeInstallments: z.boolean().default(false),
    status: documentStatusSchema.default("DRAFT"),
  })
  .strict();

export const convertDocumentSchema = z
  .object({
    targetDocumentType: documentTypeSchema,
    copyLines: z.boolean().default(true),
    copyInstallments: z.boolean().default(true),
    copyNotes: z.boolean().default(true),
    documentDate: isoDateSchema().optional(),
    notes: z.string().max(500).optional().nullable(),
  })
  .strict();

export const cloneDocumentSchema = z
  .object({
    documentDate: isoDateSchema().default(() => new Date().toISOString()),
    resetStatus: z.boolean().default(true),
    notes: z.string().max(500).optional().nullable(),
  })
  .strict();
