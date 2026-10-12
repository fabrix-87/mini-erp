import {
  PRODUCT_CONDITION,
  PRODUCT_STATUS,
  PRODUCT_TYPE,
  PRODUCT_VISIBILITY,
  ProductCondition,
  ProductStatus,
  ProductType,
  ProductVisibility,
} from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"catalog.products">>;
type TypeFilter = ProductType | "ALL";
type StatusFilter = ProductStatus | "ALL";
type VisibilityFilter = ProductVisibility | "ALL";
type ConditionFilter = ProductCondition | "ALL";

export function getProductTypesOptions(t: T, includeAll = false) {
  const keys: TypeFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(PRODUCT_TYPE),
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}
export function getProductStatusesOptions(t: T, includeAll = false) {
  const keys: StatusFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(PRODUCT_STATUS),
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}
export function getProductVisibilityOptions(t: T, includeAll = false) {
  const keys: VisibilityFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(PRODUCT_VISIBILITY),
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}
export function getProductConditionsOptions(t: T, includeAll = false) {
  const keys: ConditionFilter[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(PRODUCT_CONDITION),
  ];
  return keys.map((value) => ({ value, label: t(`type.${value}`) }));
}
