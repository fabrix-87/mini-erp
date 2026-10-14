/*
Warnings:

- You are about to drop the column `active` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `additional_shipping_cost` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `on_sale` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `online_only` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `redirect_target_id` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `redirect_type` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `show_condition` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `show_price` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `visibility` on the `products` table. All the data in the column will be lost.
- You are about to drop the column `wholesale_price` on the `products` table. All the data in the column will be lost.
- A unique constraint covering the columns `[tenant_id,company_id,currency_code]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
- Added the required column `base_uom_id` to the `products` table without a default value. This is not possible if the table is not empty.

 */
-- CreateEnum
CREATE TYPE "SalesChannelType" AS ENUM ('WEBSHOP', 'MARKETPLACE', 'B2B_PORTAL', 'POS');

-- CreateEnum
CREATE TYPE "DeliveryNoteDisplay" AS ENUM ('NONE', 'IN_STOCK', 'OUT_OF_STOCK', 'BOTH');

-- CreateEnum
CREATE TYPE "UomCategory" AS ENUM (
    'UNIT',
    'PACKAGING',
    'WEIGHT',
    'LENGTH',
    'AREA',
    'VOLUME',
    'TIME'
);

-- DropForeignKey
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_tenant_id_product_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_tenant_id_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "products"
DROP CONSTRAINT "products_tenant_id_redirect_target_id_fkey";

-- DropIndex
DROP INDEX "document_lines_tenant_id_product_variant_id_idx";

-- DropIndex
DROP INDEX "products_tenant_id_active_idx";

-- DropIndex
DROP INDEX "products_tenant_id_redirect_target_id_idx";

-- AlterTable
ALTER TABLE "document_lines"
ADD COLUMN "uom_factor" DECIMAL(20, 10) NOT NULL DEFAULT 1,
ADD COLUMN "uom_id" TEXT;

-- AlterTable
ALTER TABLE "products"
DROP COLUMN "active",
DROP COLUMN "additional_shipping_cost",
DROP COLUMN "on_sale",
DROP COLUMN "online_only",
DROP COLUMN "price",
DROP COLUMN "redirect_target_id",
DROP COLUMN "redirect_type",
DROP COLUMN "show_condition",
DROP COLUMN "show_price",
DROP COLUMN "visibility",
DROP COLUMN "wholesale_price",
ADD COLUMN "base_uom_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE
    "sales_channels" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "code" VARCHAR(30) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "type" "SalesChannelType" NOT NULL DEFAULT 'WEBSHOP',
        "active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sales_channels_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "product_channel_settings" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "channel_id" TEXT NOT NULL,
        "is_published" BOOLEAN NOT NULL DEFAULT false,
        "published_at" TIMESTAMP(3),
        "visibility" "ProductVisibility" NOT NULL DEFAULT 'BOTH',
        "show_price" BOOLEAN NOT NULL DEFAULT true,
        "on_sale" BOOLEAN NOT NULL DEFAULT false,
        "is_exclusive" BOOLEAN NOT NULL DEFAULT false,
        "show_condition" BOOLEAN NOT NULL DEFAULT false,
        "additional_shipping_cost" DECIMAL(20, 6) NOT NULL DEFAULT 0,
        "delivery_note_display" "DeliveryNoteDisplay" NOT NULL DEFAULT 'NONE',
        "redirect_type" "ProductRedirectType" NOT NULL DEFAULT 'NOT_FOUND',
        "redirect_target_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "product_channel_settings_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "product_channel_translations" (
        "tenant_id" TEXT NOT NULL,
        "channel_id" TEXT NOT NULL,
        "settings_id" TEXT NOT NULL,
        "language_id" INTEGER NOT NULL,
        "slug" VARCHAR(255),
        "tags" VARCHAR(500),
        "meta_title" VARCHAR(255),
        "meta_description" TEXT,
        "meta_keywords" VARCHAR(500),
        "available_now_label" VARCHAR(100),
        "available_later_label" VARCHAR(100),
        "delivery_time_in_stock_note" VARCHAR(255),
        "delivery_time_out_of_stock_note" VARCHAR(255),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "product_channel_translations_pkey" PRIMARY KEY ("settings_id", "language_id")
    );

-- CreateTable
CREATE TABLE
    "product_pack_items" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "pack_variant_id" TEXT NOT NULL,
        "component_variant_id" TEXT NOT NULL,
        "quantity" DECIMAL(15, 6) NOT NULL DEFAULT 1,
        "position" INTEGER NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "product_pack_items_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "product_suppliers" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "variant_id" TEXT NOT NULL,
        "supplier_id" TEXT NOT NULL,
        "supplier_sku" VARCHAR(64),
        "purchase_price" DECIMAL(20, 6) NOT NULL,
        "currency_id" INTEGER NOT NULL,
        "min_order_qty" DECIMAL(20, 6),
        "lead_time_days" INTEGER,
        "is_preferred" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "product_suppliers_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "units_of_measure" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "code" VARCHAR(10) NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "unece_code" VARCHAR(3),
        "category" "UomCategory" NOT NULL,
        "is_base" BOOLEAN NOT NULL DEFAULT false,
        "factor" DECIMAL(20, 10) NOT NULL DEFAULT 1,
        "decimals" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "units_of_measure_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "product_uoms" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "uom_id" TEXT NOT NULL,
        "factor" DECIMAL(20, 10) NOT NULL,
        "is_sales_default" BOOLEAN NOT NULL DEFAULT false,
        "is_purchase_default" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "product_uoms_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE UNIQUE INDEX "sales_channels_tenant_id_id_key" ON "sales_channels" ("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "sales_channels_tenant_id_code_key" ON "sales_channels" ("tenant_id", "code");

-- CreateIndex
CREATE INDEX "product_channel_settings_tenant_id_channel_id_is_published_idx" ON "product_channel_settings" ("tenant_id", "channel_id", "is_published");

-- CreateIndex
CREATE INDEX "product_channel_settings_tenant_id_redirect_target_id_idx" ON "product_channel_settings" ("tenant_id", "redirect_target_id")
WHERE
    ("redirect_target_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "product_channel_settings_tenant_id_id_channel_id_key" ON "product_channel_settings" ("tenant_id", "id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_channel_settings_tenant_id_product_id_channel_id_key" ON "product_channel_settings" ("tenant_id", "product_id", "channel_id");

-- CreateIndex
CREATE INDEX "product_channel_translations_language_id_idx" ON "product_channel_translations" ("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_channel_translations_tenant_id_channel_id_language__key" ON "product_channel_translations" ("tenant_id", "channel_id", "language_id", "slug")
WHERE
    ("slug" IS NOT NULL);

-- CreateIndex
CREATE INDEX "product_pack_items_tenant_id_component_variant_id_idx" ON "product_pack_items" ("tenant_id", "component_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_pack_items_tenant_id_pack_variant_id_component_vari_key" ON "product_pack_items" (
    "tenant_id",
    "pack_variant_id",
    "component_variant_id"
);

-- CreateIndex
CREATE UNIQUE INDEX "product_suppliers_tenant_id_variant_id_supplier_id_key" ON "product_suppliers" ("tenant_id", "variant_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_one_preferred_supplier" ON "product_suppliers" ("tenant_id", "variant_id")
WHERE
    ("is_preferred" = true);

-- CreateIndex
CREATE INDEX "units_of_measure_tenant_id_category_idx" ON "units_of_measure" ("tenant_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_tenant_id_id_key" ON "units_of_measure" ("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "units_of_measure_tenant_id_code_key" ON "units_of_measure" ("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_uom_one_base_per_category" ON "units_of_measure" ("tenant_id", "category")
WHERE
    ("is_base" = true);

-- CreateIndex
CREATE INDEX "product_uoms_tenant_id_uom_id_idx" ON "product_uoms" ("tenant_id", "uom_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_uoms_tenant_id_product_id_uom_id_key" ON "product_uoms" ("tenant_id", "product_id", "uom_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_product_uom_one_sales_default" ON "product_uoms" ("tenant_id", "product_id")
WHERE
    ("is_sales_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "uq_product_uom_one_purchase_default" ON "product_uoms" ("tenant_id", "product_id")
WHERE
    ("is_purchase_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_default_bank_account" ON "bank_accounts" ("tenant_id", "company_id", "currency_code")
WHERE
    ("is_default" = true);

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_uom_id_idx" ON "document_lines" ("tenant_id", "uom_id")
WHERE
    ("uom_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "products_tenant_id_base_uom_id_idx" ON "products" ("tenant_id", "base_uom_id");

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_product_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_id", "product_variant_id") REFERENCES "product_variants" ("tenant_id", "product_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_uom_id_fkey" FOREIGN KEY ("tenant_id", "uom_id") REFERENCES "units_of_measure" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_channels" ADD CONSTRAINT "sales_channels_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_channel_settings" ADD CONSTRAINT "product_channel_settings_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_channel_settings" ADD CONSTRAINT "product_channel_settings_tenant_id_channel_id_fkey" FOREIGN KEY ("tenant_id", "channel_id") REFERENCES "sales_channels" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_channel_settings" ADD CONSTRAINT "product_channel_settings_tenant_id_redirect_target_id_fkey" FOREIGN KEY ("tenant_id", "redirect_target_id") REFERENCES "products" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_channel_translations" ADD CONSTRAINT "product_channel_translations_tenant_id_settings_id_channel_fkey" FOREIGN KEY ("tenant_id", "settings_id", "channel_id") REFERENCES "product_channel_settings" ("tenant_id", "id", "channel_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_channel_translations" ADD CONSTRAINT "product_channel_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_base_uom_id_fkey" FOREIGN KEY ("tenant_id", "base_uom_id") REFERENCES "units_of_measure" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pack_items" ADD CONSTRAINT "product_pack_items_tenant_id_pack_variant_id_fkey" FOREIGN KEY ("tenant_id", "pack_variant_id") REFERENCES "product_variants" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pack_items" ADD CONSTRAINT "product_pack_items_tenant_id_component_variant_id_fkey" FOREIGN KEY ("tenant_id", "component_variant_id") REFERENCES "product_variants" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units_of_measure" ADD CONSTRAINT "units_of_measure_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_uoms" ADD CONSTRAINT "product_uoms_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_uoms" ADD CONSTRAINT "product_uoms_tenant_id_uom_id_fkey" FOREIGN KEY ("tenant_id", "uom_id") REFERENCES "units_of_measure" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE product_pack_items ADD CONSTRAINT chk_pack_item_quantity_positive CHECK (quantity > 0),
ADD CONSTRAINT chk_pack_item_not_self CHECK (pack_variant_id <> component_variant_id);

ALTER TABLE document_lines ADD CONSTRAINT chk_document_line_product_variant_pair CHECK (
    (product_id IS NULL) = (product_variant_id IS NULL)
);