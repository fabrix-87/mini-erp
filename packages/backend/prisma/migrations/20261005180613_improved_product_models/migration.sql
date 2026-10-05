/*
  Warnings:

  - The primary key for the `manufacturers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `price` on the `price_list_items` table. The data in that column could be lost. The data in that column will be cast from `Decimal(19,4)` to `Decimal(20,6)`.
  - The primary key for the `product_image_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `product_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `link_rewrite` on the `product_translations` table. All the data in the column will be lost.
  - You are about to drop the column `redirect_target` on the `products` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(20,6)`.
  - You are about to alter the column `wholesale_price` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(20,6)`.
  - You are about to alter the column `ecotax` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,4)` to `Decimal(20,6)`.
  - A unique constraint covering the columns `[tenant_id,name]` on the table `manufacturers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_id]` on the table `product_images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,variant_id]` on the table `product_images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,language_id,slug]` on the table `product_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,variant_code]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_id,id]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,sku]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,ean13]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_id]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_image_translations" DROP CONSTRAINT "product_image_translations_product_image_id_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_tenant_id_manufacturer_id_fkey";

-- DropIndex
DROP INDEX "feature_groups_code_key";

-- DropIndex
DROP INDEX "product_categories_product_id_position_idx";

-- DropIndex
DROP INDEX "product_categories_tenant_id_category_id_idx";

-- DropIndex
DROP INDEX "product_images_image_type_idx";

-- DropIndex
DROP INDEX "product_images_position_idx";

-- DropIndex
DROP INDEX "product_images_product_id_idx";

-- DropIndex
DROP INDEX "product_images_variant_id_idx";

-- DropIndex
DROP INDEX "product_translations_tenant_id_language_id_link_rewrite_key";

-- DropIndex
DROP INDEX "product_variants_deleted_at_idx";

-- DropIndex
DROP INDEX "product_variants_is_default_idx";

-- DropIndex
DROP INDEX "product_variants_product_id_active_idx";

-- DropIndex
DROP INDEX "product_variants_product_id_idx";

-- DropIndex
DROP INDEX "product_variants_tenant_id_ean13_key";

-- DropIndex
DROP INDEX "product_variants_tenant_id_sku_key";

-- DropIndex
DROP INDEX "product_variants_variant_code_idx";

-- DropIndex
DROP INDEX "product_variants_variant_code_key";

-- AlterTable
ALTER TABLE "manufacturers" DROP CONSTRAINT "manufacturers_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "manufacturers_id_seq";

-- AlterTable
ALTER TABLE "price_list_items" ALTER COLUMN "price" SET DATA TYPE DECIMAL(20,6);

-- AlterTable
ALTER TABLE "product_image_translations" DROP CONSTRAINT "product_image_translations_pkey",
ALTER COLUMN "product_image_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "product_image_translations_pkey" PRIMARY KEY ("product_image_id", "language_id");

-- AlterTable
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "product_images_id_seq";

-- AlterTable
ALTER TABLE "product_translations" DROP COLUMN "link_rewrite",
ADD COLUMN     "slug" VARCHAR(255);

-- AlterTable
ALTER TABLE "products" DROP COLUMN "redirect_target",
ADD COLUMN     "redirect_target_id" TEXT,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(20,6),
ALTER COLUMN "wholesale_price" SET DATA TYPE DECIMAL(20,6),
ALTER COLUMN "ecotax" SET DATA TYPE DECIMAL(20,6),
ALTER COLUMN "manufacturer_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_tenant_id_name_key" ON "manufacturers"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "product_categories_tenant_id_category_id_position_idx" ON "product_categories"("tenant_id", "category_id", "position");

-- CreateIndex
CREATE INDEX "product_images_tenant_id_product_id_position_idx" ON "product_images"("tenant_id", "product_id", "position");

-- CreateIndex
CREATE INDEX "product_images_tenant_id_product_id_variant_id_idx" ON "product_images"("tenant_id", "product_id", "variant_id") WHERE ("variant_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_image_one_product_cover" ON "product_images"("tenant_id", "product_id") WHERE ("is_cover" = true AND "variant_id" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_image_one_variant_cover" ON "product_images"("tenant_id", "variant_id") WHERE ("is_cover" = true AND "variant_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_tenant_id_language_id_slug_key" ON "product_translations"("tenant_id", "language_id", "slug");

-- CreateIndex
CREATE INDEX "product_variants_tenant_id_product_id_active_idx" ON "product_variants"("tenant_id", "product_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_variant_code_key" ON "product_variants"("tenant_id", "variant_code");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_product_id_id_key" ON "product_variants"("tenant_id", "product_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_sku_key" ON "product_variants"("tenant_id", "sku") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_ean13_key" ON "product_variants"("tenant_id", "ean13") WHERE ("deleted_at" IS NULL AND "ean13" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_variant_one_default_per_product" ON "product_variants"("tenant_id", "product_id") WHERE ("is_default" = true AND "deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "products_tenant_id_redirect_target_id_idx" ON "products"("tenant_id", "redirect_target_id") WHERE ("redirect_target_id" IS NOT NULL);

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_manufacturer_id_fkey" FOREIGN KEY ("tenant_id", "manufacturer_id") REFERENCES "manufacturers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_redirect_target_id_fkey" FOREIGN KEY ("tenant_id", "redirect_target_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_tenant_id_product_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_id", "variant_id") REFERENCES "product_variants"("tenant_id", "product_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image_translations" ADD CONSTRAINT "product_image_translations_product_image_id_fkey" FOREIGN KEY ("product_image_id") REFERENCES "product_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migration: target required only for 301/302 and never self-referencing
ALTER TABLE products ADD CONSTRAINT products_redirect_target_chk CHECK (
  (redirect_type = 'NOT_FOUND' AND redirect_target_id IS NULL)
  OR (redirect_type <> 'NOT_FOUND' AND redirect_target_id IS NOT NULL AND redirect_target_id <> id)
);