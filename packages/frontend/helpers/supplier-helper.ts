import { useTranslations } from "next-intl";

/**
 * Builds translated supplier rating options for the commercial form.
 * @param t - Translator scoped to the commercial tab.
 * @returns Rating options from one to five.
 */
export function getSupplierRatingOptions(
  t: ReturnType<
    typeof useTranslations<"crm.companies.form.commercial-tab">
  >,
): Array<{ value: number; label: string }> {
  return [1, 2, 3, 4, 5].map((value) => ({
    value,
    label: t("fields.rating.option", { value }),
  }));
}