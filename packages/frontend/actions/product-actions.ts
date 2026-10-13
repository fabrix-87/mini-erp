"use server"

import { ActionResult, withAuth } from "@/lib/server/action";
import { productRevalidation } from "@/lib/server/revalidate";
import { createProduct, updateProduct } from "@/services/server/product-service";
import { CreateProductFormValues, Product, UpdateProductFormValues } from "@mini-erp/shared";

// ============================================================================
// Product CRUD Actions
// ============================================================================

export async function createProductAction(
  data: CreateProductFormValues,
): Promise<ActionResult<Product>> {
  return withAuth(async () => {
    const res = await createProduct(data);
    if (res.status === "success") productRevalidation.list();
    else console.error(res.errors);
    return res.data;
  }, "product:create");
}

export async function updateProductAction(
  productId: string,
  data: UpdateProductFormValues,
): Promise<ActionResult<Product>> {
  return withAuth(async () => {
    const res = await updateProduct(productId, data);
    if (res.status === "success") productRevalidation.opportunityWithList(productId);
    else console.error(res.errors);
    return res.data;
  }, "product:update");
}
