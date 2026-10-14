/*
  Warnings:

  - You are about to drop the column `currency_id` on the `product_suppliers` table. All the data in the column will be lost.
  - You are about to alter the column `min_order_qty` on the `product_suppliers` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,6)` to `Decimal(15,6)`.
  - You are about to drop the column `available_later_label` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `available_now_label` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_time_in_stock_note` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `delivery_time_out_of_stock_note` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `meta_description` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `meta_keywords` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `meta_title` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `out_of_stock_type` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `pack_stock_type` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price_ratio` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `variant_code` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `wholesale_price` on the `product_variants` table. All the data in the column will be lost.
  - You are about to alter the column `minimal_quantity` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - You are about to alter the column `low_stock_threshold` on the `product_variants` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - You are about to drop the column `delivery_time_note_type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_id` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `product_suppliers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_id,combination_key]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `product_suppliers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_variant_attributes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `combination_key` to the `product_variants` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_variant_attributes" DROP CONSTRAINT "product_variant_attributes_tenant_id_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_tenant_id_supplier_id_fkey";

-- DropIndex
DROP INDEX "product_translations_tenant_id_language_id_slug_key";

-- DropIndex
DROP INDEX "product_variants_tenant_id_variant_code_key";

-- DropIndex
DROP INDEX "products_tenant_id_supplier_id_idx";

-- AlterTable
ALTER TABLE "product_suppliers" DROP COLUMN "currency_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "min_order_qty" SET DATA TYPE DECIMAL(15,6);

-- AlterTable
ALTER TABLE "product_translations" DROP COLUMN "available_later_label",
DROP COLUMN "available_now_label",
DROP COLUMN "delivery_time_in_stock_note",
DROP COLUMN "delivery_time_out_of_stock_note",
DROP COLUMN "meta_description",
DROP COLUMN "meta_keywords",
DROP COLUMN "meta_title",
DROP COLUMN "slug",
DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "product_variant_attributes" ADD COLUMN     "product_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "out_of_stock_type",
DROP COLUMN "pack_stock_type",
DROP COLUMN "price",
DROP COLUMN "unit_price_ratio",
DROP COLUMN "variant_code",
DROP COLUMN "wholesale_price",
ADD COLUMN     "combination_key" VARCHAR(64) NOT NULL,
ALTER COLUMN "minimal_quantity" SET DEFAULT 1,
ALTER COLUMN "minimal_quantity" SET DATA TYPE DECIMAL(15,6),
ALTER COLUMN "low_stock_threshold" SET DEFAULT 0,
ALTER COLUMN "low_stock_threshold" SET DATA TYPE DECIMAL(15,6),
ALTER COLUMN "weight" DROP DEFAULT,
ALTER COLUMN "width" DROP DEFAULT,
ALTER COLUMN "height" DROP DEFAULT,
ALTER COLUMN "depth" DROP DEFAULT;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "delivery_time_note_type",
DROP COLUMN "supplier_id",
ADD COLUMN     "out_of_stock_type" "OutOfStockType" NOT NULL DEFAULT 'DENY_ORDERS',
ADD COLUMN     "pack_stock_type" "PackStockType" NOT NULL DEFAULT 'USE_PACK_STOCK_ONLY',
ADD COLUMN     "supplierId" TEXT;

-- CreateTable
CREATE TABLE "product_variant_axes" (
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "attribute_group_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_variant_axes_pkey" PRIMARY KEY ("product_id","attribute_group_id")
);

-- CreateIndex
CREATE INDEX "product_variant_axes_tenant_id_attribute_group_id_idx" ON "product_variant_axes"("tenant_id", "attribute_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_axes_tenant_id_product_id_attribute_group_i_key" ON "product_variant_axes"("tenant_id", "product_id", "attribute_group_id");

-- CreateIndex
CREATE INDEX "product_suppliers_tenant_id_supplier_id_idx" ON "product_suppliers"("tenant_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_tenant_id_id_key" ON "product_suppliers"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_variant_combination_per_product" ON "product_variants"("tenant_id", "product_id", "combination_key") WHERE ("deleted_at" IS NULL);

-- AddForeignKey
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_tenant_id_product_id_product_va_fkey" FOREIGN KEY ("tenant_id", "product_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "product_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_tenant_id_product_id_attribute__fkey" FOREIGN KEY ("tenant_id", "product_id", "attribute_group_id") REFERENCES "product_variant_axes"("tenant_id", "product_id", "attribute_group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_suppliers" ADD CONSTRAINT "product_suppliers_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_axes" ADD CONSTRAINT "product_variant_axes_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_axes" ADD CONSTRAINT "product_variant_axes_tenant_id_attribute_group_id_fkey" FOREIGN KEY ("tenant_id", "attribute_group_id") REFERENCES "attribute_groups"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
