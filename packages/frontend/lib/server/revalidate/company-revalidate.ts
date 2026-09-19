import { CUSTOMER_TAGS } from "@/types/customer-types";
import { revalidateEntity, revalidateEntityWithList } from ".";
import { SUPPLIER_TAGS } from "@/types/supplier-types";

/**
 * Revalidate customer-related cache.
 * Route: /crm/customers
 */
export const customerRevalidation = {
  /** Revalidate specific customer detail and path. */
  customer: (id: string) =>
    revalidateEntity("customers", id, {
      detailTag: CUSTOMER_TAGS.detail(id),
    }),

  /** Revalidate customers list. */
  list: () =>
    revalidateEntity("customers", undefined, {
      listTag: CUSTOMER_TAGS.list,
    }),

  /** Revalidate specific customer and customers list. */
  customerWithList: (id: string) =>
    revalidateEntityWithList("customers", id, {
      detailTag: CUSTOMER_TAGS.detail(id),
      listTag: CUSTOMER_TAGS.list,
    }),
};

/**
 * Revalidate supplier-related cache.
 * Route: /crm/suppliers
 */
export const supplierRevalidation = {
  /** Revalidate specific supplier detail and path. */
  supplier: (id: string) =>
    revalidateEntity("suppliers", id, {
      detailTag: SUPPLIER_TAGS.detail(id),
    }),

  /** Revalidate suppliers list. */
  list: () =>
    revalidateEntity("suppliers", undefined, {
      listTag: SUPPLIER_TAGS.list,
    }),

  /** Revalidate specific supplier and suppliers list. */
  supplierWithList: (id: string) =>
    revalidateEntityWithList("suppliers", id, {
      detailTag: SUPPLIER_TAGS.detail(id),
      listTag: SUPPLIER_TAGS.list,
    }),
};
