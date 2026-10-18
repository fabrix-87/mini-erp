// packages/frontend/components/company/tabs/customer-commercial-fields.tsx
"use client";

import { useFormContext } from "react-hook-form";
import type { CompanyFormInput } from "@mini-erp/shared";
import { useTranslations } from "next-intl";

import {
  getCustomerPriorityOptions,
  getCustomerSegmentOptions,
  getCustomerSizeOptions,
} from "@/helpers/customer-helper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

/**
 * Renders customer segment, priority, and size selectors.
 * @returns Customer commercial fields connected to the parent form.
 */
export function CustomerCommercialFields(): React.JSX.Element {
  const { control } = useFormContext<CompanyFormInput>();
  const t = useTranslations("crm.companies.form.commercial-tab");
  const tc = useTranslations("crm.customers");

  const selectors = [
    { name: "segment", options: getCustomerSegmentOptions(tc) },
    { name: "priority", options: getCustomerPriorityOptions(tc) },
    { name: "size", options: getCustomerSizeOptions(tc) },
  ] as const;

  return (
    <>
      {selectors.map(({ name, options }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(`fields.${name}.label`)}</FormLabel>

              <Select
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={field.disabled}
              >
                <FormControl>
                  <SelectTrigger ref={field.ref} onBlur={field.onBlur} className="w-full">
                    <SelectValue placeholder={t(`fields.${name}.placeholder`)} />
                  </SelectTrigger>
                </FormControl>

                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </>
  );
}
