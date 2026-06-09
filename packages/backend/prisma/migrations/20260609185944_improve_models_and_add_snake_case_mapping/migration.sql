/*
  Warnings:

  - You are about to drop the `Attribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeGroupTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AttributeTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CategoryTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Country` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CurrencyTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRateHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntrastatCommodityCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntrastatTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IntrastatTransactionCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Language` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Manufacturer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariantAttribute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockBatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockReservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VirtualStock` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warehouse` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProductVisibility" AS ENUM ('BOTH', 'CATALOG', 'SEARCH', 'NONE');

-- CreateEnum
CREATE TYPE "StockBatchStatus" AS ENUM ('ACTIVE', 'QUARANTINE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('ACTIVE', 'FULFILLED', 'CANCELLED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "Attribute" DROP CONSTRAINT "Attribute_attributeGroupId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeGroupTranslation" DROP CONSTRAINT "AttributeGroupTranslation_attributeGroupId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeGroupTranslation" DROP CONSTRAINT "AttributeGroupTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeTranslation" DROP CONSTRAINT "AttributeTranslation_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "AttributeTranslation" DROP CONSTRAINT "AttributeTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTranslation" DROP CONSTRAINT "CategoryTranslation_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTranslation" DROP CONSTRAINT "CategoryTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "CompanyAddress" DROP CONSTRAINT "CompanyAddress_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "Country" DROP CONSTRAINT "Country_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "CurrencyTranslation" DROP CONSTRAINT "CurrencyTranslation_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "CurrencyTranslation" DROP CONSTRAINT "CurrencyTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_customerCountryCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_shippingCountryCode_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_productId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeRateHistory" DROP CONSTRAINT "ExchangeRateHistory_currencyId_fkey";

-- DropForeignKey
ALTER TABLE "IntrastatTransaction" DROP CONSTRAINT "IntrastatTransaction_commodityCode_fkey";

-- DropForeignKey
ALTER TABLE "IntrastatTransaction" DROP CONSTRAINT "IntrastatTransaction_documentId_fkey";

-- DropForeignKey
ALTER TABLE "IntrastatTransaction" DROP CONSTRAINT "IntrastatTransaction_documentLineId_fkey";

-- DropForeignKey
ALTER TABLE "IntrastatTransaction" DROP CONSTRAINT "IntrastatTransaction_transactionCode_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation" DROP CONSTRAINT "PaymentMethodTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "PriceList" DROP CONSTRAINT "PriceList_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "PriceListItem" DROP CONSTRAINT "PriceListItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_defaultTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_manufacturerId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTranslation" DROP CONSTRAINT "ProductTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTranslation" DROP CONSTRAINT "ProductTranslation_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_commodityCode_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_deletedBy_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantAttribute" DROP CONSTRAINT "ProductVariantAttribute_attributeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantAttribute" DROP CONSTRAINT "ProductVariantAttribute_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "StockBatch" DROP CONSTRAINT "StockBatch_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "StockBatch" DROP CONSTRAINT "StockBatch_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_documentLineId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "StockMovement" DROP CONSTRAINT "StockMovement_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "StockReservation" DROP CONSTRAINT "StockReservation_documentId_fkey";

-- DropForeignKey
ALTER TABLE "StockReservation" DROP CONSTRAINT "StockReservation_documentLineId_fkey";

-- DropForeignKey
ALTER TABLE "StockReservation" DROP CONSTRAINT "StockReservation_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "StockReservation" DROP CONSTRAINT "StockReservation_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRule" DROP CONSTRAINT "TaxRule_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "TaxRuleTranslation" DROP CONSTRAINT "TaxRuleTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_defaultLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_preferredLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "VatNatureTranslation" DROP CONSTRAINT "VatNatureTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "VirtualStock" DROP CONSTRAINT "VirtualStock_productVariantId_fkey";

-- DropForeignKey
ALTER TABLE "VirtualStock" DROP CONSTRAINT "VirtualStock_supplierCurrencyCode_fkey";

-- DropForeignKey
ALTER TABLE "VirtualStock" DROP CONSTRAINT "VirtualStock_warehouseId_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToLanguage" DROP CONSTRAINT "_CountryToLanguage_A_fkey";

-- DropForeignKey
ALTER TABLE "_CountryToLanguage" DROP CONSTRAINT "_CountryToLanguage_B_fkey";

-- AlterTable
ALTER TABLE "DocumentLine" ALTER COLUMN "productId" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Attribute";

-- DropTable
DROP TABLE "AttributeGroup";

-- DropTable
DROP TABLE "AttributeGroupTranslation";

-- DropTable
DROP TABLE "AttributeTranslation";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CategoryTranslation";

-- DropTable
DROP TABLE "Country";

-- DropTable
DROP TABLE "Currency";

-- DropTable
DROP TABLE "CurrencyTranslation";

-- DropTable
DROP TABLE "ExchangeRateHistory";

-- DropTable
DROP TABLE "IntrastatCommodityCode";

-- DropTable
DROP TABLE "IntrastatTransaction";

-- DropTable
DROP TABLE "IntrastatTransactionCode";

-- DropTable
DROP TABLE "Language";

-- DropTable
DROP TABLE "Manufacturer";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductCategory";

-- DropTable
DROP TABLE "ProductImage";

-- DropTable
DROP TABLE "ProductTranslation";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "ProductVariantAttribute";

-- DropTable
DROP TABLE "StockBatch";

-- DropTable
DROP TABLE "StockMovement";

-- DropTable
DROP TABLE "StockReservation";

-- DropTable
DROP TABLE "VirtualStock";

-- DropTable
DROP TABLE "Warehouse";

-- CreateTable
CREATE TABLE "attribute_groups" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "external_code" VARCHAR(100),
    "display_type" "AttributeDisplayType" NOT NULL DEFAULT 'SELECT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_group_translations" (
    "id" SERIAL NOT NULL,
    "attribute_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "display_name" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_group_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attributes" (
    "id" SERIAL NOT NULL,
    "attribute_group_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "metadata" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribute_translations" (
    "id" SERIAL NOT NULL,
    "attribute_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attribute_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_attribute" (
    "product_variant_id" INTEGER NOT NULL,
    "attribute_id" INTEGER NOT NULL,

    CONSTRAINT "product_variant_attribute_pkey" PRIMARY KEY ("product_variant_id","attribute_id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255),
    "description" TEXT,
    "link_rewrite" VARCHAR(255),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "countries" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_eu" BOOLEAN NOT NULL DEFAULT false,
    "iso3" VARCHAR(3) NOT NULL,
    "numeric_code" VARCHAR(3) NOT NULL,
    "phone_code" VARCHAR(4) NOT NULL,
    "continent" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',

    CONSTRAINT "countries_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "code" CHAR(3) NOT NULL,
    "numeric_code" CHAR(3),
    "symbol" VARCHAR(10) NOT NULL,
    "symbol_native" VARCHAR(10),
    "minor_unit" INTEGER NOT NULL DEFAULT 2,
    "rounding" DECIMAL(10,4) NOT NULL DEFAULT 0,
    "is_base_currency" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "country_code" CHAR(2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_current_rates" (
    "id" SERIAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL,
    "source" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_current_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rate_history" (
    "id" SERIAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL,
    "source" VARCHAR(50),
    "batch_key" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_rate_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_translations" (
    "id" SERIAL NOT NULL,
    "currency_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_plural" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_groups" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_filterable" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_group_translations" (
    "id" SERIAL NOT NULL,
    "feature_group_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(128) NOT NULL,

    CONSTRAINT "feature_group_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "feature_group_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feature_translations" (
    "id" SERIAL NOT NULL,
    "feature_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "value" VARCHAR(255) NOT NULL,

    CONSTRAINT "feature_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_features" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "feature_group_id" INTEGER NOT NULL,
    "feature_id" INTEGER,
    "customValue" JSONB,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intrastat_transactions" (
    "id" SERIAL NOT NULL,
    "document_id" INTEGER NOT NULL,
    "document_line_id" INTEGER NOT NULL,
    "flow" "IntrastatFlow" NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "transaction_code" CHAR(2) NOT NULL,
    "commodity_code" CHAR(8) NOT NULL,
    "partner_country_code" CHAR(2) NOT NULL,
    "invoiced_value" DECIMAL(15,2) NOT NULL,
    "statistical_value" DECIMAL(15,2) NOT NULL,
    "net_mass" DECIMAL(15,3) NOT NULL,
    "supplementary_units" INTEGER,
    "mode_of_transport" VARCHAR(2),
    "is_correction" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intrastat_transaction_codes" (
    "code" CHAR(2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_transaction_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "intrastat_transaction_code_translations" (
    "id" SERIAL NOT NULL,
    "transaction_code" CHAR(2) NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_transaction_code_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intrastat_commodity_codes" (
    "code" CHAR(8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_commodity_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "intrastat_commodity_code_translations" (
    "id" SERIAL NOT NULL,
    "commodity_code" CHAR(8) NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "intrastat_commodity_code_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "languages" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "iso_code" CHAR(2) NOT NULL,
    "language_code" CHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "type" "ProductType" NOT NULL DEFAULT 'STANDARD',
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "reference" VARCHAR(64) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "available_for_order" BOOLEAN NOT NULL DEFAULT true,
    "show_price" BOOLEAN NOT NULL DEFAULT true,
    "online_only" BOOLEAN NOT NULL DEFAULT false,
    "on_sale" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "wholesale_price" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "ecotax" DECIMAL(20,4) NOT NULL DEFAULT 0,
    "default_tax_rule_id" INTEGER,
    "visibility" "ProductVisibility" NOT NULL DEFAULT 'BOTH',
    "condition" "ProductCondition" NOT NULL DEFAULT 'NEW',
    "show_condition" BOOLEAN NOT NULL DEFAULT false,
    "manufacturer_id" INTEGER,
    "supplier_id" INTEGER,
    "additional_shipping_cost" DECIMAL(20,6) NOT NULL DEFAULT 0,
    "commodity_code" TEXT,
    "carrier_reference_ids" JSONB,
    "delivery_time_note_type" INTEGER NOT NULL DEFAULT 0,
    "redirect_type" VARCHAR(10) NOT NULL DEFAULT '404',
    "redirect_target" INTEGER,
    "cover_thumbnail_url" VARCHAR(500),
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" SERIAL NOT NULL,
    "product_id" VARCHAR(50) NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "short_description" VARCHAR(500),
    "tags" VARCHAR(500),
    "meta_title" VARCHAR(255),
    "meta_description" TEXT,
    "meta_keywords" VARCHAR(500),
    "link_rewrite" VARCHAR(255),
    "available_now_label" VARCHAR(100) NOT NULL DEFAULT 'In stock',
    "available_later_label" VARCHAR(100) NOT NULL DEFAULT 'Available soon',
    "delivery_time_in_stock_note" VARCHAR(255),
    "delivery_time_out_of_stock_note" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_code" VARCHAR(64) NOT NULL,
    "sku" VARCHAR(64),
    "ean13" CHAR(13),
    "upc" CHAR(12),
    "isbn" VARCHAR(32),
    "mpn" VARCHAR(40),
    "minimal_quantity" INTEGER NOT NULL DEFAULT 1,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 0,
    "low_stock_alert_enabled" BOOLEAN NOT NULL DEFAULT false,
    "location" VARCHAR(50),
    "pack_stock_type" INTEGER NOT NULL DEFAULT 0,
    "out_of_stock_type" INTEGER NOT NULL DEFAULT 0,
    "available_date" TIMESTAMP(3),
    "price" DECIMAL(20,6),
    "wholesale_price" DECIMAL(20,6),
    "unit_price_ratio" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "weight" DECIMAL(20,6) DEFAULT 0,
    "width" DECIMAL(20,6) DEFAULT 0,
    "height" DECIMAL(20,6) DEFAULT 0,
    "depth" DECIMAL(20,6) DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "available_for_order" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" SERIAL NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" INTEGER,
    "image_url" VARCHAR(500) NOT NULL,
    "image_type" VARCHAR(20) NOT NULL DEFAULT 'extra',
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_cover" BOOLEAN NOT NULL DEFAULT false,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mime_type" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_image_translations" (
    "id" SERIAL NOT NULL,
    "product_image_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "product_image_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "product_id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("product_id","category_id")
);

-- CreateTable
CREATE TABLE "manufacturers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "custom_fields" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manufacturers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warehouses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "type" "WarehouseType" NOT NULL DEFAULT 'PHYSICAL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "movement_type" "MovementType" NOT NULL,
    "reference_id" TEXT,
    "note" TEXT,
    "movement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unit_cost" DECIMAL(20,6),
    "total_cost" DECIMAL(20,6),
    "document_id" INTEGER,
    "document_line_id" INTEGER,
    "batch_number" VARCHAR(50),
    "serial_number" VARCHAR(50),
    "expiry_date" TIMESTAMP(3),
    "created_by_user_id" INTEGER,
    "status" "MovementStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_stocks" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "source" VARCHAR(100),
    "last_sync_at" TIMESTAMP(3),
    "sync_status" "VirtualSyncStatus" NOT NULL DEFAULT 'PENDING',
    "sync_error" TEXT,
    "expected_available_date" TIMESTAMP(3),
    "lead_time_days" INTEGER NOT NULL DEFAULT 0,
    "supplier_price" DECIMAL(20,6),
    "supplier_currency_code" CHAR(3),

    CONSTRAINT "virtual_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_batches" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "batch_number" VARCHAR(50) NOT NULL,
    "manufactured_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "supplier_id" INTEGER,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved" INTEGER NOT NULL DEFAULT 0,
    "status" "StockBatchStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "stock_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservations" (
    "id" SERIAL NOT NULL,
    "product_variant_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "document_id" INTEGER NOT NULL,
    "document_line_id" INTEGER,
    "status" "StockReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "reserved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "fulfilled_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "batch_number" VARCHAR(50),

    CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attribute_groups_code_key" ON "attribute_groups"("code");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_groups_external_code_key" ON "attribute_groups"("external_code");

-- CreateIndex
CREATE INDEX "attribute_groups_position_idx" ON "attribute_groups"("position");

-- CreateIndex
CREATE INDEX "attribute_group_translations_language_id_idx" ON "attribute_group_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_group_translations_attribute_group_id_language_id_key" ON "attribute_group_translations"("attribute_group_id", "language_id");

-- CreateIndex
CREATE INDEX "attributes_attribute_group_id_idx" ON "attributes"("attribute_group_id");

-- CreateIndex
CREATE INDEX "attributes_position_idx" ON "attributes"("position");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_attribute_group_id_code_key" ON "attributes"("attribute_group_id", "code");

-- CreateIndex
CREATE INDEX "attribute_translations_language_id_idx" ON "attribute_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_translations_attribute_id_language_id_key" ON "attribute_translations"("attribute_id", "language_id");

-- CreateIndex
CREATE INDEX "product_variant_attribute_attribute_id_idx" ON "product_variant_attribute"("attribute_id");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_active_idx" ON "categories"("active");

-- CreateIndex
CREATE INDEX "categories_parent_id_active_position_idx" ON "categories"("parent_id", "active", "position");

-- CreateIndex
CREATE INDEX "category_translations_language_id_idx" ON "category_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_language_id_key" ON "category_translations"("category_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_language_id_slug_key" ON "category_translations"("language_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_language_id_link_rewrite_key" ON "category_translations"("language_id", "link_rewrite");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_numeric_code_key" ON "currencies"("numeric_code");

-- CreateIndex
CREATE INDEX "currencies_active_idx" ON "currencies"("active");

-- CreateIndex
CREATE INDEX "currencies_is_base_currency_idx" ON "currencies"("is_base_currency");

-- CreateIndex
CREATE INDEX "currencies_priority_idx" ON "currencies"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "currency_current_rates_currency_id_key" ON "currency_current_rates"("currency_id");

-- CreateIndex
CREATE INDEX "currency_current_rates_effective_at_idx" ON "currency_current_rates"("effective_at");

-- CreateIndex
CREATE INDEX "exchange_rate_history_currency_id_effective_at_idx" ON "exchange_rate_history"("currency_id", "effective_at");

-- CreateIndex
CREATE INDEX "exchange_rate_history_effective_at_idx" ON "exchange_rate_history"("effective_at");

-- CreateIndex
CREATE INDEX "exchange_rate_history_source_idx" ON "exchange_rate_history"("source");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rate_history_currency_id_effective_at_key" ON "exchange_rate_history"("currency_id", "effective_at");

-- CreateIndex
CREATE INDEX "currency_translations_language_id_idx" ON "currency_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "currency_translations_currency_id_language_id_key" ON "currency_translations"("currency_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_groups_code_key" ON "feature_groups"("code");

-- CreateIndex
CREATE INDEX "feature_groups_position_idx" ON "feature_groups"("position");

-- CreateIndex
CREATE UNIQUE INDEX "feature_group_translations_feature_group_id_language_id_key" ON "feature_group_translations"("feature_group_id", "language_id");

-- CreateIndex
CREATE INDEX "features_feature_group_id_idx" ON "features"("feature_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_feature_group_id_code_key" ON "features"("feature_group_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "feature_translations_feature_id_language_id_key" ON "feature_translations"("feature_id", "language_id");

-- CreateIndex
CREATE INDEX "product_features_product_id_idx" ON "product_features"("product_id");

-- CreateIndex
CREATE INDEX "product_features_feature_group_id_idx" ON "product_features"("feature_group_id");

-- CreateIndex
CREATE INDEX "product_features_feature_id_idx" ON "product_features"("feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_features_product_id_feature_group_id_key" ON "product_features"("product_id", "feature_group_id");

-- CreateIndex
CREATE INDEX "intrastat_transactions_transaction_date_idx" ON "intrastat_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "intrastat_transactions_partner_country_code_idx" ON "intrastat_transactions"("partner_country_code");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_transactions_document_line_id_key" ON "intrastat_transactions"("document_line_id");

-- CreateIndex
CREATE INDEX "intrastat_transaction_code_translations_language_id_idx" ON "intrastat_transaction_code_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_transaction_code_translations_transaction_code_la_key" ON "intrastat_transaction_code_translations"("transaction_code", "language_id");

-- CreateIndex
CREATE INDEX "intrastat_commodity_code_translations_language_id_idx" ON "intrastat_commodity_code_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "intrastat_commodity_code_translations_commodity_code_langua_key" ON "intrastat_commodity_code_translations"("commodity_code", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "languages_name_key" ON "languages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "languages_iso_code_key" ON "languages"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "languages_language_code_key" ON "languages"("language_code");

-- CreateIndex
CREATE INDEX "languages_iso_code_idx" ON "languages"("iso_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_reference_key" ON "products"("reference");

-- CreateIndex
CREATE INDEX "products_reference_idx" ON "products"("reference");

-- CreateIndex
CREATE INDEX "products_active_idx" ON "products"("active");

-- CreateIndex
CREATE INDEX "products_supplier_id_idx" ON "products"("supplier_id");

-- CreateIndex
CREATE INDEX "products_deleted_at_idx" ON "products"("deleted_at");

-- CreateIndex
CREATE INDEX "products_manufacturer_id_idx" ON "products"("manufacturer_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_link_rewrite_key" ON "product_translations"("link_rewrite");

-- CreateIndex
CREATE INDEX "product_translations_product_id_idx" ON "product_translations"("product_id");

-- CreateIndex
CREATE INDEX "product_translations_language_id_idx" ON "product_translations"("language_id");

-- CreateIndex
CREATE INDEX "product_translations_link_rewrite_idx" ON "product_translations"("link_rewrite");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_product_id_language_id_key" ON "product_translations"("product_id", "language_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_variant_code_key" ON "product_variants"("variant_code");

-- CreateIndex
CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");

-- CreateIndex
CREATE INDEX "product_variants_variant_code_idx" ON "product_variants"("variant_code");

-- CreateIndex
CREATE INDEX "product_variants_is_default_idx" ON "product_variants"("is_default");

-- CreateIndex
CREATE INDEX "product_variants_deleted_at_idx" ON "product_variants"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_ean13_key" ON "product_variants"("ean13");

-- CreateIndex
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");

-- CreateIndex
CREATE INDEX "product_images_variant_id_idx" ON "product_images"("variant_id");

-- CreateIndex
CREATE INDEX "product_images_image_type_idx" ON "product_images"("image_type");

-- CreateIndex
CREATE INDEX "product_images_position_idx" ON "product_images"("position");

-- CreateIndex
CREATE INDEX "product_image_translations_product_image_id_idx" ON "product_image_translations"("product_image_id");

-- CreateIndex
CREATE INDEX "product_image_translations_language_id_idx" ON "product_image_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_image_translations_product_image_id_language_id_key" ON "product_image_translations"("product_image_id", "language_id");

-- CreateIndex
CREATE INDEX "product_categories_product_id_position_idx" ON "product_categories"("product_id", "position");

-- CreateIndex
CREATE INDEX "product_categories_category_id_idx" ON "product_categories"("category_id");

-- CreateIndex
CREATE INDEX "warehouses_type_idx" ON "warehouses"("type");

-- CreateIndex
CREATE INDEX "stock_movements_product_variant_id_idx" ON "stock_movements"("product_variant_id");

-- CreateIndex
CREATE INDEX "stock_movements_warehouse_id_idx" ON "stock_movements"("warehouse_id");

-- CreateIndex
CREATE INDEX "stock_movements_movement_date_idx" ON "stock_movements"("movement_date");

-- CreateIndex
CREATE INDEX "stock_movements_document_id_idx" ON "stock_movements"("document_id");

-- CreateIndex
CREATE INDEX "stock_movements_document_line_id_idx" ON "stock_movements"("document_line_id");

-- CreateIndex
CREATE INDEX "stock_movements_batch_number_idx" ON "stock_movements"("batch_number");

-- CreateIndex
CREATE INDEX "stock_movements_serial_number_idx" ON "stock_movements"("serial_number");

-- CreateIndex
CREATE INDEX "stock_movements_status_idx" ON "stock_movements"("status");

-- CreateIndex
CREATE INDEX "stock_movements_warehouse_id_product_variant_id_movement_da_idx" ON "stock_movements"("warehouse_id", "product_variant_id", "movement_date");

-- CreateIndex
CREATE INDEX "virtual_stocks_product_variant_id_idx" ON "virtual_stocks"("product_variant_id");

-- CreateIndex
CREATE INDEX "virtual_stocks_warehouse_id_idx" ON "virtual_stocks"("warehouse_id");

-- CreateIndex
CREATE INDEX "virtual_stocks_supplier_currency_code_idx" ON "virtual_stocks"("supplier_currency_code");

-- CreateIndex
CREATE INDEX "virtual_stocks_sync_status_last_sync_at_idx" ON "virtual_stocks"("sync_status", "last_sync_at");

-- CreateIndex
CREATE INDEX "virtual_stocks_warehouse_id_sync_status_idx" ON "virtual_stocks"("warehouse_id", "sync_status");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_stocks_product_variant_id_warehouse_id_key" ON "virtual_stocks"("product_variant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "stock_batches_expiry_date_idx" ON "stock_batches"("expiry_date");

-- CreateIndex
CREATE INDEX "stock_batches_warehouse_id_product_variant_id_idx" ON "stock_batches"("warehouse_id", "product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_batches_product_variant_id_warehouse_id_batch_number_key" ON "stock_batches"("product_variant_id", "warehouse_id", "batch_number");

-- CreateIndex
CREATE INDEX "stock_reservations_product_variant_id_warehouse_id_status_idx" ON "stock_reservations"("product_variant_id", "warehouse_id", "status");

-- CreateIndex
CREATE INDEX "stock_reservations_document_id_idx" ON "stock_reservations"("document_id");

-- CreateIndex
CREATE INDEX "stock_reservations_document_line_id_idx" ON "stock_reservations"("document_line_id");

-- CreateIndex
CREATE INDEX "stock_reservations_expires_at_idx" ON "stock_reservations"("expires_at");

-- CreateIndex
CREATE INDEX "stock_reservations_warehouse_id_status_expires_at_idx" ON "stock_reservations"("warehouse_id", "status", "expires_at");

-- AddForeignKey
ALTER TABLE "attribute_group_translations" ADD CONSTRAINT "attribute_group_translations_attribute_group_id_fkey" FOREIGN KEY ("attribute_group_id") REFERENCES "attribute_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_group_translations" ADD CONSTRAINT "attribute_group_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_attribute_group_id_fkey" FOREIGN KEY ("attribute_group_id") REFERENCES "attribute_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_translations" ADD CONSTRAINT "attribute_translations_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_translations" ADD CONSTRAINT "attribute_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute" ADD CONSTRAINT "product_variant_attribute_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyAddress" ADD CONSTRAINT "CompanyAddress_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_current_rates" ADD CONSTRAINT "currency_current_rates_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rate_history" ADD CONSTRAINT "exchange_rate_history_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_translations" ADD CONSTRAINT "currency_translations_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_translations" ADD CONSTRAINT "currency_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_customerCountryCode_fkey" FOREIGN KEY ("customerCountryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_shippingCountryCode_fkey" FOREIGN KEY ("shippingCountryCode") REFERENCES "countries"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_translations" ADD CONSTRAINT "feature_group_translations_feature_group_id_fkey" FOREIGN KEY ("feature_group_id") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_translations" ADD CONSTRAINT "feature_group_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_feature_group_id_fkey" FOREIGN KEY ("feature_group_id") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_translations" ADD CONSTRAINT "feature_translations_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_translations" ADD CONSTRAINT "feature_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_feature_group_id_fkey" FOREIGN KEY ("feature_group_id") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "DocumentLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_transaction_code_fkey" FOREIGN KEY ("transaction_code") REFERENCES "intrastat_transaction_codes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_commodity_code_fkey" FOREIGN KEY ("commodity_code") REFERENCES "intrastat_commodity_codes"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transaction_code_translations" ADD CONSTRAINT "intrastat_transaction_code_translations_transaction_code_fkey" FOREIGN KEY ("transaction_code") REFERENCES "intrastat_transaction_codes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transaction_code_translations" ADD CONSTRAINT "intrastat_transaction_code_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_commodity_code_translations" ADD CONSTRAINT "intrastat_commodity_code_translations_commodity_code_fkey" FOREIGN KEY ("commodity_code") REFERENCES "intrastat_commodity_codes"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_commodity_code_translations" ADD CONSTRAINT "intrastat_commodity_code_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceList" ADD CONSTRAINT "PriceList_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceListItem" ADD CONSTRAINT "PriceListItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_default_tax_rule_id_fkey" FOREIGN KEY ("default_tax_rule_id") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_commodity_code_fkey" FOREIGN KEY ("commodity_code") REFERENCES "intrastat_commodity_codes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image_translations" ADD CONSTRAINT "product_image_translations_product_image_id_fkey" FOREIGN KEY ("product_image_id") REFERENCES "product_images"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image_translations" ADD CONSTRAINT "product_image_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VatNatureTranslation" ADD CONSTRAINT "VatNatureTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRule" ADD CONSTRAINT "TaxRule_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleTranslation" ADD CONSTRAINT "TaxRuleTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultLanguageId_fkey" FOREIGN KEY ("defaultLanguageId") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "DocumentLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_supplier_currency_code_fkey" FOREIGN KEY ("supplier_currency_code") REFERENCES "currencies"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_document_line_id_fkey" FOREIGN KEY ("document_line_id") REFERENCES "DocumentLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToLanguage" ADD CONSTRAINT "_CountryToLanguage_B_fkey" FOREIGN KEY ("B") REFERENCES "languages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
