// packages/shared/src/constants/product-channel.ts
export const SALES_CHANNEL_TYPE = {
  WEBSHOP: "WEBSHOP",
  MARKETPLACE: "MARKETPLACE",
  B2B_PORTAL: "B2B_PORTAL",
  POS: "POS",
} as const;

export const DELIVERY_NOTE_DISPLAY = {
  NONE: "NONE",
  IN_STOCK: "IN_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  BOTH: "BOTH",
} as const;

export type SalesChannelType = (typeof SALES_CHANNEL_TYPE)[keyof typeof SALES_CHANNEL_TYPE];
export type DeliveryNoteDisplay = (typeof DELIVERY_NOTE_DISPLAY)[keyof typeof DELIVERY_NOTE_DISPLAY];