import { z } from "zod";
import { createCuidSchema, createIdSchema } from "./primitives/id";

/**
 * Entity ID Base Schemas
 */
export const tenantIdBaseSchema = createCuidSchema("ID tenant non valido");
export const userIdSchema = createCuidSchema("ID utente non valido");
export const companyIdBaseSchema = createCuidSchema("Company ID non valido");
export const customerIdBaseSchema = createCuidSchema("Customer ID non valido");
export const supplierIdBaseSchema = createCuidSchema("Supplier ID non valido");
export const leadIdBaseSchema = createCuidSchema("ID Lead non valido");
export const opportunityIdBaseSchema = createCuidSchema("ID Opportunity non valido");
export const productIdBaseSchema = createCuidSchema("ID Product non valido");
export const productVariantIdBaseSchema = createCuidSchema("Product Variant ID not valid");
export const productImageIdBaseSchema = createCuidSchema("Product Image ID not valid");
export const productCategoryIdBaseSchema = createCuidSchema("Product Category ID not valid");
export const activityIdBaseSchema = createCuidSchema("Activity ID non valido");
export const contactIdBaseSchema = createCuidSchema("ID contatto non valido");
export const warehouseIdBaseSchema = createCuidSchema("Warehouse ID not valid");
export const documentIdBaseSchema = createCuidSchema("Document ID non valido");
export const documentLineIdBaseSchema = createCuidSchema("Document Line ID non valido");
export const carrierIdBaseSchema = createCuidSchema("Carrier ID non valido");
export const bankAccountIdBaseSchema = createCuidSchema("Bank Account ID non valido");
export const paymentMethodIdBaseSchema = createCuidSchema("Payment Method ID non valido");
export const withholdingTaxTypeIdBaseSchema = createCuidSchema(
  "Withholding Tax Type ID non valido",
);
export const taxRuleIdBaseSchema = createIdSchema("Tax Rule ID non valido");
export const languageIdBaseSchema = createIdSchema("Language ID non valido");
export const manufacturerIdBaseSchema = createCuidSchema("ID Manufacturer not valid");
export const priceListIdBaseSchema = createCuidSchema("PriceList ID not valid");

export const salesChannelIdBaseSchema = createCuidSchema("Sales Channel ID non valido");
export const productChannelSettingsIdBaseSchema = createCuidSchema("Channel Settings ID non valido");
export const productPackItemIdBaseSchema = createCuidSchema("Pack Item ID non valido");
export const productSupplierIdBaseSchema = createCuidSchema("Product Supplier ID non valido");
export const productUomIdBaseSchema = createCuidSchema("Product UoM ID non valido");
export const uomIdBaseSchema = createCuidSchema("UoM ID non valido");
export const attributeIdBaseSchema = createCuidSchema("Attribute ID non valido");
export const attributeGroupIdBaseSchema = createCuidSchema("Attribute Group ID non valido");

/**
 * Schema base per Currency Code
 */
export const currencyCodeBaseSchema = z
  .string()
  .length(3, "Il currency code deve essere di 3 caratteri")
  .regex(/^[A-Z]{3}$/, "Il currency code deve contenere solo lettere maiuscole")
  .trim();

/**
 * Schema base per Code Country
 */
export const countryCodeBaseSchema = z
  .string()
  .length(2, "Il country code deve essere di 2 caratteri")
  .regex(/^[A-Z]{2}$/, "Il country code deve contenere solo lettere maiuscole")
  .trim();

// Definisci uno schema compatibile con InputJsonValue di Prisma
export const inputJsonValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.record(z.string(), inputJsonValueSchema),
    z.array(inputJsonValueSchema),
  ]),
);
