// packages/frontend/components/company/tabs/classification-tab.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { CompanyFormInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

import { Textarea } from "../../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { CompanyType } from "@/types/company-types";
import { getCustomerCreditStatusOptions, getCustomerTypeOptions } from "@/helpers/customer-helper";

/** Props for the company classification tab. */
export interface ClassificationTabProps {
  companyType: CompanyType;
}

/**
 * Renders customer classification and custom JSON fields.
 * @param props - Company category controlling customer-specific fields.
 * @returns Classification fields connected to the parent form context.
 */
export function ClassificationTab({ companyType }: ClassificationTabProps): React.JSX.Element {
  const { control } = useFormContext<CompanyFormInput>();
  const t = useTranslations("crm.companies.form.classification-tab");
  const tc = useTranslations("crm.customers")

  return (
    <>
      {companyType === "CUSTOMER" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("customer.title")}</CardTitle>
          </CardHeader>

          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.type.label")}</FormLabel>

                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                  >
                    <FormControl>
                      <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                        <SelectValue placeholder={t("fields.type.placeholder")} />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {getCustomerTypeOptions(tc).map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="creditStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.creditStatus.label")}</FormLabel>

                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={field.disabled}
                  >
                    <FormControl>
                      <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                        <SelectValue placeholder={t("fields.creditStatus.placeholder")} />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {getCustomerCreditStatusOptions(tc).map((credit) => (
                        <SelectItem key={credit.value} value={credit.value}>
                          {credit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("additional.title")}</CardTitle>
          <CardDescription>{t("additional.description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <FormField
            control={control}
            name="customFields"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.customFields.label")}</FormLabel>

                <FormControl>
                  <Textarea
                    ref={field.ref}
                    name={field.name}
                    onBlur={field.onBlur}
                    disabled={field.disabled}
                    value={
                      typeof field.value === "string"
                        ? field.value
                        : JSON.stringify(field.value ?? {}, null, 2)
                    }
                    onChange={(event) => {
                      const value = event.target.value;

                      try {
                        field.onChange(JSON.parse(value));
                      } catch {
                        // Preserve incomplete JSON while the user is typing.
                        field.onChange(value);
                      }
                    }}
                    placeholder={t("fields.customFields.placeholder")}
                    rows={6}
                    spellCheck={false}
                    className="font-mono text-sm"
                  />
                </FormControl>

                <FormDescription>{t("fields.customFields.description")}</FormDescription>

                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </>
  );
}
