// packages/shared/src/types/product-channel.ts
import { z } from "zod";
import {
  DeliveryNoteDisplay,
  ProductRedirectType,
  ProductVisibility,
  SalesChannelType,
} from "../constants";
import { Language } from "./language";
import {
  createProductChannelSettingsSchema,
  createProductChannelTranslationSchema,
  createSalesChannelSchema,
  productChannelSettingsIdSchema,
  productChannelTranslationParamsSchema,
  productIdChannelIdSchema,
  salesChannelIdSchema,
  updateProductChannelSettingsSchema,
  updateProductChannelTranslationSchema,
  updateSalesChannelSchema,
} from "../validators";

export type ProductChannel = {
  id: string;
  code: string;
  type: SalesChannelType;
  active: boolean;
  productSettings: ProductChannelSetting[];
  createdAt: Date;
  updatedAt: Date;
};

export type ProductChannelSetting = {
  id: string;
  isPublished: boolean;
  publishedAt: Date;
  visibility: ProductVisibility;
  channel: ProductChannel;
  showPrice: boolean;
  onSale: boolean;
  isExclusive: boolean;
  showCondition: boolean;
  additionalShippingCost: string;
  deliveryNoteDisplay: DeliveryNoteDisplay;
  redirectType: ProductRedirectType;
  redirectTargetId: string;
  translations: ProductChannelTranslation[];
};

export type ProductChannelTranslation = {
  language: Language;
  slug: string;
  tags: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  availableNowLabel: string;
  availableLaterLabel: string;
  deliveryTimeInStockNote: string;
  deliveryTimeOutOfStockNote: string;
};

export type CreateSalesChannel = z.infer<typeof createSalesChannelSchema>;
export type UpdateSalesChannel = z.infer<typeof updateSalesChannelSchema>;
export type CreateProductChannelSettings = z.infer<typeof createProductChannelSettingsSchema>;
export type UpdateProductChannelSettings = z.infer<typeof updateProductChannelSettingsSchema>;
export type CreateProductChannelTranslation = z.infer<typeof createProductChannelTranslationSchema>;
export type UpdateProductChannelTranslation = z.infer<typeof updateProductChannelTranslationSchema>;

export type SalesChannelIdParam = z.infer<typeof salesChannelIdSchema>;
export type ProductChannelSettingsIdParam = z.infer<typeof productChannelSettingsIdSchema>;
export type ProductIdChannelIdParam = z.infer<typeof productIdChannelIdSchema>;
export type ProductChannelTranslationParam = z.infer<typeof productChannelTranslationParamsSchema>;
