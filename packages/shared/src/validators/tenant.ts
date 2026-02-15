import { z } from "zod";
import { createIdSchema } from "./primitives/id";
import { sortOrderSchema } from "./query/pagination";
import { urlSchema } from "./primitives";
import { currencyCodeBaseSchema } from "./base";

// ============================================================================
// TENANT SETTINGS SCHEMAS
// ============================================================================

/**
 * Schema for Tenant ID
 */
export const tenantIdSchema = createIdSchema("ID Tenant non valido");

/**
 * Schema for SDI transmission format
 */
export const sdiTransmissionFormatSchema = z.enum([
  "FPR12", // Fattura ordinaria
  "FPA12", // Fattura PA (Pubblica Amministrazione)
]);

/**
 * Schema for creating Tenant Settings
 */
export const createTenantSettingsSchema = z
  .object({
    tenantCode: z
      .string()
      .max(20, "Tenant code non può superare 20 caratteri")
      .trim()
      .optional()
      .nullable(),

    companyId: createIdSchema("Company ID non valido").optional().nullable(),

    // Tax regime
    taxRegime: z
      .string()
      .max(50, "Tax regime non può superare 50 caratteri")
      .optional()
      .nullable(),

    // Default tax rules
    defaultSalesTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    defaultPurchasesTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    // Defaults
    defaultCurrency: currencyCodeBaseSchema.default("EUR"),

    defaultLanguageId: createIdSchema("Language ID non valido")
      .optional()
      .nullable(),

    // Electronic invoicing configuration
    sdiTransmissionFormat: sdiTransmissionFormatSchema.optional().nullable(),

    sdiCertificatePath: z
      .string()
      .max(500, "Certificate path non può superare 500 caratteri")
      .optional()
      .nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // If sdiCertificatePath is provided, sdiTransmissionFormat must be set
      if (data.sdiCertificatePath && !data.sdiTransmissionFormat) {
        return false;
      }
      return true;
    },
    {
      message: "Formato trasmissione SDI obbligatorio se certificato specificato",
      path: ["sdiTransmissionFormat"],
    },
  );

/**
 * Schema for updating Tenant Settings
 */
export const updateTenantSettingsSchema = createTenantSettingsSchema
  .omit({ tenantCode: true })
  .partial()
  .strict();

/**
 * Schema for updating tax defaults
 */
export const updateTaxDefaultsSchema = z
  .object({
    defaultSalesTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    defaultPurchasesTaxRuleId: createIdSchema("Tax Rule ID non valido")
      .optional()
      .nullable(),

    taxRegime: z.string().max(50).optional().nullable(),
  })
  .strict();

/**
 * Schema for updating SDI configuration
 */
export const updateSdiConfigSchema = z
  .object({
    sdiTransmissionFormat: sdiTransmissionFormatSchema.optional().nullable(),

    sdiCertificatePath: z.string().max(500).optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      // If certificate path is set, format must be provided
      if (data.sdiCertificatePath && !data.sdiTransmissionFormat) {
        return false;
      }
      return true;
    },
    {
      message: "Formato trasmissione obbligatorio con certificato",
      path: ["sdiTransmissionFormat"],
    },
  );

/**
 * Schema for updating regional settings
 */
export const updateRegionalSettingsSchema = z
  .object({
    defaultCurrency: currencyCodeBaseSchema,

    defaultLanguageId: createIdSchema("Language ID non valido")
      .optional()
      .nullable(),
  })
  .strict();

// ============================================================================
// QUERY SCHEMAS
// ============================================================================

/**
 * Schema for Tenant Settings queries (usually only one tenant per instance)
 */
export const tenantSettingsQuerySchema = z.object({
  tenantCode: z.string().optional(),
  companyId: createIdSchema("Company ID non valido").optional(),
  sortBy: z.enum(["id", "tenantCode", "createdAt"]).default("id"),
  sortOrder: sortOrderSchema,
});

// ============================================================================
// PARAM SCHEMAS
// ============================================================================

export const tenantIdParamSchema = z.object({
  id: tenantIdSchema,
});

export const tenantCodeParamSchema = z.object({
  tenantCode: z.string().min(1, "Tenant code obbligatorio"),
});

/**
 * Schema for testing SDI configuration
 */
export const testSdiConfigSchema = z
  .object({
    certificatePath: z.string().min(1, "Certificate path obbligatorio"),
    testEndpoint: urlSchema(),
  })
  .strict();
