"use client";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { CreateProductFormValues, UpdateProductFormValues } from "@mini-erp/shared";

import { ProductForm } from "./form";

type ProductFormValues = CreateProductFormValues | UpdateProductFormValues;

/**
 * Initializes and displays the product form in client-side mode.
 *
 * @returns The product form container.
 */
export function ProductFormContainer(): React.JSX.Element {
  const t = useTranslations("catalog.products");

  const form = useForm<ProductFormValues>({
    defaultValues: {
      reference: "",
      type: "STANDARD",
      status: "DRAFT",
      active: true,
      availableForOrder: true,
      showPrice: true,
      onlineOnly: false,
      onSale: false,
      price: 0,
      wholesalePrice: 0,
      ecotax: 0,
      defaultTaxRuleId: null,
      visibility: "BOTH",
      condition: "NEW",
      showCondition: false,
      additionalShippingCost: 0,
      deliveryTimeNoteType: 0,
      redirectType: "NOT_FOUND",
      variants: [
        {
          variantCode: "",
          sku: "",
          minimalQuantity: 1,
          lowStockThreshold: 0,
          lowStockAlertEnabled: false,
          packStockType: "USE_PACK_STOCK_ONLY",
          outOfStockType: "DENY_ORDERS",
          unitPriceRatio: "0",
          position: 0,
          isDefault: true,
          active: true,
          availableForOrder: true,
        },
      ],
    },
  });

  const handleSubmit: SubmitHandler<ProductFormValues> = () => {
    // TODO: Connect the product creation/update flow.
  };

  return <ProductForm form={form} onSubmit={handleSubmit} submitLabel={t("form.actions.save")} />;
}
