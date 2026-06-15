/*
Warnings:

- The primary key for the `activities` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `activity_participants` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `link_rewrite` on the `category_translations` table. All the data in the column will be lost.
- The primary key for the `closed_reason_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `closed_reasons` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `document_lines` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `document_payment_installments` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `intrastat_transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `is_correction` on the `intrastat_transactions` table. All the data in the column will be lost.
- You are about to drop the column `proposed_products` on the `opportunities` table. All the data in the column will be lost.
- The primary key for the `price_list_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `price_lists` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `product_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `product_variant_attribute` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `product_variants` table will be changed. If it partially fails, the table could be left without primary key constraint.
- A unique constraint covering the columns `[activity_id,external_email]` on the table `activity_participants` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[name]` on the table `activity_templates` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,language_id,slug]` on the table `category_translations` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[document_line_id,correction_sequence]` on the table `intrastat_transactions` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,sku]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
- Added the required column `tenant_id` to the `categories` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `category_translations` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `product_variants` table without a default value. This is not possible if the table is not empty.
- Made the column `sku` on table `product_variants` required. This step will fail if there are existing NULL values in that column.

 */
-- DropForeignKey
ALTER TABLE "activities"
DROP CONSTRAINT "activities_follow_up_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "activity_participants"
DROP CONSTRAINT "activity_participants_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "categories"
DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "category_translations"
DROP CONSTRAINT "category_translations_category_id_fkey";

-- DropForeignKey
ALTER TABLE "closed_reason_translations"
DROP CONSTRAINT "closed_reason_translations_closed_reason_id_fkey";

-- DropForeignKey
ALTER TABLE "customers"
DROP CONSTRAINT "customers_default_price_list_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_parent_line_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "intrastat_transactions"
DROP CONSTRAINT "intrastat_transactions_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunities"
DROP CONSTRAINT "opportunities_closed_reason_id_fkey";

-- DropForeignKey
ALTER TABLE "price_list_items"
DROP CONSTRAINT "price_list_items_price_list_id_fkey";

-- DropForeignKey
ALTER TABLE "price_list_items"
DROP CONSTRAINT "price_list_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "price_lists"
DROP CONSTRAINT "price_lists_parent_list_id_fkey";

-- DropForeignKey
ALTER TABLE "product_categories"
DROP CONSTRAINT "product_categories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_images"
DROP CONSTRAINT "product_images_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant_attribute"
DROP CONSTRAINT "product_variant_attribute_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_batches"
DROP CONSTRAINT "stock_batches_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements"
DROP CONSTRAINT "stock_movements_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements"
DROP CONSTRAINT "stock_movements_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations"
DROP CONSTRAINT "stock_reservations_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations"
DROP CONSTRAINT "stock_reservations_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "virtual_stocks"
DROP CONSTRAINT "virtual_stocks_product_variant_id_fkey";

-- DropIndex
DROP INDEX "activities_tenant_id_idx";

-- DropIndex
DROP INDEX "categories_active_idx";

-- DropIndex
DROP INDEX "categories_parent_id_idx";

-- DropIndex
DROP INDEX "category_translations_language_id_link_rewrite_key";

-- DropIndex
DROP INDEX "category_translations_language_id_slug_key";

-- DropIndex
DROP INDEX "intrastat_transactions_document_line_id_is_correction_key";

-- DropIndex
DROP INDEX "opportunities_customer_id_idx";

-- DropIndex
DROP INDEX "opportunities_source_idx";

-- DropIndex
DROP INDEX "opportunities_stage_idx";

-- DropIndex
DROP INDEX "opportunities_status_idx";

-- DropIndex
DROP INDEX "product_variants_sku_key";

-- AlterTable
ALTER TABLE "activities"
DROP CONSTRAINT "activities_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "follow_up_activity_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "activities_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "activities_id_seq";

-- AlterTable
ALTER TABLE "activity_participants"
DROP CONSTRAINT "activity_participants_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "activity_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "activity_participants_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "activity_participants_id_seq";

-- AlterTable
ALTER TABLE "categories"
DROP CONSTRAINT "categories_pkey",
ADD COLUMN "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "parent_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "categories_id_seq";

-- AlterTable
ALTER TABLE "category_translations"
DROP COLUMN "link_rewrite",
ADD COLUMN "tenant_id" TEXT NOT NULL,
ALTER COLUMN "category_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "closed_reason_translations"
DROP CONSTRAINT "closed_reason_translations_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "closed_reason_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "closed_reason_translations_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "closed_reason_translations_id_seq";

-- AlterTable
ALTER TABLE "closed_reasons"
DROP CONSTRAINT "closed_reasons_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "closed_reasons_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "closed_reasons_id_seq";

-- AlterTable
ALTER TABLE "customers"
ALTER COLUMN "default_price_list_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "parent_line_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "document_lines_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "document_lines_id_seq";

-- AlterTable
ALTER TABLE "document_payment_installments"
DROP CONSTRAINT "document_payment_installments_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "document_payment_installments_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "document_payment_installments_id_seq";

-- AlterTable
ALTER TABLE "intrastat_transactions"
DROP CONSTRAINT "intrastat_transactions_pkey",
DROP COLUMN "is_correction",
ADD COLUMN "correction_sequence" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "document_line_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "intrastat_transactions_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "intrastat_transactions_id_seq";

-- AlterTable
ALTER TABLE "opportunities"
DROP COLUMN "proposed_products",
ALTER COLUMN "closed_reason_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "price_list_items"
DROP CONSTRAINT "price_list_items_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "price_list_id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "variant_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "price_list_items_id_seq";

-- AlterTable
ALTER TABLE "price_lists"
DROP CONSTRAINT "price_lists_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "parent_list_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "price_lists_id_seq";

-- AlterTable
ALTER TABLE "product_categories"
DROP CONSTRAINT "product_categories_pkey",
ALTER COLUMN "category_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id", "category_id");

-- AlterTable
ALTER TABLE "product_images"
ALTER COLUMN "variant_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "product_variant_attribute"
DROP CONSTRAINT "product_variant_attribute_pkey",
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT,
  ADD CONSTRAINT "product_variant_attribute_pkey" PRIMARY KEY ("product_variant_id", "attribute_id");

-- AlterTable
ALTER TABLE "product_variants"
DROP CONSTRAINT "product_variants_pkey",
ADD COLUMN "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "sku"
SET
  NOT NULL,
  ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "product_variants_id_seq";

-- AlterTable
ALTER TABLE "stock_batches"
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stock_movements"
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "document_line_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "stock_reservations"
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT,
ALTER COLUMN "document_line_id"
SET
  DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "virtual_stocks"
ALTER COLUMN "product_variant_id"
SET
  DATA TYPE TEXT;

-- CreateTable
CREATE TABLE
  "opportunity_products" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name_snapshot" VARCHAR(255) NOT NULL,
    "description_snapshot" TEXT,
    "quantity" DECIMAL(15, 6) NOT NULL DEFAULT 1,
    "unit" VARCHAR(20) NOT NULL DEFAULT 'pz',
    "list_price" DECIMAL(20, 6) NOT NULL,
    "unit_price" DECIMAL(20, 6) NOT NULL,
    "price_override_reason" TEXT,
    "price_list_item_id" TEXT,
    "discount_percent" DECIMAL(5, 2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(15, 2) NOT NULL DEFAULT 0,
    "line_number" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "converted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "opportunity_products_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE INDEX "opportunity_products_opportunity_id_line_number_idx" ON "opportunity_products" ("opportunity_id", "line_number");

-- CreateIndex
CREATE INDEX "opportunity_products_tenant_id_product_variant_id_idx" ON "opportunity_products" ("tenant_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "opportunity_products_tenant_id_product_id_idx" ON "opportunity_products" ("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "opportunity_products_price_list_item_id_idx" ON "opportunity_products" ("price_list_item_id");

-- CreateIndex
CREATE INDEX "opportunity_products_converted_idx" ON "opportunity_products" ("converted");

-- CreateIndex
CREATE INDEX "activities_has_attachments " ON "activities" ("attachments")
WHERE
  ("attachments" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_unique_external_email" ON "activity_participants" ("activity_id", "external_email")
WHERE
  ("external_email" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "activity_templates_global_name" ON "activity_templates" ("name")
WHERE
  ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "categories_tenant_id_parent_id_idx" ON "categories" ("tenant_id", "parent_id");

-- CreateIndex
CREATE INDEX "categories_tenant_id_active_position_idx" ON "categories" ("tenant_id", "active", "position");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_tenant_id_language_id_slug_key" ON "category_translations" ("tenant_id", "language_id", "slug");

-- CreateIndex
CREATE INDEX "intrastat_transactions_tenant_id_idx" ON "intrastat_transactions" ("tenant_id");

-- CreateIndex
CREATE INDEX "intrastat_transactions_tenant_id_flow_idx" ON "intrastat_transactions" ("tenant_id", "flow");

-- CreateIndex
CREATE INDEX "intrastat_transactions_tenant_id_transaction_date_idx" ON "intrastat_transactions" ("tenant_id", "transaction_date");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_transactions_document_line_id_correction_sequence_key" ON "intrastat_transactions" ("document_line_id", "correction_sequence");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_customer_id_idx" ON "opportunities" ("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_status_idx" ON "opportunities" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_stage_idx" ON "opportunities" ("tenant_id", "stage");

-- CreateIndex
CREATE INDEX "opportunities_tenant_id_source_idx" ON "opportunities" ("tenant_id", "source");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_sku_key" ON "product_variants" ("tenant_id", "sku");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_follow_up_activity_id_fkey" FOREIGN KEY ("follow_up_activity_id") REFERENCES "activities" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_default_price_list_id_fkey" FOREIGN KEY ("default_price_list_id") REFERENCES "price_lists" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_parent_line_id_fkey" FOREIGN KEY ("parent_line_id") REFERENCES "document_lines" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_closed_reason_id_fkey" FOREIGN KEY ("closed_reason_id") REFERENCES "closed_reasons" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_price_list_item_id_fkey" FOREIGN KEY ("price_list_item_id") REFERENCES "price_list_items" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "closed_reason_translations" ADD CONSTRAINT "closed_reason_translations_closed_reason_id_fkey" FOREIGN KEY ("closed_reason_id") REFERENCES "closed_reasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_parent_list_id_fkey" FOREIGN KEY ("parent_list_id") REFERENCES "price_lists" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "document_lines" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE opportunities ADD CONSTRAINT chk_opportunity_has_entity CHECK (
  lead_id IS NOT NULL
  OR customer_id IS NOT NULL
);