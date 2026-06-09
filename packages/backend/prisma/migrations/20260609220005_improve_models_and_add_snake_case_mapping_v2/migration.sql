/*
  Warnings:

  - The values [ADJUSTMENT] on the enum `MovementType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `PaymentMethodTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `languageId` on the `PaymentMethodTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethodId` on the `PaymentMethodTranslation` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PaymentMethodTranslation` table. All the data in the column will be lost.
  - The `pack_stock_type` column on the `product_variants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `out_of_stock_type` column on the `product_variants` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `redirect_type` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CompanyAddress` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompanyNote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentMethod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentTermDetail` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceList` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PriceListItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserSetting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VatNature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VatNatureTranslation` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[payment_method_id,language_id]` on the table `PaymentMethodTranslation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,reference]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language_id` to the `PaymentMethodTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method_id` to the `PaymentMethodTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `PaymentMethodTranslation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `manufacturers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentTermType" AS ENUM ('ANTICIPATED', 'DAYS_FROM_INVOICE', 'END_OF_MONTH', 'FIXED_DAY');

-- CreateEnum
CREATE TYPE "PriceRoundingMethod" AS ENUM ('NONE', 'NEAREST_05', 'NEAREST_10', 'ROUND_UP', 'ROUND_DOWN');

-- CreateEnum
CREATE TYPE "PackStockType" AS ENUM ('USE_PACK_STOCK_ONLY', 'USE_PRODUCTS_STOCK_ONLY', 'USE_BOTH_STOCKS');

-- CreateEnum
CREATE TYPE "OutOfStockType" AS ENUM ('DENY_ORDERS', 'ALLOW_ORDERS', 'USE_DEFAULT');

-- CreateEnum
CREATE TYPE "ProductRedirectType" AS ENUM ('NOT_FOUND', 'MOVED', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('OWN', 'TEAM', 'ALL');

-- CreateEnum
CREATE TYPE "TaxRuleApplicability" AS ENUM ('SALES', 'PURCHASES', 'BOTH');

-- CreateEnum
CREATE TYPE "TaxRuleCustomerType" AS ENUM ('B2B', 'B2C', 'PA', 'FOREIGN', 'ANY');

-- AlterEnum
BEGIN;
CREATE TYPE "MovementType_new" AS ENUM ('PURCHASE', 'SALE', 'RETURN_IN', 'RETURN_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'INVENTORY_START');
ALTER TABLE "stock_movements" ALTER COLUMN "movement_type" TYPE "MovementType_new" USING ("movement_type"::text::"MovementType_new");
ALTER TYPE "MovementType" RENAME TO "MovementType_old";
ALTER TYPE "MovementType_new" RENAME TO "MovementType";
DROP TYPE "public"."MovementType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "CompanyAddress" DROP CONSTRAINT "CompanyAddress_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyAddress" DROP CONSTRAINT "CompanyAddress_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "CompanyContact" DROP CONSTRAINT "CompanyContact_companyId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyContact" DROP CONSTRAINT "CompanyContact_contactId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyNote" DROP CONSTRAINT "CompanyNote_authorId_fkey";

-- DropForeignKey
ALTER TABLE "CompanyNote" DROP CONSTRAINT "CompanyNote_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_customerTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_defaultPriceListId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentLine" DROP CONSTRAINT "DocumentLine_taxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentPaymentInstallment" DROP CONSTRAINT "DocumentPaymentInstallment_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentSequence" DROP CONSTRAINT "DocumentSequence_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation" DROP CONSTRAINT "PaymentMethodTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation" DROP CONSTRAINT "PaymentMethodTranslation_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTermDetail" DROP CONSTRAINT "PaymentTermDetail_paymentMethodId_fkey";

-- DropForeignKey
ALTER TABLE "PriceList" DROP CONSTRAINT "PriceList_currencyCode_fkey";

-- DropForeignKey
ALTER TABLE "PriceList" DROP CONSTRAINT "PriceList_parentListId_fkey";

-- DropForeignKey
ALTER TABLE "PriceListItem" DROP CONSTRAINT "PriceListItem_priceListId_fkey";

-- DropForeignKey
ALTER TABLE "PriceListItem" DROP CONSTRAINT "PriceListItem_taxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "PriceListItem" DROP CONSTRAINT "PriceListItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_parentRoleId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "RolePermission" DROP CONSTRAINT "RolePermission_roleId_fkey";

-- DropForeignKey
ALTER TABLE "Supplier" DROP CONSTRAINT "Supplier_supplierTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRule" DROP CONSTRAINT "TaxRule_countryCode_fkey";

-- DropForeignKey
ALTER TABLE "TaxRule" DROP CONSTRAINT "TaxRule_vatNatureId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRuleTranslation" DROP CONSTRAINT "TaxRuleTranslation_taxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_defaultLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_defaultPurchasesTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_defaultSalesTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "UserSetting" DROP CONSTRAINT "UserSetting_userId_fkey";

-- DropForeignKey
ALTER TABLE "VatNature" DROP CONSTRAINT "VatNature_replacedByCode_fkey";

-- DropForeignKey
ALTER TABLE "VatNatureTranslation" DROP CONSTRAINT "VatNatureTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "VatNatureTranslation" DROP CONSTRAINT "VatNatureTranslation_vatNatureId_fkey";

-- DropForeignKey
ALTER TABLE "_UserRoles" DROP CONSTRAINT "_UserRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "product_image_translations" DROP CONSTRAINT "product_image_translations_product_image_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_default_tax_rule_id_fkey";

-- DropIndex
DROP INDEX "PaymentMethodTranslation_languageId_idx";

-- DropIndex
DROP INDEX "PaymentMethodTranslation_paymentMethodId_languageId_key";

-- DropIndex
DROP INDEX "products_reference_key";

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PaymentMethodTranslation" DROP COLUMN "createdAt",
DROP COLUMN "languageId",
DROP COLUMN "paymentMethodId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "language_id" INTEGER NOT NULL,
ADD COLUMN     "payment_method_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "manufacturers" ADD COLUMN     "tenant_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "product_variants" DROP COLUMN "pack_stock_type",
ADD COLUMN     "pack_stock_type" "PackStockType" NOT NULL DEFAULT 'USE_PACK_STOCK_ONLY',
DROP COLUMN "out_of_stock_type",
ADD COLUMN     "out_of_stock_type" "OutOfStockType" NOT NULL DEFAULT 'DENY_ORDERS';

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tenant_id" INTEGER NOT NULL,
DROP COLUMN "redirect_type",
ADD COLUMN     "redirect_type" "ProductRedirectType" NOT NULL DEFAULT 'NOT_FOUND';

-- DropTable
DROP TABLE "CompanyAddress";

-- DropTable
DROP TABLE "CompanyContact";

-- DropTable
DROP TABLE "CompanyNote";

-- DropTable
DROP TABLE "PaymentMethod";

-- DropTable
DROP TABLE "PaymentTermDetail";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "PriceList";

-- DropTable
DROP TABLE "PriceListItem";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "RolePermission";

-- DropTable
DROP TABLE "TaxRule";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "UserSetting";

-- DropTable
DROP TABLE "VatNature";

-- DropTable
DROP TABLE "VatNatureTranslation";

-- CreateTable
CREATE TABLE "company_addresses" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "address_type" "AddressType" NOT NULL DEFAULT 'BILLING',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "address" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "province_code" CHAR(2),
    "zip_code" VARCHAR(20) NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "phone" VARCHAR(50),
    "opening_hours" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_contacts" (
    "id" SERIAL NOT NULL,
    "contact_id" INTEGER NOT NULL,
    "company_id" INTEGER NOT NULL,
    "position" VARCHAR(100),
    "department" VARCHAR(100),
    "is_primary_contact" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_notes" (
    "id" SERIAL NOT NULL,
    "company_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "author_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "tenant_id" INTEGER,
    "default_bank_account_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_term_details" (
    "id" SERIAL NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "term_type" "PaymentTermType" NOT NULL DEFAULT 'DAYS_FROM_INVOICE',
    "due_days" INTEGER NOT NULL DEFAULT 0,
    "fixed_day" INTEGER,
    "fixed_month_offset" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_term_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_lists" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "tenant_id" INTEGER,
    "type" "PriceListType" NOT NULL DEFAULT 'SALE',
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "parent_list_id" INTEGER,
    "strategy" "PriceListStrategy" NOT NULL DEFAULT 'EXPLICIT',
    "strategy_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "rounding_method" "PriceRoundingMethod" NOT NULL DEFAULT 'NONE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_list_items" (
    "id" SERIAL NOT NULL,
    "price_list_id" INTEGER NOT NULL,
    "variant_id" INTEGER NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(19,4) NOT NULL,
    "discount_percent" DECIMAL(5,2),
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "tax_rule_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" INTEGER,
    "parent_role_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "resource" VARCHAR(50) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'OWN',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vat_natures" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "category" "VatNatureCategory" NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "extended_description" TEXT,
    "legal_reference" VARCHAR(255),
    "applicable_to_entity_types" VARCHAR(10),
    "valid_for_sales" BOOLEAN NOT NULL DEFAULT true,
    "valid_for_purchases" BOOLEAN NOT NULL DEFAULT false,
    "vat_return_line" VARCHAR(10),
    "requires_norm_reference" BOOLEAN NOT NULL DEFAULT false,
    "usage_examples" TEXT,
    "operational_notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT '2021-01-01 00:00:00 +00:00',
    "valid_to" TIMESTAMP(3),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "replaced_by_code" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vat_natures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vat_nature_translations" (
    "id" SERIAL NOT NULL,
    "vat_nature_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vat_nature_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rules" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "tenant_id" INTEGER,
    "rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "vat_nature_id" INTEGER,
    "normative_reference" VARCHAR(255),
    "country_code" CHAR(2) NOT NULL DEFAULT 'IT',
    "applicable_for" "TaxRuleApplicability" NOT NULL DEFAULT 'BOTH',
    "product_category" VARCHAR(50),
    "customer_type" "TaxRuleCustomerType" NOT NULL DEFAULT 'ANY',
    "is_split_payment" BOOLEAN NOT NULL DEFAULT false,
    "deductibility_percent" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "vat_deductible" BOOLEAN NOT NULL DEFAULT true,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "color" VARCHAR(7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "company_id" INTEGER NOT NULL,
    "tax_regime" "TaxRegime" NOT NULL DEFAULT 'RF01',
    "default_sales_tax_rule_id" INTEGER,
    "default_purchases_tax_rule_id" INTEGER,
    "default_currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "default_language_id" INTEGER,
    "sdi_transmission_format" VARCHAR(10),
    "sdi_certificate_ref" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_bank_accounts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "iban" VARCHAR(34) NOT NULL,
    "bic" VARCHAR(11),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_addresses_company_id_idx" ON "company_addresses"("company_id");

-- CreateIndex
CREATE INDEX "company_addresses_company_id_address_type_idx" ON "company_addresses"("company_id", "address_type");

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_legal_address" ON "company_addresses"("company_id") WHERE (address_type = 'LEGAL');

-- CreateIndex
CREATE INDEX "company_contacts_contact_id_idx" ON "company_contacts"("contact_id");

-- CreateIndex
CREATE INDEX "company_contacts_company_id_idx" ON "company_contacts"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_contacts_company_id_contact_id_key" ON "company_contacts"("company_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_primary_contact_per_company" ON "company_contacts"("company_id") WHERE ("is_primary_contact" = true);

-- CreateIndex
CREATE INDEX "company_notes_company_id_idx" ON "company_notes"("company_id");

-- CreateIndex
CREATE INDEX "company_notes_author_id_idx" ON "company_notes"("author_id");

-- CreateIndex
CREATE INDEX "payment_methods_active_idx" ON "payment_methods"("active");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_tenant_id_code_key" ON "payment_methods"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_payment_method_code" ON "payment_methods"("code") WHERE ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "payment_term_details_payment_method_id_idx" ON "payment_term_details"("payment_method_id");

-- CreateIndex
CREATE INDEX "payment_term_details_position_idx" ON "payment_term_details"("position");

-- CreateIndex
CREATE INDEX "price_lists_active_idx" ON "price_lists"("active");

-- CreateIndex
CREATE INDEX "price_lists_valid_from_valid_to_idx" ON "price_lists"("valid_from", "valid_to");

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_tenant_id_code_key" ON "price_lists"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_price_list_code" ON "price_lists"("code") WHERE ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "price_list_items_variant_id_idx" ON "price_list_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_price_list_id_variant_id_min_quantity_key" ON "price_list_items"("price_list_id", "variant_id", "min_quantity");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_code_key" ON "roles"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_role_code" ON "roles"("code") WHERE ("tenant_id" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "unique_default_role_per_tenant" ON "roles"("tenant_id", "is_default") WHERE ("is_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_scope_key" ON "permissions"("resource", "action", "scope");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "user_settings_user_id_idx" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "user_settings_key_idx" ON "user_settings"("key");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key_key" ON "user_settings"("user_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "vat_natures_code_key" ON "vat_natures"("code");

-- CreateIndex
CREATE INDEX "vat_natures_category_idx" ON "vat_natures"("category");

-- CreateIndex
CREATE INDEX "vat_natures_active_display_order_idx" ON "vat_natures"("active", "display_order");

-- CreateIndex
CREATE INDEX "vat_natures_valid_from_valid_to_idx" ON "vat_natures"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "vat_nature_translations_language_id_idx" ON "vat_nature_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "vat_nature_translations_vat_nature_id_language_id_key" ON "vat_nature_translations"("vat_nature_id", "language_id");

-- CreateIndex
CREATE INDEX "tax_rules_rate_idx" ON "tax_rules"("rate");

-- CreateIndex
CREATE INDEX "tax_rules_vat_nature_id_idx" ON "tax_rules"("vat_nature_id");

-- CreateIndex
CREATE INDEX "tax_rules_country_code_idx" ON "tax_rules"("country_code");

-- CreateIndex
CREATE INDEX "tax_rules_active_is_default_idx" ON "tax_rules"("active", "is_default");

-- CreateIndex
CREATE INDEX "tax_rules_valid_from_valid_to_idx" ON "tax_rules"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "tax_rules_applicable_for_idx" ON "tax_rules"("applicable_for");

-- CreateIndex
CREATE INDEX "tax_rules_tenant_id_idx" ON "tax_rules"("tenant_id");

-- CreateIndex
CREATE INDEX "tax_rules_tenant_id_active_is_default_idx" ON "tax_rules"("tenant_id", "active", "is_default");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rules_tenant_id_code_key" ON "tax_rules"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_tax_rule_code" ON "tax_rules"("code") WHERE ("tenant_id" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_company_id_key" ON "tenants"("company_id");

-- CreateIndex
CREATE INDEX "tenants_status_idx" ON "tenants"("status");

-- CreateIndex
CREATE INDEX "tenants_plan_idx" ON "tenants"("plan");

-- CreateIndex
CREATE INDEX "tenant_bank_accounts_tenant_id_active_idx" ON "tenant_bank_accounts"("tenant_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_bank_accounts_tenant_id_iban_key" ON "tenant_bank_accounts"("tenant_id", "iban");

-- CreateIndex
CREATE INDEX "PaymentMethodTranslation_language_id_idx" ON "PaymentMethodTranslation"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethodTranslation_payment_method_id_language_id_key" ON "PaymentMethodTranslation"("payment_method_id", "language_id");

-- CreateIndex
CREATE INDEX "product_variants_product_id_active_idx" ON "product_variants"("product_id", "active");

-- CreateIndex
CREATE INDEX "products_tenant_id_status_idx" ON "products"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "products_tenant_id_active_idx" ON "products"("tenant_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_reference_key" ON "products"("tenant_id", "reference");

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_defaultPriceListId_fkey" FOREIGN KEY ("defaultPriceListId") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_customerTaxRuleId_fkey" FOREIGN KEY ("customerTaxRuleId") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_supplierTaxRuleId_fkey" FOREIGN KEY ("supplierTaxRuleId") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notes" ADD CONSTRAINT "company_notes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_notes" ADD CONSTRAINT "company_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentLine" ADD CONSTRAINT "DocumentLine_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentPaymentInstallment" ADD CONSTRAINT "DocumentPaymentInstallment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSequence" ADD CONSTRAINT "DocumentSequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_default_bank_account_id_fkey" FOREIGN KEY ("default_bank_account_id") REFERENCES "tenant_bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_term_details" ADD CONSTRAINT "payment_term_details_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_parent_list_id_fkey" FOREIGN KEY ("parent_list_id") REFERENCES "price_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_price_list_id_fkey" FOREIGN KEY ("price_list_id") REFERENCES "price_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_tax_rule_id_fkey" FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_default_tax_rule_id_fkey" FOREIGN KEY ("default_tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_image_translations" ADD CONSTRAINT "product_image_translations_product_image_id_fkey" FOREIGN KEY ("product_image_id") REFERENCES "product_images"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturers" ADD CONSTRAINT "manufacturers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_natures" ADD CONSTRAINT "vat_natures_replaced_by_code_fkey" FOREIGN KEY ("replaced_by_code") REFERENCES "vat_natures"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_nature_translations" ADD CONSTRAINT "vat_nature_translations_vat_nature_id_fkey" FOREIGN KEY ("vat_nature_id") REFERENCES "vat_natures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_nature_translations" ADD CONSTRAINT "vat_nature_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_vat_nature_id_fkey" FOREIGN KEY ("vat_nature_id") REFERENCES "vat_natures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_country_code_fkey" FOREIGN KEY ("country_code") REFERENCES "countries"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaxRuleTranslation" ADD CONSTRAINT "TaxRuleTranslation_taxRuleId_fkey" FOREIGN KEY ("taxRuleId") REFERENCES "tax_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_default_sales_tax_rule_id_fkey" FOREIGN KEY ("default_sales_tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_default_purchases_tax_rule_id_fkey" FOREIGN KEY ("default_purchases_tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_default_currency_code_fkey" FOREIGN KEY ("default_currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_default_language_id_fkey" FOREIGN KEY ("default_language_id") REFERENCES "languages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_bank_accounts" ADD CONSTRAINT "tenant_bank_accounts_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserRoles" ADD CONSTRAINT "_UserRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
