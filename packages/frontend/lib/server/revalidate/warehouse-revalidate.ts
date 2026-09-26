import { WAREHOUSE_TAGS } from "@/types/warehouse-types";
import { revalidateEntity, revalidateEntityWithList } from ".";

export const warehouseRevalidation = {
  warehouse: (id: string) =>
    revalidateEntityWithList("warehouses", id, {
      detailTag: WAREHOUSE_TAGS.detail(id),
      listTag: WAREHOUSE_TAGS.list,
    }),

  list: () =>
    revalidateEntity("warehouses", undefined, {
      listTag: WAREHOUSE_TAGS.list,
    }),
};
