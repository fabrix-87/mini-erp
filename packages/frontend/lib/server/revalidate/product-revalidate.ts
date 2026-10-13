import { PRODUCT_TAGS } from "@/types/product-types";
import { revalidateEntity, revalidateEntityWithList, revalidateTag } from ".";

export const productRevalidation = {
  /** Revalidate single product detail and path. */
  product: (id: string) =>
    revalidateEntityWithList("products", id, {
      detailTag: PRODUCT_TAGS.detail(id),
      listTag: PRODUCT_TAGS.list,
    }),

  /** Revalidate only the list. */
  list: () =>
    revalidateEntity("products", undefined, {
      listTag: PRODUCT_TAGS.list,
    }),

  /** Revalidate detail + list + stats. */
  opportunityWithList: (id: string) => {
    revalidateEntityWithList("products", id, {
      detailTag: PRODUCT_TAGS.detail(id),
      listTag: PRODUCT_TAGS.list,
    });
    revalidateTag(PRODUCT_TAGS.stats);
  },
};
