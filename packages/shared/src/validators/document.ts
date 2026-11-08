import { z } from "zod";
import { createCuidSchema, createIdSchema } from "./primitives/id";
import {
  discountPercentOptionalSchema,
  discountPercentSchema,
  exchangeRateSchema,
  moneySchema,
  positiveMoneySchema,
  quantityRequiredSchema,
  quantitySchema,
  unitAmountOptionalSchema,
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
  taxRuleIdBaseSchema,
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
  SYSTEM_DRIVEN_STATUSES,
  MAX_BULK_DOCUMENTS,
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

/** Base fields shared by every document line type. */
const documentLineBaseShape = z.object({
  // productId is intentionally absent: the server derives it from productVariantId.
  productVariantId: productVariantIdBaseSchema.nullish(),
  code: z.string().max(100).nullish(),
  nameSystem: z.string().min(1).max(255),
  descriptionSystem: z.string().max(5000).nullish(),
  nameCustomer: z.string().max(255).nullish(),
  descriptionCustomer: z.string().max(5000).nullish(),
  unit: z.string().max(20).nullish(),
  unitCost: unitAmountOptionalSchema,
  isReverseCharge: z.boolean().default(false),
  isSelfInvoice: z.boolean().default(false),
  matchStatus: matchStatusSchema.nullish(),
  notes: z.string().max(1000).nullish(),
  customFields: inputJsonValueSchema.nullish(),
  warehouseId: warehouseIdBaseSchema.nullish(),
  parentLineId: documentLineIdBaseSchema.nullish(),
  isComponent: z.boolean().default(false),
});

/** Priced line: price-list price (variant) or manual price (no variant). */
const pricedDocumentLineShape = documentLineBaseShape.extend({
  lineType: z.enum([
    DOCUMENT_LINE_TYPES.PRODUCT,
    DOCUMENT_LINE_TYPES.SERVICE,
    DOCUMENT_LINE_TYPES.DISCOUNT,
  ]),
  quantity: quantitySchema(1),
  unit: z.string().max(20).default("pz"),
  /**
   * No default on purpose. With a variant, a value is a manual price override;
   * without a variant it is the line price and is required (see createDocumentLineSchema).
   */
  unitPrice: unitAmountOptionalSchema,
  discountPercent: discountPercentSchema,
  discountAmount: moneySchema,
  taxRuleId: taxRuleIdBaseSchema,
});

/** Non-priced presentation line. It never contributes to document totals. */
const nonPricedDocumentLineShape = documentLineBaseShape.extend({
  lineType: z.enum([
    DOCUMENT_LINE_TYPES.TEXT,
    DOCUMENT_LINE_TYPES.PAGE_BREAK,
    DOCUMENT_LINE_TYPES.SUBTOTAL,
  ]),
  quantity: z.literal(0).default(0),
  unit: z.string().max(20).default(""),
  unitPrice: z.literal(0).default(0),
  discountPercent: z.literal(0).default(0),
  discountAmount: z.literal(0).default(0),
});

/**
 * Discriminated schema for creating a document line.
 * - Descriptive lines (TEXT, PAGE_BREAK, SUBTOTAL) must not reference a product variant.
 * - PRODUCT lines require productVariantId (every product has at least one variant).
 * - DISCOUNT lines are always manual: no variant allowed.
 * - Lines without a variant (manual lines) require an explicit unitPrice.
 */
export const createDocumentLineSchema = z
  .discriminatedUnion("lineType", [pricedDocumentLineShape, nonPricedDocumentLineShape])
  .superRefine((line, ctx) => {
    const hasVariant = Boolean(line.productVariantId);

    if (
      line.lineType === DOCUMENT_LINE_TYPES.TEXT ||
      line.lineType === DOCUMENT_LINE_TYPES.PAGE_BREAK ||
      line.lineType === DOCUMENT_LINE_TYPES.SUBTOTAL
    ) {
      if (hasVariant) {
        ctx.addIssue({
          code: "custom",
          message: "Le righe descrittive non possono riferire un prodotto",
          path: ["productVariantId"],
        });
      }
      return;
    }

    if (line.lineType === DOCUMENT_LINE_TYPES.PRODUCT && !hasVariant) {
      ctx.addIssue({
        code: "custom",
        message: "Variante obbligatoria per le righe prodotto",
        path: ["productVariantId"],
      });
    }

    if (line.lineType === DOCUMENT_LINE_TYPES.DISCOUNT && hasVariant) {
      ctx.addIssue({
        code: "custom",
        message: "Le righe sconto non possono riferire una variante",
        path: ["productVariantId"],
      });
    }

    if (!hasVariant && line.unitPrice === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "Prezzo obbligatorio per le righe manuali",
        path: ["unitPrice"],
      });
    }
  });

// ============================================================================
// PAYMENT INSTALLMENT SCHEMAS
// ============================================================================

export const installmentIdSchema = createCuidSchema("ID Installment non valido");

const installmentInputSchema = z
  .object({
    dueDate: isoDateSchema({ required: true }),
    amount: positiveMoneySchema,
    paymentMethodId: paymentMethodIdBaseSchema.nullish(),
    notes: z.string().max(500).nullish(),
  })
  .strict();

/** Replaces the whole installment plan of a draft; amounts must add up to the net payable amount. */
export const replaceInstallmentsSchema = z
  .object({ installments: z.array(installmentInputSchema).min(1).max(MAX_INSTALLMENTS) })
  .strict();

/** Generates the installment plan from a payment method (defaults to the document's method). */
export const generateInstallmentsSchema = z
  .object({ paymentMethodId: paymentMethodIdBaseSchema.optional() })
  .strict();

/**
 * Registers a payment on an installment. `expectedPaidAmount` is the paid amount the client
 * last saw; a mismatch rejects duplicate or stale submissions.
 */
export const payInstallmentSchema = z
  .object({
    paidAmount: positiveMoneySchema,
    expectedPaidAmount: moneySchema,
    paidDate: isoDateSchema({ required: true }).default(() => new Date().toISOString()),
    paymentMethodId: paymentMethodIdBaseSchema.optional(),
    paymentReference: z.string().max(100).nullish(),
    bankTransactionId: z.string().max(100).nullish(),
  })
  .strict();

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
  discountPercent: discountPercentOptionalSchema,
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

  // Bank snapshot
  paymentBankAccountId: bankAccountIdBaseSchema.nullish(),
  bankName: z.string().max(100).nullish(),
  bankIban: ibanSchema.nullish(),
  bankSwift: bicSchema.nullish(),
  bankAccountHolder: z.string().max(255).nullish(),

  // Withholding / social security (INBOUND). Amounts are computed server-side.
  withholdingTaxTypeId: withholdingTaxTypeIdBaseSchema.nullish(),

  notes: z.string().max(5000).nullish(),
  internalNotes: z.string().max(5000).nullish(),
  termsAndConditions: z.string().max(10000).nullish(),
  customFields: inputJsonValueSchema.nullish(),
});

/**
 * Schema for creating a Document.
 * Direction is derived from documentType (see isInboundDocumentType), not sent by the client.
 * Installments are not part of the payload: they are generated at formalization from the payment
 * method, or managed through the /installments endpoints while the document is a draft.
 */
export const createDocumentSchema = documentShape
  .extend({
    documentDate: isoDateSchema({ required: true }).default(() => new Date().toISOString()),
    discountPercent: discountPercentSchema,
    currencyCode: currencyCodeBaseSchema.default("EUR"),
    exchangeRate: exchangeRateSchema.default("1.0"),
    exchangeRateDate: isoDateSchema().default(() => new Date().toISOString()),
    baseCurrencyCode: currencyCodeBaseSchema.default("EUR"),
    lines: z
      .array(createDocumentLineSchema)
      .max(MAX_DOCUMENT_LINES, `Massimo ${MAX_DOCUMENT_LINES} righe`)
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
  });

/**
 * Schema for updating a Document — documentType is immutable; lines, installments and
 * status are managed through dedicated endpoints. Built from the default-free shape,
 * so a partial payload never injects values.
 */
export const updateDocumentSchema = documentShape.omit({ documentType: true }).partial().strict();

export const updateDocumentStatusSchema = z
  .object({
    status: documentStatusSchema.exclude(SYSTEM_DRIVEN_STATUSES),
    reason: z.string().trim().max(500).nullish(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.status === DOCUMENT_STATUSES.REJECTED && !data.reason) {
      ctx.addIssue({
        code: "custom",
        message: "Motivo obbligatorio per il rifiuto",
        path: ["reason"],
      });
    }
  });

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
// BULK OPERATIONS SCHEMAS
// ============================================================================

/** IDs of the documents of a bulk request: 1 to MAX_BULK_DOCUMENTS, no duplicates. */
const bulkDocumentIdsSchema = z
  .array(documentIdSchema)
  .min(1, "Seleziona almeno un documento")
  .max(MAX_BULK_DOCUMENTS, `Massimo ${MAX_BULK_DOCUMENTS} documenti`)
  .refine((ids) => new Set(ids).size === ids.length, { message: "ID documenti duplicati" });

/**
 * Changes the status of several documents through the regular transition rules.
 * System-driven statuses, REJECTED and VOIDED are excluded: they have dedicated operations.
 */
export const bulkUpdateDocumentsStatusSchema = z
  .object({
    documentIds: bulkDocumentIdsSchema,
    status: documentStatusSchema.exclude([
      ...SYSTEM_DRIVEN_STATUSES,
      DOCUMENT_STATUSES.REJECTED,
      DOCUMENT_STATUSES.VOIDED,
    ]),
    reason: z.string().trim().max(500).nullish(),
  })
  .strict();

/** Soft-deletes several draft documents without a number. */
export const bulkDeleteDocumentsSchema = z.object({ documentIds: bulkDocumentIdsSchema }).strict();

/** Reorders the lines of a document: every line ID exactly once, in the new order. */
export const reorderDocumentLinesSchema = z
  .object({ lineIds: z.array(documentLineIdBaseSchema).min(1).max(MAX_DOCUMENT_LINES) })
  .strict()
  .refine((data) => new Set(data.lineIds).size === data.lineIds.length, {
    message: "ID righe duplicati",
    path: ["lineIds"],
  });

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

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const documentIdParamSchema = z.object({ id: documentIdBaseSchema });

export const documentLineIdParamSchema = z.object({
  id: documentIdBaseSchema,
  lineId: documentLineIdBaseSchema,
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
// CONVERSION SCHEMAS
// ============================================================================

/** One source line to convert; `quantity` is required for product/service lines and ignored for descriptive ones. */
const convertLineSchema = z
  .object({ lineId: documentLineIdBaseSchema, quantity: quantityRequiredSchema.optional() })
  .strict();

/**
 * Converts a document into another type, always as a DRAFT.
 * `lines` is allowed only for conversions that deliver part of the source (ORDER -> DELIVERY_NOTE);
 * when omitted, every line with a remaining quantity is converted.
 */
export const convertDocumentSchema = z
  .object({
    targetDocumentType: createDocumentTypeSchema,
    lines: z.array(convertLineSchema).min(1).max(MAX_DOCUMENT_LINES).optional(),
    documentDate: isoDateSchema({ required: true }).default(() => new Date().toISOString()),
    notes: z.string().max(5000).nullish(),
  })
  .strict()
  .refine(
    (data) => !data.lines || new Set(data.lines.map((l) => l.lineId)).size === data.lines.length,
    { message: "ID righe duplicati", path: ["lines"] },
  );

/** Clones a document as a new DRAFT of the same type, with the same counterparty. */
export const cloneDocumentSchema = z
  .object({
    documentDate: isoDateSchema({ required: true }).default(() => new Date().toISOString()),
    notes: z.string().max(5000).nullish(),
  })
  .strict();

/** Idempotency key sent by the client (for example a UUID); fits DocumentIdempotencyKey.key. */
export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(16, "Idempotency key troppo corta")
  .max(255)
  .regex(/^[A-Za-z0-9._:-]+$/, "Idempotency key non valida");
