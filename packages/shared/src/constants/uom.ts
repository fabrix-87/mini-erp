export const UOM_CATEGORY = {
  UNIT: "UNIT", // pz, dozen
  PACKAGING: "PACKAGING", // box, pallet — no universal factor, always product-specific
  WEIGHT: "  WEIGHT",
  LENGTH: "LENGTH",
  AREA: "AREA",
  VOLUME: "VOLUME",
  TIME: "TIME",
} as const;

export type UomCategory = (typeof UOM_CATEGORY)[keyof typeof UOM_CATEGORY];