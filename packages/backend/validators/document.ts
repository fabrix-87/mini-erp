import { z } from 'zod';
import { validate, validateParams } from '../middleware/validation';

// ============================================================================
// ENUMS
// ============================================================================

export const DocumentTypeSchema = z.enum([
  'QUOTE',
  'PROFORMA',
  'ORDER',
  'DELIVERY_NOTE',
  'INVOICE',
  'CREDIT_NOTE',
  'DEBIT_NOTE',
  'SUPPLIER_ORDER',
  'ARCHIVED',
]);

export const DocumentStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'SENT',
  'ACCEPTED',
  'REJECTED',
  'PREPARING',
  'IN_TRANSIT',
  'DELIVERED',
  'UNPAID',
  'PARTIALLY_PAID',
  'PAID',
  'OVERDUE',
  'VOIDED',
  'CLOSED',
]);

// ============================================================================
// BASE SCHEMAS
// ============================================================================

/**
 * Schema per validare ID documento nei params
 */
const DocumentIdParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('ID documento non valido')),
});

/**
 * Schema per una riga di documento
 */
const DocumentLineSchema = z.object({
  productVariantId: z.number().int().positive().optional().nullable(),
  productId: z.number().int().positive().optional().nullable(),
  
  lineNumber: z.number().int().positive().default(1),
  lineType: z.string().max(20).default('product'),
  code: z.string().max(50).optional().nullable(),
  
  nameSystem: z.string().min(1, 'Il nome è obbligatorio').max(255),
  descriptionSystem: z.string().optional().nullable(),
  nameCustomer: z.string().max(255).optional().nullable(),
  descriptionCustomer: z.string().optional().nullable(),
  
  quantity: z.number().positive('La quantità deve essere positiva').default(1),
  unit: z.string().max(10).default('pz'),
  
  unitPrice: z.number().nonnegative('Il prezzo unitario deve essere positivo').default(0),
  unitCost: z.number().nonnegative('Il costo unitario deve essere positivo').default(0),
  
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().nonnegative().default(0),
  
  lineTotal: z.number().nonnegative().default(0),
  
  taxRuleId: z.number().int().positive().optional().nullable(),
  taxPercent: z.number().min(0).max(100).default(22),
  taxAmount: z.number().nonnegative().default(0),
  taxCode: z.string().max(10).optional().nullable(),
  
  lineTotalWithTax: z.number().nonnegative().default(0),
  
  notes: z.string().optional().nullable(),
  customFields: z.any().optional().nullable(),
}).strict();

/**
 * Schema per rate di pagamento
 */
const PaymentInstallmentSchema = z.object({
  installmentNumber: z.number().int().positive().default(1),
  percentage: z.number().min(0).max(100),
  amount: z.number().nonnegative(),
  dueDate: z.iso.datetime().or(z.date()),
  notes: z.string().optional().nullable(),
}).strict();

// ============================================================================
// DOCUMENT SCHEMAS
// ============================================================================

/**
 * Schema per la creazione di un nuovo Document
 */
export const CreateDocumentSchema = z.object({
  documentType: DocumentTypeSchema,
  status: DocumentStatusSchema.default('DRAFT'),
  
  // IDs relazionali
  companyId: z.number().int().positive('ID azienda obbligatorio'),
  customerId: z.number().int().positive().optional().nullable(),
  supplierId: z.number().int().positive().optional().nullable(),
  contactId: z.number().int().positive().optional().nullable(),
  opportunityId: z.number().int().positive().optional().nullable(),
  warehouseId: z.number().int().positive().optional().nullable(),
  
  // Date
  documentDate: z.iso.datetime().or(z.date()).default(() => new Date().toISOString()),
  dueDate: z.iso.datetime().or(z.date()).optional().nullable(),
  deliveryDate: z.iso.datetime().or(z.date()).optional().nullable(),
  validUntil: z.iso.datetime().or(z.date()).optional().nullable(),
  sentDate: z.iso.datetime().or(z.date()).optional().nullable(),
  
  // Riferimenti documenti correlati
  relatedQuoteId: z.number().int().positive().optional().nullable(),
  relatedOrderId: z.number().int().positive().optional().nullable(),
  relatedInvoiceId: z.number().int().positive().optional().nullable(),
  relatedOpportunityId: z.number().int().positive().optional().nullable(),
  
  // Dati cliente (snapshot)
  customerName: z.string().min(1, 'Nome cliente obbligatorio').max(255),
  customerVatNumber: z.string().max(20).optional().nullable(),
  customerTaxCode: z.string().max(20).optional().nullable(),
  customerPec: z.string().email().max(255).optional().nullable(),
  customerSdiCode: z.string().max(7).optional().nullable(),
  
  customerAddress: z.string().max(255).optional().nullable(),
  customerCity: z.string().max(100).optional().nullable(),
  customerPostalCode: z.string().max(20).optional().nullable(),
  customerProvince: z.string().max(2).optional().nullable(),
  customerCountryCode: z.string().length(2).default('IT'),
  
  customerEmail: z.email().max(255).optional().nullable(),
  customerPhone: z.string().max(50).optional().nullable(),
  
  // Indirizzo spedizione
  shippingName: z.string().max(255).optional().nullable(),
  shippingAddress: z.string().max(255).optional().nullable(),
  shippingCity: z.string().max(100).optional().nullable(),
  shippingPostalCode: z.string().max(20).optional().nullable(),
  shippingProvince: z.string().max(2).optional().nullable(),
  shippingCountryCode: z.string().length(2).optional().nullable(),
  
  // Importi
  currency: z.string().length(3).default('EUR'),
  subtotal: z.number().nonnegative().default(0),
  discountPercent: z.number().min(0).max(100).default(0),
  discountAmount: z.number().nonnegative().default(0),
  shippingCost: z.number().nonnegative().default(0),
  shippingTaxAmount: z.number().nonnegative().default(0),
  taxableAmount: z.number().nonnegative().default(0),
  taxAmount: z.number().nonnegative().default(0),
  totalAmount: z.number().nonnegative().default(0),
  paidAmount: z.number().nonnegative().default(0),
  
  // Pagamento
  paymentMethodId: z.number().int().positive().optional().nullable(),
  paymentMethod: z.string().max(50).default('bank_transfer'),
  paymentTerms: z.string().max(100).optional().nullable(),
  bankName: z.string().max(100).optional().nullable(),
  bankIban: z.string().max(34).optional().nullable(),
  bankSwift: z.string().max(11).optional().nullable(),
  
  // Note
  notes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  termsAndConditions: z.string().optional().nullable(),
  
  // Metadata
  customFields: z.any().optional().nullable(),
  
  // Righe documento (opzionale in creazione, obbligatorio dopo)
  lines: z.array(DocumentLineSchema).optional().default([]),
  
  // Rate pagamento (opzionale)
  installments: z.array(PaymentInstallmentSchema).optional().default([]),
}).strict();

/**
 * Schema per l'aggiornamento di un Document
 */
export const UpdateDocumentSchema = CreateDocumentSchema
  .omit({ companyId: true })
  .partial()
  .strict();

/**
 * Schema per aggiornare lo status di un documento
 */
export const UpdateDocumentStatusSchema = z.object({
  status: DocumentStatusSchema,
  notes: z.string().optional().nullable(),
}).strict();

/**
 * Schema per query filtri documenti
 */
export const DocumentQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .default(1),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive().max(100))
      .default(20),
    search: z.string().optional(),
    documentType: DocumentTypeSchema.optional(),
    status: DocumentStatusSchema.optional(),
    customerId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional(),
    supplierId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional(),
    warehouseId: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().positive())
      .optional(),
    dateFrom: z.iso.datetime().optional(),
    dateTo: z.iso.datetime().optional(),
    minAmount: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().nonnegative())
      .optional(),
    maxAmount: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().nonnegative())
      .optional(),
    sortBy: z
      .enum(['documentDate', 'documentNumber', 'totalAmount', 'createdAt'])
      .default('documentDate'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// ============================================================================
// DOCUMENT LINE SCHEMAS
// ============================================================================

/**
 * Schema per aggiungere una riga
 */
export const AddDocumentLineSchema = z.object({
  params: DocumentIdParamSchema,
  body: DocumentLineSchema,
});

/**
 * Schema per aggiornare una riga
 */
export const UpdateDocumentLineSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
    lineId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  }),
  body: DocumentLineSchema.partial(),
});

/**
 * Schema per eliminare una riga
 */
export const DeleteDocumentLineSchema = z.object({
  params: z.object({
    id: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
    lineId: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().int().positive()),
  }),
});

// ============================================================================
// CONVERSION SCHEMAS
// ============================================================================

/**
 * Schema per convertire documento (es. Quote → Order)
 */
export const ConvertDocumentSchema = z.object({
  targetType: DocumentTypeSchema,
  copyLines: z.boolean().default(true),
  copyInstallments: z.boolean().default(true),
  status: DocumentStatusSchema.default('DRAFT'),
}).strict();

/**
 * Schema per duplicare documento
 */
export const DuplicateDocumentSchema = z.object({
  includeLines: z.boolean().default(true),
  includeInstallments: z.boolean().default(false),
  status: DocumentStatusSchema.default('DRAFT'),
}).strict();

// ============================================================================
// CALCULATION SCHEMAS
// ============================================================================

/**
 * Schema per ricalcolare totali documento
 */
export const RecalculateDocumentSchema = z.object({
  applyDiscount: z.boolean().default(true),
  recalculateTax: z.boolean().default(true),
}).strict();

// ============================================================================
// VALIDATION MIDDLEWARE
// ============================================================================

// DOCUMENTS
export const validateCreateDocument = validate(
  CreateDocumentSchema,
  'Document creation',
  { source: ['body'] }
);

export const validateUpdateDocument = validate(
  { body: UpdateDocumentSchema, params: DocumentIdParamSchema },
  'Document update'
);

export const validateDocumentId = validateParams(
  DocumentIdParamSchema,
  'Document ID validation'
);

export const validateDocumentQuery = validate(
  DocumentQuerySchema,
  'Document query'
);

export const validateUpdateDocumentStatus = validate(
  { body: UpdateDocumentStatusSchema, params: DocumentIdParamSchema },
  'Document status update'
);

// DOCUMENT LINES
export const validateAddDocumentLine = validate(
  AddDocumentLineSchema,
  'Add document line'
);

export const validateUpdateDocumentLine = validate(
  UpdateDocumentLineSchema,
  'Update document line'
);

export const validateDeleteDocumentLine = validate(
  DeleteDocumentLineSchema,
  'Delete document line'
);

// CONVERSIONS
export const validateConvertDocument = validate(
  { body: ConvertDocumentSchema, params: DocumentIdParamSchema },
  'Convert document'
);

export const validateDuplicateDocument = validate(
  { body: DuplicateDocumentSchema, params: DocumentIdParamSchema },
  'Duplicate document'
);

// CALCULATIONS
export const validateRecalculateDocument = validate(
  { body: RecalculateDocumentSchema, params: DocumentIdParamSchema },
  'Recalculate document'
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DocumentType = z.infer<typeof DocumentTypeSchema>;
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
export type CreateDocumentInput = z.infer<typeof CreateDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof UpdateDocumentSchema>;
export type DocumentLineInput = z.infer<typeof DocumentLineSchema>;
export type PaymentInstallmentInput = z.infer<typeof PaymentInstallmentSchema>;
export type DocumentQueryInput = z.infer<typeof DocumentQuerySchema>['query'];
export type ConvertDocumentInput = z.infer<typeof ConvertDocumentSchema>;
export type DuplicateDocumentInput = z.infer<typeof DuplicateDocumentSchema>;