"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { CreateProductFormValues, UpdateProductFormValues } from "@mini-erp/shared";

import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  getProductConditionsOptions,
  getProductStatusesOptions,
  getProductTypesOptions,
  getProductVisibilityOptions,
} from "@/helpers/product-helpers";

type ProductFormValues = CreateProductFormValues | UpdateProductFormValues;

/**
 * Renders the general information fields for a product.
 */
export function ProductGeneralFields(): React.JSX.Element {
  const t = useTranslations("catalog.products");
  const form = useFormContext<ProductFormValues>();

  const typeOptions = getProductTypesOptions(t);
  const statusOptions = getProductStatusesOptions(t);
  const visibilityOptions = getProductVisibilityOptions(t);
  const conditionOptions = getProductConditionsOptions(t);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.reference")}</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} maxLength={64} autoComplete="off" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.type")}</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {typeOptions.map((option) => (
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.status")}</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statusOptions.map((option) => (
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

        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.visibility")}</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {visibilityOptions.map((option) => (
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

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.condition")}</FormLabel>
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conditionOptions.map((option) => (
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
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.active")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.active")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="availableForOrder"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.availableForOrder")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.availableForOrder")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showPrice"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.showPrice")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.showPrice")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onlineOnly"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.onlineOnly")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.onlineOnly")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="onSale"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.onSale")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.onSale")}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showCondition"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between gap-4 rounded-md border p-3">
              <FormLabel>{t("form.showCondition")}</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  aria-label={t("form.showCondition")}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
