"use client";

import { FormProvider } from "react-hook-form";
import type { SubmitHandler, UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import type { CreateProductFormValues, UpdateProductFormValues } from "@mini-erp/shared";

import { Button } from "@/components/ui/button";

import { ProductGeneralFields } from "./product-general-fields";
import { ProductPricingFields } from "./product-pricing-fields";
import { ProductVariantsFields } from "./product-variants-fields";
import { Card, CardContent } from "@/components/ui/card";

type ProductFormValues = CreateProductFormValues | UpdateProductFormValues;

type ProductFormProps = {
  form: UseFormReturn<ProductFormValues>;
  onSubmit: SubmitHandler<ProductFormValues>;
  submitLabel: string;
};

/**
 * Composes the product form sections and handles form submission.
 *
 * @param props - Form instance, submit handler, and submit button label.
 * @returns The composed product form.
 */
export function ProductForm({ form, onSubmit, submitLabel }: ProductFormProps): React.JSX.Element {
  const t = useTranslations("catalog.products");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <Card>
          <CardContent className="space-y-4 pt-6">
            <ProductGeneralFields />

            <ProductPricingFields />

            <ProductVariantsFields />
          </CardContent>
        </Card>

        <div className="flex justify-end border-t pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("form.saving") : submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
