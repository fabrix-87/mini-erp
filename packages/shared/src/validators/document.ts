import { z } from "zod";
import { createCuidSchema, createIdSchema, positiveNumbersSchema } from "./primitives/id";
import {
  discountPercentOptionalSchema,
  discountPercentSchema,
  exchangeRateSchema,
  moneyOptionalSchema,
  moneySchema,
  nullableDecimalSchema,
  percentOptionalSchema,
  quantityOptionalSchema,
  quantitySchema,
  taxPercentSchema,
  unitAmountOptionalSchema,
  unitAmountSchema,
} from "./primitives/decimal";
import { isoDateSchema } from "./primitives/date";

import { emailSchema } from "./primitives/string";
import {
  bankAccountIdBaseSchema,
  carrierIdBaseSchema,
  contactIdBaseSchema,
  currencyCodeBaseSchema,
  customerIdBaseSchema,
  documentIdBaseSchema,
  documentLineIdBaseSchema,
  inputJsonValueSchema,
  leadIdBaseSchema,
  opportunityIdBaseSchema,
  paymentMethodIdBaseSchema,
  productIdBaseSchema,
  productVariantIdBaseSchema,
  supplierIdBaseSchema,
  userIdSchema,
  warehouseIdBaseSchema,
  withholdingTaxTypeIdBaseSchema,
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
  DOCUMENTS_REQUIRING_CUSTOMER,
  DOCUMENTS_REQUIRING_SUPPLIER,
  DOCUMENT_DIRECTIONS,
  MATCH_STATUSES,
  DOCUMENT_SORT_OPTIONS,
  DOCUMENT_LINE_SORT_OPTIONS,
} from "../constants/document";
import { bicSchema, ibanSchema } from "./business";
import { isInboundDocumentType } from "../helpers";

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
  DOCUMENT_TYPES.SUPPLIER_INVOICE,
  DOCUMENT_TYPES.SUPPLIER_CREDIT_NOTE,
  DOCUMENT_TYPES.SUPPLIER_DELIVERY_NOTE,
  DOCUMENT_TYPES.SELF_INVOICE,
  DOCUMENT_TYPES.ARCHIVED,
]);

/** Document types a user may create manually. SELF_INVOICE is system-generated (reverse charge). */
export const createDocumentTypeSchema = documentTypeSchema.exclude([DOCUMENT_TYPES.SELF_INVOICE]);

export const documentLineTypeSchema = z.enum([
  DOCUMENT_LINE_TYPES.DISCOUNT,
  DOCUMENT_LINE_TYPES.PAGE_BREAK,
  DOCUMENT_LINE_TYPES.PRODUCT,
  DOCUMENT_LINE_TYPES.SERVICE,
  DOCUMENT_LINE_TYPES.SUBTOTAL,
  DOCUMENT_LINE_TYPES.TEXT,
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
  DOCUMENT_RELATION_TYPES.CLONED_FROM,
  DOCUMENT_RELATION_TYPES.SPLITS_FROM,
  DOCUMENT_RELATION_TYPES.MERGES_INTO,
  DOCUMENT_RELATION_TYPES.CREDITS,
  DOCUMENT_RELATION_TYPES.AMENDS,
  DOCUMENT_RELATION_TYPES.FULFILLS,
  DOCUMENT_RELATION_TYPES.MIRRORS,
]);

export const installmentStatusSchema = z.enum([
  INSTALLMENT_STATUSES.CANCELLED,
  INSTALLMENT_STATUSES.OVERDUE,
  INSTALLMENT_STATUSES.PAID,
  INSTALLMENT_STATUSES.PARTIAL,
  INSTALLMENT_STATUSES.PENDING,
]);

export const documentDirectionSchema = z.enum([
  DOCUMENT_DIRECTIONS.OUTBOUND,
  DOCUMENT_DIRECTIONS.INBOUND,
]);

export const matchStatusSchema = z.enum([
  MATCH_STATUSES.NOT_MATCHED,
  MATCH_STATUSES.MATCHED,
  MATCH_STATUSES.MATCHED_WITH_VARIANCE,
  MATCH_STATUSES.DISPUTED,
]);

// ============================================================================
// DOCUMENT LINE SCHEMAS
// ============================================================================

export const documentLineIdSchema = documentLineIdBaseSchema;

/** Raw DocumentLine shape — no defaults, safe for omit/partial. */
const documentLineShape = z.object({
  productVariantId: productVariantIdBaseSchema.nullish(),
  productId: productIdBaseSchema.nullish(),
  lineNumber: z.number().int().positive("Line number deve essere positivo"),
  lineType: documentLineTypeSchema,
  code: z.string().max(100).nullish(),
  nameSystem: z.string().min(1, "Nome sistema obbligatorio").max(255, "Nome max 255 caratteri"),
  descriptionSystem: z.string().max(5000).nullish(),
  nameCustomer: z.string().max(255).nullish(),
  descriptionCustomer: z.string().max(5000).nullish(),
  quantity: quantityOptionalSchema,
  unit: z.string().max(20),
  unitPrice: unitAmountOptionalSchema,
  unitCost: unitAmountOptionalSchema,
  discountPercent: discountPercentOptionalSchema,
  discountAmount: moneyOptionalSchema,
  lineTotal: moneyOptionalSchema,
  taxRuleId: createIdSchema("Tax Rule ID non valido").nullish(),
  taxPercent: taxPercentSchema,
  taxAmount: moneyOptionalSchema,
  vatNatureCode: z.string().max(10).nullish(),
  vatNormReference: z.string().max(255).nullish(),
  isReverseCharge: z.boolean(),
  isSelfInvoice: z.boolean(),
  /** Only meaningful on SUPPLIER_INVOICE lines (enforced in createDocumentSchema). */
  matchStatus: matchStatusSchema.nullish(),
  lineTotalWithTax: moneyOptionalSchema,
  notes: z.string().max(1000).nullish(),
  customFields: inputJsonValueSchema.nullish(),
  warehouseId: warehouseIdBaseSchema.nullish(),
  parentLineId: documentLineIdBaseSchema.nullish(),
  isComponent: z.boolean(),
  originalUnitPrice: nullableDecimalSchema(unitAmountOptionalSchema),
  priceOverrideReason: z.string().max(500).nullish(),
});

/**
 * Schema for creating a DocumentLine.
 * quantityInvoiced/Delivered/Returned are server-managed fulfillment counters and are not accepted.
 */
export const createDocumentLineSchema = documentLineShape
  .extend({
    lineType: documentLineTypeSchema.default(DOCUMENT_LINE_TYPES.PRODUCT),
    quantity: quantitySchema(1),
    unit: z.string().max(20).default("pz"),
    unitPrice: unitAmountSchema,
    unitCost: unitAmountSchema,
    discountPercent: discountPercentSchema,
    discountAmount: moneySchema,
    lineTotal: moneySchema,
    taxPercent: taxPercentSchema,
    taxAmount: moneySchema,
    lineTotalWithTax: moneySchema,
    isReverseCharge: z.boolean().default(false),
    isSelfInvoice: z.boolean().default(false),
    isComponent: z.boolean().default(false),
  })
  .strict();

/** Schema for updating a DocumentLine — lineNumber is immutable. */
export const updateDocumentLineSchema = documentLineShape
  .omit({ lineNumber: true })
  .partial()
  .strict();

// ============================================================================
// PAYMENT INSTALLMENT SCHEMAS
// ============================================================================

export const installmentIdSchema = createCuidSchema("ID Installment non valido");

/**
 * Raw object shape for Installment.
 */
const installmentShape = z.object({
  installmentNumber: z.number().int().positive(),
  percentage: percentOptionalSchema,
  amount: moneyOptionalSchema,
  dueDate: isoDateSchema({ required: true }),
  status: installmentStatusSchema,
  notes: z.string().max(500).nullish(),
  paymentMethodId: paymentMethodIdBaseSchema.nullish(),
});

export const createInstallmentSchema = installmentShape
  .extend({
    installmentNumber: z.number().int().positive().default(1),
    amount: moneySchema,
    status: installmentStatusSchema.default(INSTALLMENT_STATUSES.PENDING),
  })
  .strict();

export const updateInstallmentSchema = installmentShape.partial().strict();

export const payInstallmentSchema = z
  .object({
    paidAmount: moneySchema,
    paymentMethodId: paymentMethodIdBaseSchema,
    paidDate: isoDateSchema({ required: true }).default(() => new Date().toISOString()),
    paymentReference: z.string().max(100).optional().nullable(),
    bankTransactionId: z.string().max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  })
  .strict();

export const generateInstallmentPlanSchema = z.object({
  count: positiveNumbersSchema,
  firstDueDate: isoDateSchema({ required: true }),
  intervalDays: positiveNumbersSchema,
  paymentMethodId: paymentMethodIdBaseSchema,
});

// ============================================================================
// DOCUMENT SCHEMAS
// ============================================================================

export const documentIdSchema = documentIdBaseSchema;

/**
 * Raw Document shape — no defaults, safe for omit/partial.
 * Server-only fields (documentNumber, sequenceNumber, vatRegister*, bankDetailsMismatch,
 * bankDetailsVerified*, snapshotLockedAt, lifecycle timestamps, paidAmount, withholding
 * amounts/code/base) are deliberately excluded. Party snapshots (COUNTERPARTY, TENANT,
 * SHIPPING, CARRIER) are built by the server from the source records.
 */
const documentShape = z.object({
  documentType: createDocumentTypeSchema,

  customerId: customerIdBaseSchema.nullish(),
  supplierId: supplierIdBaseSchema.nullish(),
  contactId: contactIdBaseSchema.nullish(),
  assignedUserId: userIdSchema.nullish(),
  opportunityId: opportunityIdBaseSchema.nullish(),
  leadId: leadIdBaseSchema.nullish(),
  warehouseId: warehouseIdBaseSchema.nullish(),
  /** CompanyAddress used by the server to build the SHIPPING party snapshot. */
  shippingAddressId: createCuidSchema("Shipping address ID non valido").nullish(),

  documentDate: isoDateSchema(),
  dueDate: isoDateSchema(),
  deliveryDate: isoDateSchema(),
  validUntil: isoDateSchema(),

  // INBOUND only
  counterpartyDocumentNumber: z.string().trim().min(1).max(50).nullish(),
  receivedDate: isoDateSchema(),
  registrationDate: isoDateSchema(),

  // Amounts
  subtotal: moneyOptionalSchema,
  discountPercent: discountPercentOptionalSchema,
  discountAmount: moneyOptionalSchema,
  shippingCost: moneyOptionalSchema,
  shippingTaxAmount: moneyOptionalSchema,
  taxableAmount: moneyOptionalSchema,
  taxAmount: moneyOptionalSchema,
  totalAmount: moneyOptionalSchema,
  netPayableAmount: moneyOptionalSchema,
  currencyCode: currencyCodeBaseSchema.optional(),
  exchangeRate: exchangeRateSchema,
  exchangeRateDate: isoDateSchema(),
  baseCurrencyCode: currencyCodeBaseSchema.optional(),

  // Logistics
  carrierId: carrierIdBaseSchema.nullish(),
  trackingNumber: z.string().trim().max(100).nullish(),

  // Payment snapshot (code/label are resolved by the server when paymentMethodId is set)
  paymentMethodId: paymentMethodIdBaseSchema.nullish(),
  paymentMethodCode: z.string().trim().min(1).max(50).optional(),
  paymentTermsLabel: z.string().max(100).nullish(),

  // Bank snapshot
  paymentBankAccountId: bankAccountIdBaseSchema.nullish(),
  bankName: z.string().max(100).nullish(),
  bankIban: ibanSchema.nullish(),
  bankSwift: bicSchema.nullish(),
  bankAccountHolder: z.string().max(255).nullish(),

  // Withholding / social security (INBOUND). Amounts are computed server-side.
  withholdingTaxTypeId: withholdingTaxTypeIdBaseSchema.nullish(),
  withholdingTaxPercent: nullableDecimalSchema(percentOptionalSchema),
  contributionPercent: nullableDecimalSchema(percentOptionalSchema),

  notes: z.string().max(5000).nullish(),
  internalNotes: z.string().max(5000).nullish(),
  termsAndConditions: z.string().max(10000).nullish(),
  customFields: inputJsonValueSchema.nullish(),
});

/**
 * Schema for creating a Document.
 * Direction is derived from documentType (see isInboundDocumentType), not sent by the client.
 */
export const createDocumentSchema = documentShape
  .extend({
    documentYear: z
      .number()
      .int()
      .min(2000)
      .max(2100)
      .default(() => new Date().getFullYear()),
    documentDate: isoDateSchema().default(() => new Date().toISOString()),
    subtotal: moneySchema,
    discountPercent: discountPercentSchema,
    discountAmount: moneySchema,
    shippingCost: moneySchema,
    shippingTaxAmount: moneySchema,
    taxableAmount: moneySchema,
    taxAmount: moneySchema,
    totalAmount: moneySchema,
    netPayableAmount: moneySchema,
    currencyCode: currencyCodeBaseSchema.default("EUR"),
    exchangeRate: exchangeRateSchema.default("1.0"),
    exchangeRateDate: isoDateSchema().default(() => new Date().toISOString()),
    baseCurrencyCode: currencyCodeBaseSchema.default("EUR"),
    lines: z
      .array(createDocumentLineSchema)
      .max(MAX_DOCUMENT_LINES, `Massimo ${MAX_DOCUMENT_LINES} righe`)
      .default([]),
    installments: z
      .array(createInstallmentSchema)
      .max(MAX_INSTALLMENTS, `Massimo ${MAX_INSTALLMENTS} rate`)
      .default([]),
  })
  .strict()
  .superRefine((data, ctx) => {
    const inbound = isInboundDocumentType(data.documentType);

    if (DOCUMENTS_REQUIRING_CUSTOMER.includes(data.documentType) && !data.customerId) {
      ctx.addIssue({
        code: "custom",
        message: "Cliente obbligatorio per questo tipo di documento",
        path: ["customerId"],
      });
    }

    if (DOCUMENTS_REQUIRING_SUPPLIER.includes(data.documentType) && !data.supplierId) {
      ctx.addIssue({
        code: "custom",
        message: "Fornitore obbligatorio per questo tipo di documento",
        path: ["supplierId"],
      });
    }

    if (inbound && !data.counterpartyDocumentNumber) {
      ctx.addIssue({
        code: "custom",
        message: "Numero documento del fornitore obbligatorio",
        path: ["counterpartyDocumentNumber"],
      });
    }

    if (!inbound) {
      const inboundOnly = [
        "counterpartyDocumentNumber",
        "receivedDate",
        "registrationDate",
        "withholdingTaxTypeId",
      ] as const;
      for (const field of inboundOnly) {
        if (data[field]) {
          ctx.addIssue({
            code: "custom",
            message: "Campo ammesso solo per documenti in ingresso",
            path: [field],
          });
        }
      }
    }

    if (
      data.documentType !== DOCUMENT_TYPES.SUPPLIER_INVOICE &&
      data.lines.some((line) => line.matchStatus)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "matchStatus è ammesso solo su righe di fattura fornitore",
        path: ["lines"],
      });
    }

    if (data.installments.length > 0) {
      const total = data.installments.reduce((sum, inst) => sum + Number(inst.percentage), 0);
      if (Math.abs(total - 100) >= 0.01) {
        ctx.addIssue({
          code: "custom",
          message: "La somma delle percentuali delle rate deve essere 100%",
          path: ["installments"],
        });
      }
    }
  });

/**
 * Schema for updating a Document — documentType is immutable; lines, installments and
 * status are managed through dedicated endpoints. Built from the default-free shape,
 * so a partial payload never injects values.
 */
export const updateDocumentSchema = documentShape.omit({ documentType: true }).partial().strict();

export const updateDocumentStatusSchema = z
  .object({
    status: documentStatusSchema.exclude([DOCUMENT_STATUSES.VOIDED]),
    reason: z.string().max(500).nullish(),
  })
  .strict();

/** Voids a numbered document. The reason is mandatory and stored in Document.voidedReason. */
export const voidDocumentSchema = z
  .object({
    voidedReason: z.string().trim().min(3, "Motivo obbligatorio").max(1000),
  })
  .strict();

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
    recipientEmail: emailSchema(),

    subject: z.string().min(1, "Oggetto obbligatorio").max(255),

    message: z.string().min(1, "Corpo email obbligatorio").max(10000),

    cc: z.array(emailSchema()).optional(),

    bcc: z.array(emailSchema()).optional(),

    attachPDF: z.boolean().default(true),

    attachXML: z.boolean().default(false),
  })
  .strict();

// ============================================================================
// DOCUMENT RELATION SCHEMAS
// ============================================================================

const documentRelationShape = z.object({
  sourceDocumentId: documentIdSchema,
  targetDocumentId: documentIdSchema,
  /** MIRRORS is excluded: it is created by the server in the same transaction as the source document. */
  relationType: documentRelationTypeSchema.exclude([DOCUMENT_RELATION_TYPES.MIRRORS]),
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
    documentIds: z.array(documentIdSchema).min(1, "Seleziona almeno un documento"),

    status: documentStatusSchema,

    reason: z.string().max(500).optional().nullable(),
  })
  .strict();

export const bulkDeleteDocumentsSchema = z
  .object({
    documentIds: z.array(documentIdSchema).min(1, "Seleziona almeno un documento"),

    reason: z.string().max(500).optional().nullable(),
  })
  .strict();

export const bulkSendDocumentsSchema = z
  .object({
    documentIds: z.array(documentIdSchema).min(1, "Seleziona almeno un documento"),

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
  customerId: customerIdBaseSchema.optional(),
  supplierId: supplierIdBaseSchema.optional(),
  opportunityId: opportunityIdBaseSchema.optional(),
  leadId: leadIdBaseSchema.optional(),
  warehouseId: warehouseIdBaseSchema.optional(),
  assignedUserId: userIdSchema.optional(),
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
  deleted: queryBooleanSchema,
  direction: documentDirectionSchema.optional(),
  carrierId: carrierIdBaseSchema.optional(),
  bankDetailsMismatch: queryBooleanSchema,
  sortBy: z.enum(DOCUMENT_SORT_OPTIONS).default("createdAt"),
  sortOrder: sortOrderSchema,
});

export const documentLineQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  documentId: documentIdSchema.optional(),
  productVariantId: productVariantIdBaseSchema.optional(),
  productId: productIdBaseSchema.optional(),
  lineType: documentLineTypeSchema.optional(),
  warehouseId: warehouseIdBaseSchema.optional(),
  isComponent: queryBooleanSchema,
  sortBy: z.enum(DOCUMENT_LINE_SORT_OPTIONS).default("lineNumber"),
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
  sortBy: z.enum(["installmentNumber", "dueDate", "amount", "status"]).default("dueDate"),
  sortOrder: sortOrderSchema,
});

export const quantityDeliveredSchema = z.object({
  quantityDelivered: quantitySchema(0),
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const documentIdParamSchema = z.object({ id: documentIdBaseSchema });

export const documentLineIdParamSchema = z.object({
  id: documentIdBaseSchema,
  lineId: documentLineIdBaseSchema,
});

export const documentCustomerIdParamSchema = z.object({ customerId: customerIdBaseSchema });
export const documentSupplierIdParamSchema = z.object({ supplierId: supplierIdBaseSchema });

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
  customerId: customerIdBaseSchema.optional(),
  groupBy: z
    .enum(["documentType", "status", "customer", "day", "week", "month"])
    .default("documentType"),
});

export const salesReportSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  customerId: customerIdBaseSchema.optional(),
  productId: productIdBaseSchema.optional(),
  groupBy: z
    .enum(["customer", "product", "category", "day", "week", "month", "year"])
    .default("month"),
  includeVoided: z.boolean().default(false),
});

export const agingReportSchema = z.object({
  asOfDate: isoDateSchema().default(() => new Date().toISOString()),
  customerId: customerIdBaseSchema.optional(),
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
    documentDate: isoDateSchema(),
    notes: z.string().max(500).optional().nullable(),
    status: documentStatusSchema.default("DRAFT"),
    dueDate: isoDateSchema(),
  })
  .strict();

export const cloneDocumentSchema = z
  .object({
    documentDate: isoDateSchema().default(() => new Date().toISOString()),
    resetStatus: z.boolean().default(true),
    notes: z.string().max(500).optional().nullable(),
    warehouseId: warehouseIdBaseSchema.optional().nullable(),
    customerId: customerIdBaseSchema.optional().nullable(),
  })
  .strict();
