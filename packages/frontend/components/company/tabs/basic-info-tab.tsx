// packages/frontend/components/company/tabs/basic-info-tab.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { CompanyFormValues } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

import { Input } from "../../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../ui/form";
import { CountryCombobox } from "../../combobox/country-combobox";

const entityTypes = ["JURIDICAL", "NATURAL", "FOREIGN"] as const;
const statuses = ["ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"] as const;

const identityFields = [
  { name: "companyName", required: true, className: "md:col-span-2" },
  { name: "tradeName", required: false, className: "" },
  { name: "legalForm", required: false, className: "" },
] as const;

const contactFields = [
  { name: "mainEmail", type: "email" },
  { name: "mainPhone", type: "tel" },
  { name: "mainWebsite", type: "text" },
] as const;

const addressFields = ["zipCode", "city", "provinceCode"] as const;

/**
 * Renders company identification, contact, and registered address fields.
 * @returns Company fields connected to the parent React Hook Form context.
 */
export function BasicInfoTab(): React.JSX.Element {
  const { control, setValue, watch } = useFormContext<CompanyFormValues>();
  const t = useTranslations("crm.companies.form.info-tab");
  const isForeign = watch("entityType") === "FOREIGN";

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t("general.title")}</CardTitle>
          <CardDescription>{t("general.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="entityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.entityType.label")} *</FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) => {
                      field.onChange(value);

                      if (value === "FOREIGN") {
                        setValue("legalAddress.provinceCode", "EE");
                        setValue("vatNumber", "");
                        setValue("taxCode", "");
                        setValue("sdiCode", "XXXXXXX");
                      } else if (value === "NATURAL") {
                        setValue("sdiCode", "0000000");
                        setValue("legalAddress.provinceCode", "");
                      } else {
                        setValue("legalAddress.provinceCode", "");
                        setValue("vatNumber", "");
                        setValue("taxCode", "");
                        setValue("sdiCode", "");
                      }
                    }}
                  >
                    <FormControl>
                      <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                        <SelectValue placeholder={t("fields.entityType.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entityTypes.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`fields.entityType.options.${value}`)}
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.status.label")}</FormLabel>
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                        <SelectValue placeholder={t("fields.status.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`fields.status.options.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {identityFields.map(({ name, required, className }) => (
              <FormField
                key={name}
                control={control}
                name={name}
                render={({ field }) => (
                  <FormItem className={className}>
                    <FormLabel>
                      {t(`fields.${name}.label`)}
                      {required ? " *" : ""}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-required={required}
                        placeholder={t(`fields.${name}.placeholder`)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("contacts.title")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {contactFields.map(({ name, type }) => (
            <FormField
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(`fields.${name}.label`)}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      type={type}
                      placeholder={t(`fields.${name}.placeholder`)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("legalAddress.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="legalAddress.address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.address.label")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    aria-required
                    placeholder={t("fields.address.placeholder")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 md:grid-cols-4">
            {addressFields.map((name) => (
              <FormField
                key={name}
                control={control}
                name={`legalAddress.${name}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`fields.${name}.label`)} *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        aria-required
                        placeholder={t(`fields.${name}.placeholder`)}
                        disabled={name === "provinceCode" && isForeign}
                        maxLength={name === "provinceCode" ? 2 : undefined}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={control}
              name="legalAddress.countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.countryCode.label")} *</FormLabel>

                  <FormControl>
                    <CountryCombobox
                      ref={field.ref}
                      name={field.name}
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-required
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
