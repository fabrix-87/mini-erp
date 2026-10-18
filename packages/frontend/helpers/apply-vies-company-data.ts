// packages/frontend/helpers/apply-vies-company-data.ts

import type { UseFormSetValue } from "react-hook-form";
import type { CompanyFormValues } from "@mini-erp/shared";
import { type ViesCompanyData } from "@/types/vies-types";
import { parseViesCompanyData } from "./vies-helpers";

type CompanyFormSetValue = UseFormSetValue<CompanyFormValues>;

/**
 * Applies parsed VIES company data to the company form.
 * @param setValue - React Hook Form setter.
 * @param viesData - Raw VIES lookup response.
 * @returns True when the form was updated.
 */
export function applyViesCompanyData(
  setValue: CompanyFormSetValue,
  viesData: ViesCompanyData,
): boolean {
  const parsedData = parseViesCompanyData(viesData);

  if (!parsedData) {
    return false;
  }

  setValue("companyName", parsedData.companyName, {
    shouldDirty: true,
    shouldValidate: true,
  });

  setValue("legalAddress.address", parsedData.legalAddress.address, {
    shouldDirty: true,
    shouldValidate: true,
  });

  setValue("legalAddress.zipCode", parsedData.legalAddress.zipCode, {
    shouldDirty: true,
    shouldValidate: true,
  });

  setValue("legalAddress.city", parsedData.legalAddress.city, {
    shouldDirty: true,
    shouldValidate: true,
  });

  setValue("legalAddress.countryCode", parsedData.legalAddress.countryCode, {
    shouldDirty: true,
    shouldValidate: true,
  });

  return true;
}
