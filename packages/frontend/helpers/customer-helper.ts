import { CustomerSegment, CustomerSize, CustomerType } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"crm.customers">>;
export type FilterSize = CustomerSize | "ALL";
export type FilterType = CustomerType | "ALL";
export type FilterSegment = CustomerSegment | "ALL";

export function getCustomerSizeOptions(t: T, includeAll = false) {
  const keys: FilterSize[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "MICRO",
    "SMALL",
    "MEDIUM",
    "LARGE",
    "ENTERPRISE",
  ];
  return keys.map((value) => ({ value, label: t(`size.${value}`) }));
}

export function getCustomerTypeOptions(t: T, includeAll = false) {
  const keys: FilterType[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "ALL",
    "PROSPECT",
    "CUSTOMER",
    "PARTNER",
    "OTHER",
  ];
  return keys.map((value) => ({ value, label: t(`types.${value}`) }));
}

export function getCustomerSegmentOptions(t: T, includeAll = false) {
  const keys: FilterSegment[] = [
    ...(includeAll ? ["ALL" as const] : []),
    "VIP",
    "GOLD",
    "SILVER",
    "BRONZE",
    "STANDARD",
  ];
  return keys.map((value) => ({ value, label: t(`types.${value}`) }));
}
