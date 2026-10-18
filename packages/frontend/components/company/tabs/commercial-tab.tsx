// packages/frontend/components/company/tabs/commercial-tab.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { CompanyFormInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerCommercialFields } from "./customer-commercial-fields";
import { SupplierCommercialFields } from "./supplier-commercial-fields";
import { CompanyType } from "@/types/company-types";

/** Props for the company commercial terms tab. */
export interface CommercialTabProps {
  companyType: CompanyType;
}

/**
 * Renders shared and company-specific commercial terms.
 * @param props - Company category controlling the visible commercial fields.
 * @returns Commercial fields connected to the parent form context.
 */
export function CommercialTab({
  companyType,
}: CommercialTabProps): React.JSX.Element {
  const { control } = useFormContext<CompanyFormInput>();
  const t = useTranslations("crm.companies.form.commercial-tab");
  const isCustomer = companyType === "CUSTOMER";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {isCustomer
            ? t("description.customer")
            : t("description.supplier")}
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4 md:grid-cols-2">
        <FormField
          control={control}
          name="creditLimit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isCustomer
                  ? t("fields.creditLimit.customerLabel")
                  : t("fields.creditLimit.supplierLabel")}
              </FormLabel>

              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder={t("fields.creditLimit.placeholder")}
                />
              </FormControl>

              {!isCustomer && (
                <FormDescription>
                  {t("fields.creditLimit.description")}
                </FormDescription>
              )}

              <FormMessage />
            </FormItem>
          )}
        />

        {isCustomer ? (
          <CustomerCommercialFields />
        ) : (
          <SupplierCommercialFields />
        )}
      </CardContent>
    </Card>
  );
}