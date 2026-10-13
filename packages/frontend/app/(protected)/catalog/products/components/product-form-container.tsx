"use client";

import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { CreateProductFormValues, Product, UpdateProductFormValues } from "@mini-erp/shared";

import { ProductForm } from "./form";
import { createProductAction, updateProductAction } from "@/actions/product-actions";
import { toast } from "sonner";

type ProductFormContainerProps =
  | {
      mode?: "create";
      product?: never;
    }
  | {
      mode: "edit";
      product: Product;
    };

/**
 * Initializes and displays the product form in client-side mode.
 *
 * @returns The product form container.
 */
export function ProductFormContainer({
  mode = "create",
  product,
}: ProductFormContainerProps): React.JSX.Element {
  const t = useTranslations("catalog.products");

  const form = useForm<CreateProductFormValues>({
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

  const handleSubmit: SubmitHandler<CreateProductFormValues> = async (values) => {
    if (mode === "create") {
      const result = await createProductAction(values);
      if(result.success) toast.info(t('form.actions.createSuccess'))
      // TODO: Gestire il risultato della creazione.
      return;
    }

    if (product) {
      const result = await updateProductAction(product.id, values);
      if(result.success) toast.info(t('form.actions.updateSuccess'))
      // TODO: Gestire il risultato dell'aggiornamento.
    }
  };

  return <ProductForm form={form} onSubmit={handleSubmit} submitLabel={t("form.actions.save")} />;
}
