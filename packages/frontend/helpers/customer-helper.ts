import { CustomerSize } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

export type FilterSize = CustomerSize | "ALL";

export function getSizeOptions(t: ReturnType<typeof useTranslations<"crm.customers">>) {
  const keys: FilterSize[] = [
    "ALL",
    "MICRO",
    "SMALL",
    "MEDIUM",
    "LARGE",
    "ENTERPRISE",
  ];
  return keys.map((value) => ({ value, label: t(`size.${value}`) }));
}