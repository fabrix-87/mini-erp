"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { OpportunityFormValues } from "@mini-erp/shared";

/**
 * Subform for managing proposed products within an opportunity form.
 * Uses useFieldArray to handle dynamic product rows.
 * Must be rendered inside a FormProvider.
 */
export function OpportunityProposedProducts() {
  const t = useTranslations("crm.opportunities");
  const { control } = useFormContext<OpportunityFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "proposedProducts",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-sm font-medium">
          {t("form.proposedProducts")}
        </FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              productId: "",
              quantity: "1",
              price: "0",
              discount: "0",
              notes: null,
            })
          }
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          {t("form.addProduct")}
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border rounded-md">
          {t("form.noProducts")}
        </p>
      )}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="grid gap-3 p-3 border rounded-md bg-muted/30 md:grid-cols-[1fr_80px_100px_80px_auto]"
        >
          {/* productId */}
          <FormField
            control={control}
            name={`proposedProducts.${index}.productId`}
            render={({ field }) => (
              <FormItem>
                {index === 0 && <FormLabel className="text-xs">{t("form.productId")}</FormLabel>}
                <FormControl>
                  <Input placeholder="ID prodotto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* quantity */}
          <FormField
            control={control}
            name={`proposedProducts.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                {index === 0 && <FormLabel className="text-xs">{t("form.quantity")}</FormLabel>}
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} value={String(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* price */}
          <FormField
            control={control}
            name={`proposedProducts.${index}.price`}
            render={({ field }) => (
              <FormItem>
                {index === 0 && <FormLabel className="text-xs">{t("form.price")} (€)</FormLabel>}
                <FormControl>
                  <Input type="number" min={0} step="0.01" {...field} value={String(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* discount */}
          <FormField
            control={control}
            name={`proposedProducts.${index}.discount`}
            render={({ field }) => (
              <FormItem>
                {index === 0 && <FormLabel className="text-xs">{t("form.discount")} (%)</FormLabel>}
                <FormControl>
                  <Input type="number" min={0} max={100} step="0.01" {...field} value={String(field.value)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* remove */}
          <div className={index === 0 ? "flex items-end pb-0.5" : "flex items-start pt-1"}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive h-9 w-9"
              onClick={() => remove(index)}
              aria-label={t("form.removeProduct")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* notes — full width */}
          <FormField
            control={control}
            name={`proposedProducts.${index}.notes`}
            render={({ field }) => (
              <FormItem className="md:col-span-5">
                <FormControl>
                  <Textarea
                    rows={1}
                    placeholder={t("form.productNotes")}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}