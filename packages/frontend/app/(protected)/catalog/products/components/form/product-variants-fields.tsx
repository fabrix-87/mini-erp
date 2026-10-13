"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";

import type { CreateProductFormValues, UpdateProductFormValues } from "@mini-erp/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

/**
 * Renders product variants in a table with add and remove actions.
 */
export function ProductVariantsFields(): React.JSX.Element {
  const t = useTranslations("catalog.products");
  const form = useFormContext<CreateProductFormValues>();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  /**
   * Adds a new variant with the minimum required identifying fields.
   */
  function handleAddVariant(): void {
    append({
      variantCode: "",
      sku: "",
      minimalQuantity: 1,
      lowStockThreshold: 0,
      lowStockAlertEnabled: false,
      packStockType: "USE_PACK_STOCK_ONLY",
      outOfStockType: "DENY_ORDERS",
      unitPriceRatio: "0",
      position: fields.length,
      isDefault: fields.length === 0,
      active: true,
      availableForOrder: true,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold">{t("form.variants.title")}</h3>

        <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
          <Plus className="mr-2 size-4" />
          {t("form.actions.addVariant")}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-275 text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="p-3 text-left font-medium">{t("form.variants.variantCode")}</th>
              <th className="p-3 text-left font-medium">SKU</th>
              <th className="p-3 text-left font-medium">EAN-13</th>
              <th className="p-3 text-left font-medium">{t("form.variants.price")}</th>
              <th className="p-3 text-left font-medium">{t("form.variants.wholesalePrice")}</th>
              <th className="p-3 text-center font-medium">{t("form.variants.defaultVariant")}</th>
              <th className="p-3 text-center font-medium">{t("form.variants.active")}</th>
              <th className="p-3 text-center font-medium">{t("form.variants.availableForOrder")}</th>
              <th className="p-3 text-right font-medium">
                <span className="sr-only">{t("form.variants.actions")}</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {fields.map((variant, index) => (
              <tr key={variant.id} className="border-b last:border-0">
                <td className="min-w-36 p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.variantCode` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            maxLength={64}
                            aria-label={`${t("form.variants.variantCode")} ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                <td className="min-w-36 p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.sku` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            maxLength={64}
                            aria-label={`SKU ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                <td className="min-w-36 p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.ean13` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            maxLength={13}
                            aria-label={`EAN-13 ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                <td className="min-w-28 p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.price` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === "" ? null : Number(value));
                            }}
                            aria-label={`${t("form.variants.price")} ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                <td className="min-w-28 p-2 align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.wholesalePrice` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            value={field.value ?? ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              field.onChange(value === "" ? null : Number(value));
                            }}
                            aria-label={`${t("form.variants.wholesalePrice")} ${index + 1}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </td>

                <td className="p-2 text-center align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.isDefault` as const}
                    render={({ field }) => (
                      <FormItem className="flex justify-center pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            aria-label={`${t("form.variants.defaultVariant")} ${index + 1}`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>

                <td className="p-2 text-center align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.active` as const}
                    render={({ field }) => (
                      <FormItem className="flex justify-center pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            aria-label={`${t("form.variants.active")} ${index + 1}`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>

                <td className="p-2 text-center align-top">
                  <FormField
                    control={form.control}
                    name={`variants.${index}.availableForOrder` as const}
                    render={({ field }) => (
                      <FormItem className="flex justify-center pt-2">
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                            aria-label={`${t("form.variants.availableForOrder")} ${index + 1}`}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </td>

                <td className="p-2 text-right align-top">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${t("form.actions.removeVariant")} ${index + 1}`}
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}

            {fields.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-muted-foreground">
                  {t("form.variants.noVariants")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
