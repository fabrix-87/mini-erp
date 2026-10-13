"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { CreateProductFormValues, UpdateProductFormValues } from "@mini-erp/shared";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TaxRuleCombobox } from "@/components/combobox/tax-rule-combobox";

type ProductFormValues = CreateProductFormValues | UpdateProductFormValues;

/**
 * Renders the pricing fields for a product.
 */
export function ProductPricingFields(): React.JSX.Element {
  const t = useTranslations("catalog.products");
  const form = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.pricing.price")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wholesalePrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.pricing.wholesalePrice")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ecotax"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.pricing.ecotax")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalShippingCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.pricing.additionalShippingCost")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? 0}
                  onChange={(event) => {
                    const value = event.target.value;
                    field.onChange(value === "" ? 0 : Number(value));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-2">
        <FormField
          control={form.control}
          name="additionalShippingCost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.pricing.defaultTaxRule")}</FormLabel>
              <FormControl>
                <TaxRuleCombobox
                  value={field.value?.toString() ?? undefined}
                  onValueChange={(value) => {
                    field.onBlur();
                    field.onChange(value || null);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
