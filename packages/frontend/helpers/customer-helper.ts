import { CreditCheckStatus, CUSTOMER_CREDIT_CHECK_STATUS, CUSTOMER_PRIORITY, CUSTOMER_SEGMENT, CUSTOMER_SIZE, CUSTOMER_TYPE, CustomerPriority, CustomerSegment, CustomerSize, CustomerType } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

type T = ReturnType<typeof useTranslations<"crm.customers">>;
export type FilterSize = CustomerSize | "ALL";
export type FilterType = CustomerType | "ALL";
export type FilterSegment = CustomerSegment | "ALL";
export type FilterCreditStatus = CreditCheckStatus | "ALL";

export function getCustomerSizeOptions(t: T, includeAll = false) {
  const keys: FilterSize[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(CUSTOMER_SIZE),
  ];
  return keys.map((value) => ({ value, label: t(`size.${value}`) }));
}

export function getCustomerTypeOptions(t: T, includeAll = false) {
  const keys: FilterType[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(CUSTOMER_TYPE),
  ];
  return keys.map((value) => ({ value, label: t(`types.${value}`) }));
}

export function getCustomerSegmentOptions(t: T, includeAll = false) {
  const keys: FilterSegment[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(CUSTOMER_SEGMENT),
  ];
  return keys.map((value) => ({ value, label: t(`segments.${value}`) }));
}

export function getCustomerCreditStatusOptions(t: T, includeAll = false) {
  const keys: FilterCreditStatus[] = [
    ...(includeAll ? ["ALL" as const] : []),
    ...Object.values(CUSTOMER_CREDIT_CHECK_STATUS),
  ];
  return keys.map((value) => ({ value, label: t(`creditStatus.${value}`) }));
}

/**
 * Builds translated customer priority options from shared constants.
 * @param t - Translator scoped to crm.customers.
 * @returns Customer priority options.
 */
export function getCustomerPriorityOptions(
  t: T,
): Array<{ value: CustomerPriority; label: string }> {
  return Object.values(CUSTOMER_PRIORITY).map((value) => ({
    value,
    label: t(`priority.${value}`),
  }));
}