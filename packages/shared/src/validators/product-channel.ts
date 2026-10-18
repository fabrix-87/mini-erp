// packages/shared/src/validators/product-channel.ts
import { z } from "zod";
import { isoDateSchema } from "./primitives/date";
import { unitAmountOptionalSchema, unitAmountSchema } from "./primitives/decimal";
import {
  languageIdBaseSchema,
  productIdBaseSchema,
  productChannelSettingsIdBaseSchema,
  salesChannelIdBaseSchema,
} from "./base";
import { productRedirectTypeSchema, productVisibilitySchema } from "./product";
import { DELIVERY_NOTE_DISPLAY, PRODUCT_REDIRECT_TYPE, SALES_CHANNEL_TYPE } from "../constants";

export const salesChannelTypeSchema = z.enum(SALES_CHANNEL_TYPE);
export const deliveryNoteDisplaySchema = z.enum(DELIVERY_NOTE_DISPLAY);

// ---- SalesChannel ----------------------------------------------------------
const salesChannelBaseShape = {
  code: z.string().min(1, "Il codice è obbligatorio").max(30).trim(),
  name: z.string().min(1, "Il nome è obbligatorio").max(100).trim(),
  type: salesChannelTypeSchema,
  active: z.boolean(),
};
export const createSalesChannelSchema = z
  .object(salesChannelBaseShape)
  .extend({ type: salesChannelTypeSchema.default("WEBSHOP"), active: z.boolean().default(true) })
  .strict();
export const updateSalesChannelSchema = z.object(salesChannelBaseShape).partial().strict();
export const salesChannelIdSchema = z.object({ id: salesChannelIdBaseSchema });

// ---- ProductChannelSettings ------------------------------------------------
const settingsBaseShape = {
  isPublished: z.boolean(),
  publishedAt: isoDateSchema().nullish(),
  visibility: productVisibilitySchema,
  showPrice: z.boolean(),
  onSale: z.boolean(),
  isExclusive: z.boolean(),
  showCondition: z.boolean(),
  additionalShippingCost: unitAmountOptionalSchema,
  deliveryNoteDisplay: deliveryNoteDisplaySchema,
  redirectType: productRedirectTypeSchema,
  redirectTargetId: productIdBaseSchema.nullish(),
};

const requireRedirectTarget = (
  data: { redirectType?: string; redirectTargetId?: string | null },
  ctx: z.RefinementCtx,
) => {
  const needsTarget =
    data.redirectType === PRODUCT_REDIRECT_TYPE.MOVED ||
    data.redirectType === PRODUCT_REDIRECT_TYPE.TEMPORARY;
  if (needsTarget && !data.redirectTargetId) {
    ctx.addIssue({
      code: "custom",
      path: ["redirectTargetId"],
      message: "Il redirect richiede un prodotto di destinazione",
    });
  }
};

/** productId comes from the route (POST /products/:id/channels). */
export const createProductChannelSettingsSchema = z
  .object({ channelId: salesChannelIdBaseSchema, ...settingsBaseShape })
  .extend({
    isPublished: z.boolean().default(false),
    visibility: productVisibilitySchema.default("BOTH"),
    showPrice: z.boolean().default(true),
    onSale: z.boolean().default(false),
    isExclusive: z.boolean().default(false),
    showCondition: z.boolean().default(false),
    additionalShippingCost: unitAmountSchema,
    deliveryNoteDisplay: deliveryNoteDisplaySchema.default("NONE"),
    redirectType: productRedirectTypeSchema.default("NOT_FOUND"),
  })
  .strict()
  .superRefine(requireRedirectTarget);

/** Client must send redirectType and redirectTargetId together; DB CHECK is the last guard. */
export const updateProductChannelSettingsSchema = z
  .object(settingsBaseShape)
  .partial()
  .strict()
  .superRefine((data, ctx) => {
    if (data.redirectType !== undefined) requireRedirectTarget(data, ctx);
  });

export const productChannelSettingsIdSchema = z.object({ id: productChannelSettingsIdBaseSchema });
export const productIdChannelIdSchema = z.object({
  id: productIdBaseSchema,
  channelId: salesChannelIdBaseSchema,
});

// ---- ProductChannelTranslation ---------------------------------------------
const slugSchema = z
  .string()
  .max(255, "Lo slug non può superare 255 caratteri")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Lo slug può contenere solo lettere minuscole, numeri e trattini",
  );

const channelTranslationBaseShape = {
  slug: slugSchema.nullish(),
  tags: z.string().max(500).nullish(),
  metaTitle: z.string().max(255).nullish(),
  metaDescription: z.string().nullish(),
  metaKeywords: z.string().max(500).nullish(),
  availableNowLabel: z.string().max(100).nullish(),
  availableLaterLabel: z.string().max(100).nullish(),
  deliveryTimeInStockNote: z.string().max(255).nullish(),
  deliveryTimeOutOfStockNote: z.string().max(255).nullish(),
};
export const createProductChannelTranslationSchema = z
  .object({ languageId: languageIdBaseSchema, ...channelTranslationBaseShape })
  .strict();
export const updateProductChannelTranslationSchema = z
  .object(channelTranslationBaseShape)
  .partial()
  .strict();
export const productChannelTranslationParamsSchema = z.object({
  id: productChannelSettingsIdBaseSchema,
  languageId: languageIdBaseSchema,
});
