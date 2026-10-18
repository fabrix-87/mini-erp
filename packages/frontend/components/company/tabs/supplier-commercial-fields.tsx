// packages/frontend/components/company/tabs/supplier-commercial-fields.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { CompanyFormInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getSupplierRatingOptions } from "@/helpers/supplier-helper";

const numericFields = [
  { name: "leadTimeDays", step: "1", required: true },
  { name: "transportCost", step: "0.01", required: false },
] as const;

/**
 * Renders supplier payment, delivery, transport, and rating fields.
 * @returns Supplier commercial fields connected to the parent form.
 */
export function SupplierCommercialFields(): React.JSX.Element {
  const { control } = useFormContext<CompanyFormInput>();
  const t = useTranslations("crm.companies.form.commercial-tab");

  return (
    <>
      <FormField
        control={control}
        name="paymentTerms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fields.paymentTerms.label")}</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder={t("fields.paymentTerms.placeholder")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {numericFields.map(({ name, step, required }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t(`fields.${name}.label`)}
                {required ? " *" : ""}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  type="number"
                  min={0}
                  step={step}
                  aria-required={required}
                  placeholder={t(`fields.${name}.placeholder`)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}

      <FormField
        control={control}
        name="rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("fields.rating.label")}</FormLabel>

            <Select
              value={field.value?.toString() ?? ""}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={field.disabled}
            >
              <FormControl>
                <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                  <SelectValue placeholder={t("fields.rating.placeholder")} />
                </SelectTrigger>
              </FormControl>

              <SelectContent>
                {getSupplierRatingOptions(t).map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
