import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { createDecimalSchema } from "./primitives/decimal";
import { isoDateSchema } from "./primitives/date";

import { sortOrderSchema, pageSchema, limitSchema } from "./query/pagination";
import { queryBooleanSchema } from "./query/params";
import {
  INTRASTAT_FLOWS,
  TRANSPORT_MODES,
  EU_MEMBER_STATES,
  COMMODITY_CODE_LENGTH,
  TRANSACTION_CODE_LENGTH,
  MAX_NET_MASS,
  MAX_MONETARY_VALUE,
  MAX_SUPPLEMENTARY_UNITS,
  REPORTING_FREQUENCIES,
} from "../constants/intrastat";
import { countryCodeBaseSchema } from "./base";

// ============================================================================
// ENUMS
// ============================================================================

export const intrastatFlowSchema = z.enum([
  INTRASTAT_FLOWS.ARRIVAL,
  INTRASTAT_FLOWS.DISPATCH,
]);

export const transportModeSchema = z.enum([
  TRANSPORT_MODES.SEA,
  TRANSPORT_MODES.RAIL,
  TRANSPORT_MODES.ROAD,
  TRANSPORT_MODES.AIR,
  TRANSPORT_MODES.MAIL,
  TRANSPORT_MODES.MULTIMODAL,
  TRANSPORT_MODES.INLAND_WATERWAY,
  TRANSPORT_MODES.SELF_PROPULSION,
]);

export const reportingFrequencySchema = z.enum([
  REPORTING_FREQUENCIES.MONTHLY,
  REPORTING_FREQUENCIES.QUARTERLY,
  REPORTING_FREQUENCIES.ANNUAL,
]);

// ============================================================================
// DECIMAL HELPERS
// ============================================================================

const monetaryValueSchema = createDecimalSchema(2, {
  positiveOnly: true,
  min: 0,
  max: MAX_MONETARY_VALUE,
});

const netMassSchema = createDecimalSchema(3, {
  positiveOnly: true,
  min: 0,
  max: MAX_NET_MASS,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate EU country code
 */
export const euCountryCodeSchema = countryCodeBaseSchema.refine(
  (code) => EU_MEMBER_STATES.includes(code as any),
  {
    message: "Codice paese deve essere un membro UE valido",
  },
);

/**
 * Validate transaction code (2 digits)
 */
export const transactionCodeSchema = z
  .string()
  .length(
    TRANSACTION_CODE_LENGTH,
    `Codice transazione deve essere ${TRANSACTION_CODE_LENGTH} cifre`,
  )
  .regex(/^\d{2}$/, "Codice transazione deve contenere solo numeri");

/**
 * Validate commodity code (NC8 - 8 digits)
 */
export const commodityCodeSchema = z
  .string()
  .length(
    COMMODITY_CODE_LENGTH,
    `Codice nomenclatura deve essere ${COMMODITY_CODE_LENGTH} cifre`,
  )
  .regex(/^\d{8}$/, "Codice nomenclatura deve contenere solo numeri");

// ============================================================================
// INTRASTAT TRANSACTION SCHEMAS
// ============================================================================

export const intrastatTransactionIdSchema = createIdSchema(
  "ID Intrastat Transaction non valido",
);

/**
 * Raw object shape for IntrastatTransaction — no refinements.
 */
const intrastatTransactionShape = z.object({
  documentId: createIdSchema("Document ID non valido"),
  documentLineId: createIdSchema("Document Line ID non valido"),
  flow: intrastatFlowSchema,
  transactionDate: isoDateSchema(),
  transactionCode: transactionCodeSchema,
  commodityCode: commodityCodeSchema,
  partnerCountryCode: euCountryCodeSchema,
  invoicedValue: monetaryValueSchema,
  statisticalValue: monetaryValueSchema,
  netMass: netMassSchema,

  supplementaryUnits: z
    .number()
    .int("Unità supplementari deve essere un intero")
    .nonnegative("Unità supplementari non può essere negativo")
    .max(
      MAX_SUPPLEMENTARY_UNITS,
      `Unità supplementari massimo ${MAX_SUPPLEMENTARY_UNITS}`,
    )
    .optional()
    .nullable(),

  modeOfTransport: z.string().length(1).optional().nullable(),
  isCorrection: z.boolean().default(false),
});

/**
 * Schema for creating an IntrastatTransaction — statistical >= invoiced value.
 */
export const createIntrastatTransactionSchema = intrastatTransactionShape
  .strict()
  .refine(
    (data) => Number(data.statisticalValue) >= Number(data.invoicedValue),
    {
      message:
        "Valore statistico deve essere maggiore o uguale al valore fatturato",
      path: ["statisticalValue"],
    },
  );

/**
 * Schema for updating an IntrastatTransaction — partial, immutable FK fields excluded.
 * documentId and documentLineId cannot change after creation.
 */
export const updateIntrastatTransactionSchema = intrastatTransactionShape
  .omit({ documentId: true, documentLineId: true })
  .partial()
  .strict();

// ============================================================================
// TRANSACTION CODE SCHEMAS
// ============================================================================

/**
 * Raw object shape for TransactionCode.
 */
const transactionCodeShape = z.object({
  code: transactionCodeSchema,
  descriptionIT: z
    .string()
    .min(1, "Descrizione italiana obbligatoria")
    .max(255, "Descrizione max 255 caratteri"),
  descriptionEN: z
    .string()
    .min(1, "Descrizione inglese obbligatoria")
    .max(255, "Descrizione max 255 caratteri"),
});

/**
 * Schema for creating a TransactionCode.
 */
export const createTransactionCodeSchema = transactionCodeShape.strict();

/**
 * Schema for updating a TransactionCode — partial, code is immutable.
 */
export const updateTransactionCodeSchema = transactionCodeShape
  .omit({ code: true })
  .partial()
  .strict();

// ============================================================================
// COMMODITY CODE SCHEMAS
// ============================================================================

/**
 * Raw object shape for CommodityCode.
 */
const commodityCodeShape = z.object({
  code: commodityCodeSchema,
  descriptionIT: z
    .string()
    .min(1, "Descrizione italiana obbligatoria")
    .max(500, "Descrizione max 500 caratteri"),
  descriptionEN: z
    .string()
    .min(1, "Descrizione inglese obbligatoria")
    .max(500, "Descrizione max 500 caratteri"),
});

/**
 * Schema for creating a CommodityCode.
 */
export const createCommodityCodeSchema = commodityCodeShape.strict();

/**
 * Schema for updating a CommodityCode — partial, code is immutable.
 */
export const updateCommodityCodeSchema = commodityCodeShape
  .omit({ code: true })
  .partial()
  .strict();

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkCreateTransactionsSchema = z
  .object({
    transactions: z
      .array(createIntrastatTransactionSchema)
      .min(1, "Almeno una transazione richiesta")
      .max(1000, "Massimo 1000 transazioni per richiesta"),
  })
  .strict();

export const bulkUpdateTransactionsSchema = z
  .object({
    transactionIds: z
      .array(intrastatTransactionIdSchema)
      .min(1, "Seleziona almeno una transazione"),

    updates: updateIntrastatTransactionSchema,
  })
  .strict();

export const bulkDeleteTransactionsSchema = z
  .object({
    transactionIds: z
      .array(intrastatTransactionIdSchema)
      .min(1, "Seleziona almeno una transazione"),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

export const intrastatTransactionQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  flow: intrastatFlowSchema.optional(),
  documentId: createIdSchema("Document ID non valido").optional(),
  partnerCountryCode: euCountryCodeSchema.optional(),
  transactionCode: transactionCodeSchema.optional(),
  commodityCode: commodityCodeSchema.optional(),
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  isCorrection: queryBooleanSchema,
  minValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  maxValue: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  sortBy: z
    .enum([
      "transactionDate",
      "partnerCountryCode",
      "commodityCode",
      "invoicedValue",
      "netMass",
      "createdAt",
    ])
    .default("transactionDate"),
  sortOrder: sortOrderSchema,
});

export const commodityCodeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  codePrefix: z.string().max(COMMODITY_CODE_LENGTH).regex(/^\d+$/).optional(),
  sortBy: z.enum(["code", "descriptionIT", "descriptionEN"]).default("code"),
  sortOrder: sortOrderSchema,
});

export const transactionCodeQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  search: z.string().optional(),
  sortBy: z.enum(["code", "descriptionIT", "descriptionEN"]).default("code"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const intrastatTransactionIdParamSchema = z.object({
  id: intrastatTransactionIdSchema,
});

export const transactionCodeParamSchema = z.object({
  code: transactionCodeSchema,
});

export const commodityCodeParamSchema = z.object({
  code: commodityCodeSchema,
});

// ============================================================================
// REPORTING SCHEMAS
// ============================================================================

export const intrastatReportQuerySchema = z.object({
  flow: intrastatFlowSchema,

  year: z
    .number()
    .int()
    .min(2000, "Anno minimo 2000")
    .max(2100, "Anno massimo 2100"),

  month: z
    .number()
    .int()
    .min(1, "Mese minimo 1")
    .max(12, "Mese massimo 12")
    .optional(),

  quarter: z
    .number()
    .int()
    .min(1, "Trimestre minimo 1")
    .max(4, "Trimestre massimo 4")
    .optional(),

  frequency: reportingFrequencySchema.default(REPORTING_FREQUENCIES.MONTHLY),

  includeCorrections: z.boolean().default(true),

  format: z.enum(["csv", "xml", "pdf", "xlsx"]).default("csv"),
});

/**
 * Raw object shape for IntrastatDeclaration.
 */
const intrastatDeclarationShape = z.object({
  flow: intrastatFlowSchema,

  reportingPeriod: z.object({
    year: z.number().int().min(2000).max(2100),
    month: z.number().int().min(1).max(12).optional(),
    quarter: z.number().int().min(1).max(4).optional(),
  }),

  companyVatNumber: z.string().min(1, "Partita IVA obbligatoria").max(20),
  declarantName: z.string().min(1, "Nome dichiarante obbligatorio").max(255),
  declarantEmail: z.string().email("Email non valida").max(255),
  declarantPhone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Schema for Intrastat declaration — month XOR quarter must be specified.
 */
export const intrastatDeclarationSchema = intrastatDeclarationShape
  .strict()
  .refine(
    (data) => {
      const hasMonth = data.reportingPeriod.month !== undefined;
      const hasQuarter = data.reportingPeriod.quarter !== undefined;
      return hasMonth !== hasQuarter; // XOR
    },
    {
      message: "Specificare mese O trimestre, non entrambi",
      path: ["reportingPeriod"],
    },
  );

export const validateTransactionsSchema = z.object({
  flow: intrastatFlowSchema,
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  quarter: z.number().int().min(1).max(4).optional(),
});

// ============================================================================
// STATISTICS SCHEMAS
// ============================================================================

export const intrastatStatsSchema = z.object({
  dateFrom: isoDateSchema(),
  dateTo: isoDateSchema(),
  flow: intrastatFlowSchema.optional(),
  groupBy: z
    .enum(["country", "commodityCode", "transactionCode", "month", "quarter"])
    .default("country"),
});
