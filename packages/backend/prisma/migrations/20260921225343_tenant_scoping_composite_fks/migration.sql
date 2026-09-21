/*
  Warnings:

  - You are about to drop the column `supplierId` on the `activities` table. All the data in the column will be lost.
  - The primary key for the `attribute_group_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `attribute_group_translations` table. All the data in the column will be lost.
  - The primary key for the `attribute_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `attribute_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `attribute_translations` table. All the data in the column will be lost.
  - The primary key for the `attributes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `category_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `category_translations` table. All the data in the column will be lost.
  - The primary key for the `chart_of_account_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `chart_of_account_translations` table. All the data in the column will be lost.
  - The primary key for the `closed_reason_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `closed_reason_translations` table. All the data in the column will be lost.
  - The primary key for the `cost_center_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `cost_center_translations` table. All the data in the column will be lost.
  - The primary key for the `currency_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `currency_translations` table. All the data in the column will be lost.
  - The primary key for the `feature_group_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `feature_group_translations` table. All the data in the column will be lost.
  - The primary key for the `feature_groups` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `feature_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `feature_translations` table. All the data in the column will be lost.
  - The primary key for the `features` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `intrastat_commodity_code_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `intrastat_commodity_code_translations` table. All the data in the column will be lost.
  - The primary key for the `intrastat_transaction_code_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `intrastat_transaction_code_translations` table. All the data in the column will be lost.
  - The primary key for the `intrastat_transport_mode_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `intrastat_transport_mode_translations` table. All the data in the column will be lost.
  - The primary key for the `product_features` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `product_features` table. All the data in the column will be lost.
  - The primary key for the `product_image_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `product_image_translations` table. All the data in the column will be lost.
  - The primary key for the `product_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `product_translations` table. All the data in the column will be lost.
  - You are about to alter the column `commodity_code` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Char(8)`.
  - The primary key for the `stock_batches` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `stock_reservations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tax_rule_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `tax_rule_translations` table. All the data in the column will be lost.
  - The primary key for the `vat_nature_translations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `vat_nature_translations` table. All the data in the column will be lost.
  - The primary key for the `virtual_stocks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `warehouses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `PaymentMethodTranslation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_variant_attribute` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenant_id,fiscal_year_id,id]` on the table `accounting_periods` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `activities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,activity_id,user_id]` on the table `activity_participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,activity_id,contact_id]` on the table `activity_participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,activity_id,external_email]` on the table `activity_participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `attribute_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,code]` on the table `attribute_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,external_code]` on the table `attribute_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,attribute_group_id,code]` on the table `attributes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,attribute_group_id,id]` on the table `attributes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,iban]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,currency_code]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `company_versions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `cost_centers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[is_base_currency]` on the table `currencies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `document_lines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,document_id,id]` on the table `document_lines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,document_id,line_number]` on the table `document_lines` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `document_payment_installments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `feature_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,code]` on the table `feature_groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,feature_group_id,id]` on the table `features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,feature_group_id,code]` on the table `features` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `fiscal_years` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `journal_entries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,reversed_by_entry_id]` on the table `journal_entries` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,converted_to_id]` on the table `leads` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `manufacturers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `opportunities` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `payment_batches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payment_method_id,position]` on the table `payment_term_details` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `price_lists` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,language_id,link_rewrite]` on the table `product_translations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,ean13]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[is_default]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,document_id]` on the table `sdi_transmissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,file_name]` on the table `sdi_transmissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sdi_identifier]` on the table `sdi_transmissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_variant_id,warehouse_id,batch_number]` on the table `stock_batches` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `suppliers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `user_tenant_memberships` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,product_variant_id,warehouse_id]` on the table `virtual_stocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,code]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id]` on the table `warehouses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `withholding_tax_settlements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_id` to the `activity_participants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `attribute_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `attributes` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenant_id` on table `bank_accounts` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updated_at` to the `feature_group_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `feature_groups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `feature_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `price_list_items` table without a default value. This is not possible if the table is not empty.
  - Made the column `tenant_id` on table `price_lists` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `tenant_id` to the `product_categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `product_translations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `stock_batches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `stock_batches` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `stock_reservations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `user_tenant_membership_roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `virtual_stocks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation" DROP CONSTRAINT "PaymentMethodTranslation_language_id_fkey";

-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation" DROP CONSTRAINT "PaymentMethodTranslation_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "accounting_periods" DROP CONSTRAINT "accounting_periods_fiscal_year_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_follow_up_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "activity_participants" DROP CONSTRAINT "activity_participants_activity_id_fkey";

-- DropForeignKey
ALTER TABLE "activity_participants" DROP CONSTRAINT "activity_participants_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "attribute_group_translations" DROP CONSTRAINT "attribute_group_translations_attribute_group_id_fkey";

-- DropForeignKey
ALTER TABLE "attribute_translations" DROP CONSTRAINT "attribute_translations_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "attributes" DROP CONSTRAINT "attributes_attribute_group_id_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_company_id_fkey";

-- DropForeignKey
ALTER TABLE "bank_accounts" DROP CONSTRAINT "bank_accounts_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "category_translations" DROP CONSTRAINT "category_translations_category_id_fkey";

-- DropForeignKey
ALTER TABLE "company_versions" DROP CONSTRAINT "company_versions_company_id_fkey";

-- DropForeignKey
ALTER TABLE "company_versions" DROP CONSTRAINT "company_versions_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "cost_centers" DROP CONSTRAINT "cost_centers_parent_cost_center_id_fkey";

-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_company_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines" DROP CONSTRAINT "document_lines_document_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines" DROP CONSTRAINT "document_lines_parent_line_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines" DROP CONSTRAINT "document_lines_product_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines" DROP CONSTRAINT "document_lines_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "document_lines" DROP CONSTRAINT "document_lines_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "document_payment_installments" DROP CONSTRAINT "document_payment_installments_document_id_fkey";

-- DropForeignKey
ALTER TABLE "document_payment_installments" DROP CONSTRAINT "document_payment_installments_payment_batch_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_company_version_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "feature_group_translations" DROP CONSTRAINT "feature_group_translations_feature_group_id_fkey";

-- DropForeignKey
ALTER TABLE "feature_group_translations" DROP CONSTRAINT "feature_group_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "feature_translations" DROP CONSTRAINT "feature_translations_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "feature_translations" DROP CONSTRAINT "feature_translations_language_id_fkey";

-- DropForeignKey
ALTER TABLE "features" DROP CONSTRAINT "features_feature_group_id_fkey";

-- DropForeignKey
ALTER TABLE "intrastat_transactions" DROP CONSTRAINT "intrastat_transactions_document_id_fkey";

-- DropForeignKey
ALTER TABLE "intrastat_transactions" DROP CONSTRAINT "intrastat_transactions_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_document_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_fiscal_year_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_installment_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_period_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_reversed_by_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entries" DROP CONSTRAINT "journal_entries_withholding_settlement_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entry_lines" DROP CONSTRAINT "journal_entry_lines_cost_center_id_fkey";

-- DropForeignKey
ALTER TABLE "journal_entry_lines" DROP CONSTRAINT "journal_entry_lines_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_converted_to_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunities" DROP CONSTRAINT "opportunities_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunities" DROP CONSTRAINT "opportunities_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products" DROP CONSTRAINT "opportunity_products_opportunity_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products" DROP CONSTRAINT "opportunity_products_product_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products" DROP CONSTRAINT "opportunity_products_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_batches" DROP CONSTRAINT "payment_batches_tenant_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_default_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "price_list_items" DROP CONSTRAINT "price_list_items_price_list_id_fkey";

-- DropForeignKey
ALTER TABLE "price_list_items" DROP CONSTRAINT "price_list_items_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "price_lists" DROP CONSTRAINT "price_lists_parent_list_id_fkey";

-- DropForeignKey
ALTER TABLE "price_lists" DROP CONSTRAINT "price_lists_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_categories" DROP CONSTRAINT "product_categories_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_features" DROP CONSTRAINT "product_features_feature_group_id_fkey";

-- DropForeignKey
ALTER TABLE "product_features" DROP CONSTRAINT "product_features_feature_id_fkey";

-- DropForeignKey
ALTER TABLE "product_features" DROP CONSTRAINT "product_features_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_translations" DROP CONSTRAINT "product_translations_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant_attribute" DROP CONSTRAINT "product_variant_attribute_attribute_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variant_attribute" DROP CONSTRAINT "product_variant_attribute_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_commodity_code_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_manufacturer_id_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_parent_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "sdi_transmissions" DROP CONSTRAINT "sdi_transmissions_document_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_batches" DROP CONSTRAINT "stock_batches_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_batches" DROP CONSTRAINT "stock_batches_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_batches" DROP CONSTRAINT "stock_batches_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_document_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_document_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_warehouse_id_fkey";

-- DropForeignKey
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_company_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tenant_membership_roles" DROP CONSTRAINT "user_tenant_membership_roles_membership_id_fkey";

-- DropForeignKey
ALTER TABLE "virtual_stocks" DROP CONSTRAINT "virtual_stocks_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "virtual_stocks" DROP CONSTRAINT "virtual_stocks_warehouse_id_fkey";

-- DropIndex
DROP INDEX "accounting_periods_fiscal_year_id_period_number_key";

-- DropIndex
DROP INDEX "activities_follow_up_activity_id_idx";

-- DropIndex
DROP INDEX "activities_scheduled_start_scheduled_end_idx";

-- DropIndex
DROP INDEX "activities_tenant_id_scheduled_start_idx";

-- DropIndex
DROP INDEX "activities_tenant_id_supplierId_idx";

-- DropIndex
DROP INDEX "activity_participants_activity_id_contact_id_key";

-- DropIndex
DROP INDEX "activity_participants_activity_id_idx";

-- DropIndex
DROP INDEX "activity_participants_activity_id_user_id_key";

-- DropIndex
DROP INDEX "activity_participants_contact_id_idx";

-- DropIndex
DROP INDEX "activity_participants_unique_external_email";

-- DropIndex
DROP INDEX "activity_participants_user_id_idx";

-- DropIndex
DROP INDEX "attribute_group_translations_attribute_group_id_language_id_key";

-- DropIndex
DROP INDEX "attribute_groups_code_key";

-- DropIndex
DROP INDEX "attribute_groups_external_code_key";

-- DropIndex
DROP INDEX "attribute_groups_position_idx";

-- DropIndex
DROP INDEX "attribute_translations_attribute_id_language_id_key";

-- DropIndex
DROP INDEX "attributes_attribute_group_id_code_key";

-- DropIndex
DROP INDEX "attributes_attribute_group_id_idx";

-- DropIndex
DROP INDEX "attributes_position_idx";

-- DropIndex
DROP INDEX "audit_logs_action_idx";

-- DropIndex
DROP INDEX "audit_logs_created_at_idx";

-- DropIndex
DROP INDEX "audit_logs_entity_type_entity_id_action_idx";

-- DropIndex
DROP INDEX "audit_logs_entity_type_entity_id_idx";

-- DropIndex
DROP INDEX "audit_logs_ip_address_idx";

-- DropIndex
DROP INDEX "audit_logs_retention_expires_idx";

-- DropIndex
DROP INDEX "audit_logs_severity_idx";

-- DropIndex
DROP INDEX "audit_logs_user_id_created_at_idx";

-- DropIndex
DROP INDEX "audit_logs_user_id_idx";

-- DropIndex
DROP INDEX "audit_logs_username_idx";

-- DropIndex
DROP INDEX "bank_accounts_tenant_id_iban_key";

-- DropIndex
DROP INDEX "unique_tenant_default_bank_account";

-- DropIndex
DROP INDEX "categories_parent_id_active_position_idx";

-- DropIndex
DROP INDEX "categories_tenant_id_active_position_idx";

-- DropIndex
DROP INDEX "categories_tenant_id_parent_id_idx";

-- DropIndex
DROP INDEX "category_translations_category_id_language_id_key";

-- DropIndex
DROP INDEX "chart_of_account_translations_chart_of_account_id_language__key";

-- DropIndex
DROP INDEX "closed_reason_translations_closed_reason_id_language_id_key";

-- DropIndex
DROP INDEX "cost_center_translations_cost_center_id_language_id_key";

-- DropIndex
DROP INDEX "currencies_is_base_currency_idx";

-- DropIndex
DROP INDEX "currency_translations_currency_id_language_id_key";

-- DropIndex
DROP INDEX "document_lines_document_id_line_number_idx";

-- DropIndex
DROP INDEX "feature_group_translations_feature_group_id_language_id_key";

-- DropIndex
DROP INDEX "feature_groups_position_idx";

-- DropIndex
DROP INDEX "feature_translations_feature_id_language_id_key";

-- DropIndex
DROP INDEX "features_feature_group_id_code_key";

-- DropIndex
DROP INDEX "features_feature_group_id_idx";

-- DropIndex
DROP INDEX "intrastat_commodity_code_translations_commodity_code_langua_key";

-- DropIndex
DROP INDEX "intrastat_transaction_code_translations_transaction_code_la_key";

-- DropIndex
DROP INDEX "intrastat_transactions_partner_country_code_idx";

-- DropIndex
DROP INDEX "intrastat_transactions_tenant_id_idx";

-- DropIndex
DROP INDEX "intrastat_transactions_transaction_date_idx";

-- DropIndex
DROP INDEX "intrastat_transport_mode_translations_transport_mode_code_l_key";

-- DropIndex
DROP INDEX "journal_entries_document_id_idx";

-- DropIndex
DROP INDEX "journal_entries_installment_id_idx";

-- DropIndex
DROP INDEX "journal_entries_period_id_idx";

-- DropIndex
DROP INDEX "journal_entries_reversed_by_entry_id_key";

-- DropIndex
DROP INDEX "journal_entry_lines_cost_center_id_idx";

-- DropIndex
DROP INDEX "journal_entry_lines_entry_id_idx";

-- DropIndex
DROP INDEX "payment_batches_execution_date_idx";

-- DropIndex
DROP INDEX "payment_batches_tenant_id_idx";

-- DropIndex
DROP INDEX "payment_term_details_payment_method_id_idx";

-- DropIndex
DROP INDEX "price_list_items_variant_id_idx";

-- DropIndex
DROP INDEX "price_lists_active_idx";

-- DropIndex
DROP INDEX "price_lists_valid_from_valid_to_idx";

-- DropIndex
DROP INDEX "unique_global_price_list_code";

-- DropIndex
DROP INDEX "product_categories_category_id_idx";

-- DropIndex
DROP INDEX "product_features_feature_group_id_idx";

-- DropIndex
DROP INDEX "product_features_feature_id_idx";

-- DropIndex
DROP INDEX "product_features_product_id_feature_group_id_key";

-- DropIndex
DROP INDEX "product_features_product_id_idx";

-- DropIndex
DROP INDEX "product_image_translations_product_image_id_idx";

-- DropIndex
DROP INDEX "product_image_translations_product_image_id_language_id_key";

-- DropIndex
DROP INDEX "product_translations_link_rewrite_idx";

-- DropIndex
DROP INDEX "product_translations_link_rewrite_key";

-- DropIndex
DROP INDEX "product_translations_product_id_idx";

-- DropIndex
DROP INDEX "product_translations_product_id_language_id_key";

-- DropIndex
DROP INDEX "product_variants_ean13_key";

-- DropIndex
DROP INDEX "sdi_transmissions_document_id_key";

-- DropIndex
DROP INDEX "sdi_transmissions_sdi_identifier_idx";

-- DropIndex
DROP INDEX "stock_batches_expiry_date_idx";

-- DropIndex
DROP INDEX "stock_batches_product_variant_id_warehouse_id_batch_number_key";

-- DropIndex
DROP INDEX "stock_batches_warehouse_id_product_variant_id_idx";

-- DropIndex
DROP INDEX "stock_movements_batch_number_idx";

-- DropIndex
DROP INDEX "stock_movements_document_id_idx";

-- DropIndex
DROP INDEX "stock_movements_document_line_id_idx";

-- DropIndex
DROP INDEX "stock_movements_movement_date_idx";

-- DropIndex
DROP INDEX "stock_movements_product_variant_id_idx";

-- DropIndex
DROP INDEX "stock_movements_serial_number_idx";

-- DropIndex
DROP INDEX "stock_movements_status_idx";

-- DropIndex
DROP INDEX "stock_movements_warehouse_id_idx";

-- DropIndex
DROP INDEX "stock_movements_warehouse_id_product_variant_id_movement_da_idx";

-- DropIndex
DROP INDEX "stock_reservations_document_id_idx";

-- DropIndex
DROP INDEX "stock_reservations_document_line_id_idx";

-- DropIndex
DROP INDEX "stock_reservations_expires_at_idx";

-- DropIndex
DROP INDEX "stock_reservations_product_variant_id_warehouse_id_status_idx";

-- DropIndex
DROP INDEX "stock_reservations_warehouse_id_status_expires_at_idx";

-- DropIndex
DROP INDEX "tax_rule_translations_tax_rule_id_language_id_key";

-- DropIndex
DROP INDEX "user_tenant_membership_roles_role_id_idx";

-- DropIndex
DROP INDEX "vat_nature_translations_vat_nature_id_language_id_key";

-- DropIndex
DROP INDEX "virtual_stocks_product_variant_id_idx";

-- DropIndex
DROP INDEX "virtual_stocks_product_variant_id_warehouse_id_key";

-- DropIndex
DROP INDEX "virtual_stocks_supplier_currency_code_idx";

-- DropIndex
DROP INDEX "virtual_stocks_sync_status_last_sync_at_idx";

-- DropIndex
DROP INDEX "virtual_stocks_warehouse_id_idx";

-- DropIndex
DROP INDEX "virtual_stocks_warehouse_id_sync_status_idx";

-- DropIndex
DROP INDEX "warehouses_type_idx";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "supplierId",
ADD COLUMN     "supplier_id" TEXT;

-- AlterTable
ALTER TABLE "activity_participants" ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "attribute_group_translations" DROP CONSTRAINT "attribute_group_translations_pkey",
DROP COLUMN "id",
ALTER COLUMN "attribute_group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attribute_group_translations_pkey" PRIMARY KEY ("attribute_group_id", "language_id");

-- AlterTable
ALTER TABLE "attribute_groups" DROP CONSTRAINT "attribute_groups_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attribute_groups_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "attribute_groups_id_seq";

-- AlterTable
ALTER TABLE "attribute_translations" DROP CONSTRAINT "attribute_translations_pkey",
DROP COLUMN "id",
ALTER COLUMN "attribute_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attribute_translations_pkey" PRIMARY KEY ("attribute_id", "language_id");

-- AlterTable
ALTER TABLE "attributes" DROP CONSTRAINT "attributes_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "attribute_group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "attributes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "attributes_id_seq";

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "tenant_id" TEXT,
ALTER COLUMN "entity_id" SET DATA TYPE VARCHAR(64),
ALTER COLUMN "related_entity_id" SET DATA TYPE VARCHAR(64);

-- AlterTable
ALTER TABLE "bank_accounts" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "category_translations" DROP CONSTRAINT "category_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "category_translations_pkey" PRIMARY KEY ("category_id", "language_id");

-- AlterTable
ALTER TABLE "chart_of_account_translations" DROP CONSTRAINT "chart_of_account_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "chart_of_account_translations_pkey" PRIMARY KEY ("chart_of_account_id", "language_id");

-- AlterTable
ALTER TABLE "closed_reason_translations" DROP CONSTRAINT "closed_reason_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "closed_reason_translations_pkey" PRIMARY KEY ("closed_reason_id", "language_id");

-- AlterTable
ALTER TABLE "cost_center_translations" DROP CONSTRAINT "cost_center_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "cost_center_translations_pkey" PRIMARY KEY ("cost_center_id", "language_id");

-- AlterTable
ALTER TABLE "currency_translations" DROP CONSTRAINT "currency_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "currency_translations_pkey" PRIMARY KEY ("currency_id", "language_id");

-- AlterTable
ALTER TABLE "document_lines" ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "documents" ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "feature_group_translations" DROP CONSTRAINT "feature_group_translations_pkey",
DROP COLUMN "id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "feature_group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "feature_group_translations_pkey" PRIMARY KEY ("feature_group_id", "language_id");

-- AlterTable
ALTER TABLE "feature_groups" DROP CONSTRAINT "feature_groups_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "feature_groups_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "feature_groups_id_seq";

-- AlterTable
ALTER TABLE "feature_translations" DROP CONSTRAINT "feature_translations_pkey",
DROP COLUMN "id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "feature_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "feature_translations_pkey" PRIMARY KEY ("feature_id", "language_id");

-- AlterTable
ALTER TABLE "features" DROP CONSTRAINT "features_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "feature_group_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "features_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "features_id_seq";

-- AlterTable
ALTER TABLE "intrastat_commodity_code_translations" DROP CONSTRAINT "intrastat_commodity_code_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "intrastat_commodity_code_translations_pkey" PRIMARY KEY ("commodity_code", "language_id");

-- AlterTable
ALTER TABLE "intrastat_transaction_code_translations" DROP CONSTRAINT "intrastat_transaction_code_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "intrastat_transaction_code_translations_pkey" PRIMARY KEY ("transaction_code", "language_id");

-- AlterTable
ALTER TABLE "intrastat_transport_mode_translations" DROP CONSTRAINT "intrastat_transport_mode_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "intrastat_transport_mode_translations_pkey" PRIMARY KEY ("transport_mode_code", "language_id");

-- AlterTable
ALTER TABLE "price_list_items" ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "price_lists" ALTER COLUMN "tenant_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "product_categories" ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "product_features" DROP CONSTRAINT "product_features_pkey",
DROP COLUMN "id",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "feature_group_id" SET DATA TYPE TEXT,
ALTER COLUMN "feature_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "product_features_pkey" PRIMARY KEY ("product_id", "feature_group_id");

-- AlterTable
ALTER TABLE "product_image_translations" DROP CONSTRAINT "product_image_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "product_image_translations_pkey" PRIMARY KEY ("product_image_id", "language_id");

-- AlterTable
ALTER TABLE "product_translations" DROP CONSTRAINT "product_translations_pkey",
DROP COLUMN "id",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "product_translations_pkey" PRIMARY KEY ("product_id", "language_id");

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "commodity_code" SET DATA TYPE CHAR(8);

-- AlterTable
ALTER TABLE "stock_batches" DROP CONSTRAINT "stock_batches_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "reserved" SET DEFAULT 0,
ALTER COLUMN "reserved" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "stock_batches_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "stock_batches_id_seq";

-- AlterTable
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "stock_movements_id_seq";

-- AlterTable
ALTER TABLE "stock_reservations" DROP CONSTRAINT "stock_reservations_pkey",
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "stock_reservations_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "stock_reservations_id_seq";

-- AlterTable
ALTER TABLE "tax_rule_translations" DROP CONSTRAINT "tax_rule_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "tax_rule_translations_pkey" PRIMARY KEY ("tax_rule_id", "language_id");

-- AlterTable
ALTER TABLE "user_tenant_membership_roles" ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vat_nature_translations" DROP CONSTRAINT "vat_nature_translations_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "vat_nature_translations_pkey" PRIMARY KEY ("vat_nature_id", "language_id");

-- AlterTable
ALTER TABLE "virtual_stocks" DROP CONSTRAINT "virtual_stocks_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "warehouse_id" SET DATA TYPE TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(65,30),
ADD CONSTRAINT "virtual_stocks_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "virtual_stocks_id_seq";

-- AlterTable
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_pkey",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "code" VARCHAR(20) NOT NULL,
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supplier_id" TEXT,
ADD COLUMN     "tenant_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "warehouses_id_seq";

-- DropTable
DROP TABLE "PaymentMethodTranslation";

-- DropTable
DROP TABLE "product_variant_attribute";

-- CreateTable
CREATE TABLE "product_variant_attributes" (
    "tenant_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "attribute_group_id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,

    CONSTRAINT "product_variant_attributes_pkey" PRIMARY KEY ("product_variant_id","attribute_id")
);

-- CreateTable
CREATE TABLE "payment_method_translations" (
    "payment_method_id" TEXT NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_method_translations_pkey" PRIMARY KEY ("payment_method_id","language_id")
);

-- CreateIndex
CREATE INDEX "product_variant_attributes_tenant_id_attribute_id_idx" ON "product_variant_attributes"("tenant_id", "attribute_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_attributes_product_variant_id_attribute_gro_key" ON "product_variant_attributes"("product_variant_id", "attribute_group_id");

-- CreateIndex
CREATE INDEX "payment_method_translations_language_id_idx" ON "payment_method_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_tenant_id_fiscal_year_id_id_key" ON "accounting_periods"("tenant_id", "fiscal_year_id", "id");

-- CreateIndex
CREATE INDEX "activities_has_attachments" ON "activities"("tenant_id", "scheduled_start") WHERE ("attachments" IS NOT NULL);

-- CreateIndex
CREATE INDEX "activities_tenant_id_supplier_id_idx" ON "activities"("tenant_id", "supplier_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_scheduled_start_scheduled_end_idx" ON "activities"("tenant_id", "scheduled_start", "scheduled_end");

-- CreateIndex
CREATE INDEX "activities_tenant_id_follow_up_activity_id_idx" ON "activities"("tenant_id", "follow_up_activity_id") WHERE ("follow_up_activity_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "activities_tenant_id_id_key" ON "activities"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "activity_participants_tenant_id_activity_id_idx" ON "activity_participants"("tenant_id", "activity_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_tenant_id_activity_id_user_id_key" ON "activity_participants"("tenant_id", "activity_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_tenant_id_activity_id_contact_id_key" ON "activity_participants"("tenant_id", "activity_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "activity_participants_unique_external_email" ON "activity_participants"("tenant_id", "activity_id", "external_email") WHERE ("external_email" IS NOT NULL);

-- CreateIndex
CREATE INDEX "attribute_groups_tenant_id_position_idx" ON "attribute_groups"("tenant_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_groups_tenant_id_id_key" ON "attribute_groups"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_groups_tenant_id_code_key" ON "attribute_groups"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "attribute_groups_tenant_id_external_code_key" ON "attribute_groups"("tenant_id", "external_code");

-- CreateIndex
CREATE INDEX "attributes_tenant_id_attribute_group_id_position_idx" ON "attributes"("tenant_id", "attribute_group_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_tenant_id_attribute_group_id_code_key" ON "attributes"("tenant_id", "attribute_group_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "attributes_tenant_id_attribute_group_id_id_key" ON "attributes"("tenant_id", "attribute_group_id", "id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_created_at_idx" ON "audit_logs"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_entity_type_entity_id_created_at_idx" ON "audit_logs"("tenant_id", "entity_type", "entity_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_user_id_created_at_idx" ON "audit_logs"("tenant_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_retention_expires_idx" ON "audit_logs"("retention_expires") WHERE ("retention_expires" IS NOT NULL);

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_iban_idx" ON "bank_accounts"("tenant_id", "iban");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_tenant_id_id_key" ON "bank_accounts"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_tenant_id_iban_key" ON "bank_accounts"("tenant_id", "iban") WHERE ("company_id" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "unique_tenant_default_bank_account" ON "bank_accounts"("tenant_id", "currency_code") WHERE ("is_default" = true AND "company_id" IS NULL);

-- CreateIndex
CREATE INDEX "categories_tenant_id_parent_id_active_position_idx" ON "categories"("tenant_id", "parent_id", "active", "position");

-- CreateIndex
CREATE UNIQUE INDEX "categories_tenant_id_id_key" ON "categories"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenant_id_id_key" ON "companies"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "company_versions_tenant_id_id_key" ON "company_versions"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_tenant_id_id_key" ON "contacts"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_tenant_id_id_key" ON "cost_centers"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_base_currency" ON "currencies"("is_base_currency") WHERE ("is_base_currency" = true);

-- CreateIndex
CREATE UNIQUE INDEX "customers_tenant_id_id_key" ON "customers"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "document_lines_tenant_id_id_key" ON "document_lines"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "document_lines_tenant_id_document_id_id_key" ON "document_lines"("tenant_id", "document_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "document_lines_tenant_id_document_id_line_number_key" ON "document_lines"("tenant_id", "document_id", "line_number");

-- CreateIndex
CREATE INDEX "document_payment_installments_tenant_id_payment_batch_id_idx" ON "document_payment_installments"("tenant_id", "payment_batch_id") WHERE ("payment_batch_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "document_payment_installments_tenant_id_id_key" ON "document_payment_installments"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_warehouse_id_idx" ON "documents"("tenant_id", "warehouse_id") WHERE ("warehouse_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_id_key" ON "documents"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "feature_group_translations_language_id_idx" ON "feature_group_translations"("language_id");

-- CreateIndex
CREATE INDEX "feature_groups_tenant_id_position_idx" ON "feature_groups"("tenant_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "feature_groups_tenant_id_id_key" ON "feature_groups"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "feature_groups_tenant_id_code_key" ON "feature_groups"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "feature_translations_language_id_idx" ON "feature_translations"("language_id");

-- CreateIndex
CREATE INDEX "features_tenant_id_feature_group_id_idx" ON "features"("tenant_id", "feature_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_tenant_id_feature_group_id_id_key" ON "features"("tenant_id", "feature_group_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "features_tenant_id_feature_group_id_code_key" ON "features"("tenant_id", "feature_group_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_years_tenant_id_id_key" ON "fiscal_years"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_period_id_idx" ON "journal_entries"("tenant_id", "period_id");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_document_id_idx" ON "journal_entries"("tenant_id", "document_id") WHERE ("document_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_installment_id_idx" ON "journal_entries"("tenant_id", "installment_id") WHERE ("installment_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_withholding_settlement_id_idx" ON "journal_entries"("tenant_id", "withholding_settlement_id") WHERE ("withholding_settlement_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenant_id_id_key" ON "journal_entries"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenant_id_reversed_by_entry_id_key" ON "journal_entries"("tenant_id", "reversed_by_entry_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_entry_id_idx" ON "journal_entry_lines"("tenant_id", "entry_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_cost_center_id_idx" ON "journal_entry_lines"("tenant_id", "cost_center_id") WHERE ("cost_center_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "leads_tenant_id_id_key" ON "leads"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "leads_tenant_id_converted_to_id_key" ON "leads"("tenant_id", "converted_to_id");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturers_tenant_id_id_key" ON "manufacturers"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "opportunities_tenant_id_id_key" ON "opportunities"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "payment_batches_tenant_id_execution_date_idx" ON "payment_batches"("tenant_id", "execution_date");

-- CreateIndex
CREATE UNIQUE INDEX "payment_batches_tenant_id_id_key" ON "payment_batches"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_term_details_payment_method_id_position_key" ON "payment_term_details"("payment_method_id", "position");

-- CreateIndex
CREATE INDEX "price_list_items_tenant_id_variant_id_idx" ON "price_list_items"("tenant_id", "variant_id");

-- CreateIndex
CREATE INDEX "price_lists_tenant_id_active_idx" ON "price_lists"("tenant_id", "active");

-- CreateIndex
CREATE INDEX "price_lists_tenant_id_valid_from_valid_to_idx" ON "price_lists"("tenant_id", "valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "price_lists_tenant_id_parent_list_id_idx" ON "price_lists"("tenant_id", "parent_list_id") WHERE ("parent_list_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "price_lists_tenant_id_id_key" ON "price_lists"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "product_categories_tenant_id_category_id_idx" ON "product_categories"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "product_features_tenant_id_feature_group_id_feature_id_idx" ON "product_features"("tenant_id", "feature_group_id", "feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_tenant_id_language_id_link_rewrite_key" ON "product_translations"("tenant_id", "language_id", "link_rewrite");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_id_key" ON "product_variants"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_tenant_id_ean13_key" ON "product_variants"("tenant_id", "ean13");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_id_key" ON "products"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_default_role" ON "roles"("is_default") WHERE ("tenant_id" IS NULL AND "is_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "sdi_transmissions_tenant_id_document_id_key" ON "sdi_transmissions"("tenant_id", "document_id");

-- CreateIndex
CREATE UNIQUE INDEX "sdi_transmissions_tenant_id_file_name_key" ON "sdi_transmissions"("tenant_id", "file_name");

-- CreateIndex
CREATE UNIQUE INDEX "sdi_transmissions_sdi_identifier_key" ON "sdi_transmissions"("sdi_identifier");

-- CreateIndex
CREATE INDEX "stock_batches_tenant_id_supplier_id_idx" ON "stock_batches"("tenant_id", "supplier_id") WHERE ("supplier_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_batches_tenant_id_expiry_date_idx" ON "stock_batches"("tenant_id", "expiry_date");

-- CreateIndex
CREATE INDEX "stock_batches_tenant_id_warehouse_id_product_variant_id_idx" ON "stock_batches"("tenant_id", "warehouse_id", "product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_batches_tenant_id_product_variant_id_warehouse_id_bat_key" ON "stock_batches"("tenant_id", "product_variant_id", "warehouse_id", "batch_number");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_warehouse_id_product_variant_id_m_idx" ON "stock_movements"("tenant_id", "warehouse_id", "product_variant_id", "movement_date");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_product_variant_id_movement_date_idx" ON "stock_movements"("tenant_id", "product_variant_id", "movement_date");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_movement_date_idx" ON "stock_movements"("tenant_id", "movement_date");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_document_id_idx" ON "stock_movements"("tenant_id", "document_id") WHERE ("document_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_document_line_id_idx" ON "stock_movements"("tenant_id", "document_line_id") WHERE ("document_line_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_batch_number_idx" ON "stock_movements"("tenant_id", "batch_number") WHERE ("batch_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_serial_number_idx" ON "stock_movements"("tenant_id", "serial_number") WHERE ("serial_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_reservations_tenant_id_product_variant_id_warehouse_i_idx" ON "stock_reservations"("tenant_id", "product_variant_id", "warehouse_id", "status");

-- CreateIndex
CREATE INDEX "stock_reservations_tenant_id_document_id_idx" ON "stock_reservations"("tenant_id", "document_id");

-- CreateIndex
CREATE INDEX "stock_reservations_tenant_id_document_line_id_idx" ON "stock_reservations"("tenant_id", "document_line_id");

-- CreateIndex
CREATE INDEX "stock_reservations_tenant_id_expires_at_idx" ON "stock_reservations"("tenant_id", "expires_at") WHERE ("expires_at" IS NOT NULL AND "status" = 'ACTIVE');

-- CreateIndex
CREATE INDEX "stock_reservations_tenant_id_warehouse_id_status_expires_at_idx" ON "stock_reservations"("tenant_id", "warehouse_id", "status", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_id_key" ON "suppliers"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "user_tenant_membership_roles_tenant_id_role_id_idx" ON "user_tenant_membership_roles"("tenant_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tenant_memberships_tenant_id_id_key" ON "user_tenant_memberships"("tenant_id", "id");

-- CreateIndex
CREATE INDEX "virtual_stocks_tenant_id_sync_status_last_sync_at_idx" ON "virtual_stocks"("tenant_id", "sync_status", "last_sync_at");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_stocks_tenant_id_product_variant_id_warehouse_id_key" ON "virtual_stocks"("tenant_id", "product_variant_id", "warehouse_id");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_type_idx" ON "warehouses"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "warehouses_tenant_id_supplier_id_idx" ON "warehouses"("tenant_id", "supplier_id") WHERE ("supplier_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_tenant_id_id_key" ON "warehouses"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "warehouses_tenant_id_code_key" ON "warehouses"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_default_warehouse_per_tenant" ON "warehouses"("tenant_id") WHERE ("is_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_settlements_tenant_id_id_key" ON "withholding_tax_settlements"("tenant_id", "id");

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_tenant_id_fiscal_year_id_fkey" FOREIGN KEY ("tenant_id", "fiscal_year_id") REFERENCES "fiscal_years"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_parent_cost_center_id_fkey" FOREIGN KEY ("tenant_id", "parent_cost_center_id") REFERENCES "cost_centers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fiscal_year_id_fkey" FOREIGN KEY ("tenant_id", "fiscal_year_id") REFERENCES "fiscal_years"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fiscal_year_id_period_id_fkey" FOREIGN KEY ("tenant_id", "fiscal_year_id", "period_id") REFERENCES "accounting_periods"("tenant_id", "fiscal_year_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_installment_id_fkey" FOREIGN KEY ("tenant_id", "installment_id") REFERENCES "document_payment_installments"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_withholding_settlement_id_fkey" FOREIGN KEY ("tenant_id", "withholding_settlement_id") REFERENCES "withholding_tax_settlements"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_reversed_by_entry_id_fkey" FOREIGN KEY ("tenant_id", "reversed_by_entry_id") REFERENCES "journal_entries"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_tenant_id_entry_id_fkey" FOREIGN KEY ("tenant_id", "entry_id") REFERENCES "journal_entries"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_tenant_id_cost_center_id_fkey" FOREIGN KEY ("tenant_id", "cost_center_id") REFERENCES "cost_centers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_customer_id_fkey" FOREIGN KEY ("tenant_id", "customer_id") REFERENCES "customers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contacts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_opportunity_id_fkey" FOREIGN KEY ("tenant_id", "opportunity_id") REFERENCES "opportunities"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_lead_id_fkey" FOREIGN KEY ("tenant_id", "lead_id") REFERENCES "leads"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_tenant_id_follow_up_activity_id_fkey" FOREIGN KEY ("tenant_id", "follow_up_activity_id") REFERENCES "activities"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_tenant_id_activity_id_fkey" FOREIGN KEY ("tenant_id", "activity_id") REFERENCES "activities"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_participants" ADD CONSTRAINT "activity_participants_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contacts"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_groups" ADD CONSTRAINT "attribute_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_group_translations" ADD CONSTRAINT "attribute_group_translations_attribute_group_id_fkey" FOREIGN KEY ("attribute_group_id") REFERENCES "attribute_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attributes" ADD CONSTRAINT "attributes_tenant_id_attribute_group_id_fkey" FOREIGN KEY ("tenant_id", "attribute_group_id") REFERENCES "attribute_groups"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribute_translations" ADD CONSTRAINT "attribute_translations_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attributes" ADD CONSTRAINT "product_variant_attributes_tenant_id_attribute_group_id_at_fkey" FOREIGN KEY ("tenant_id", "attribute_group_id", "attribute_id") REFERENCES "attributes"("tenant_id", "attribute_group_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_parent_id_fkey" FOREIGN KEY ("tenant_id", "parent_id") REFERENCES "categories"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_tenant_id_category_id_fkey" FOREIGN KEY ("tenant_id", "category_id") REFERENCES "categories"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_versions" ADD CONSTRAINT "company_versions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_company_id_fkey" FOREIGN KEY ("tenant_id", "company_id") REFERENCES "companies"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_customer_id_fkey" FOREIGN KEY ("tenant_id", "customer_id") REFERENCES "customers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_contact_id_fkey" FOREIGN KEY ("tenant_id", "contact_id") REFERENCES "contacts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_opportunity_id_fkey" FOREIGN KEY ("tenant_id", "opportunity_id") REFERENCES "opportunities"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_lead_id_fkey" FOREIGN KEY ("tenant_id", "lead_id") REFERENCES "leads"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_company_version_id_fkey" FOREIGN KEY ("tenant_id", "company_version_id") REFERENCES "company_versions"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_parent_line_id_fkey" FOREIGN KEY ("tenant_id", "parent_line_id") REFERENCES "document_lines"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_tenant_id_payment_batch_id_fkey" FOREIGN KEY ("tenant_id", "payment_batch_id") REFERENCES "payment_batches"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_groups" ADD CONSTRAINT "feature_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_translations" ADD CONSTRAINT "feature_group_translations_feature_group_id_fkey" FOREIGN KEY ("feature_group_id") REFERENCES "feature_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_group_translations" ADD CONSTRAINT "feature_group_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_tenant_id_feature_group_id_fkey" FOREIGN KEY ("tenant_id", "feature_group_id") REFERENCES "feature_groups"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_translations" ADD CONSTRAINT "feature_translations_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feature_translations" ADD CONSTRAINT "feature_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_tenant_id_feature_group_id_fkey" FOREIGN KEY ("tenant_id", "feature_group_id") REFERENCES "feature_groups"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_features" ADD CONSTRAINT "product_features_tenant_id_feature_group_id_feature_id_fkey" FOREIGN KEY ("tenant_id", "feature_group_id", "feature_id") REFERENCES "features"("tenant_id", "feature_group_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intrastat_transactions" ADD CONSTRAINT "intrastat_transactions_tenant_id_document_id_document_line_fkey" FOREIGN KEY ("tenant_id", "document_id", "document_line_id") REFERENCES "document_lines"("tenant_id", "document_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_converted_to_id_fkey" FOREIGN KEY ("tenant_id", "converted_to_id") REFERENCES "customers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_tenant_id_lead_id_fkey" FOREIGN KEY ("tenant_id", "lead_id") REFERENCES "leads"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_tenant_id_customer_id_fkey" FOREIGN KEY ("tenant_id", "customer_id") REFERENCES "customers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_opportunity_id_fkey" FOREIGN KEY ("tenant_id", "opportunity_id") REFERENCES "opportunities"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_tenant_id_default_bank_account_id_fkey" FOREIGN KEY ("tenant_id", "default_bank_account_id") REFERENCES "bank_accounts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_method_translations" ADD CONSTRAINT "payment_method_translations_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_method_translations" ADD CONSTRAINT "payment_method_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_tenant_id_tenant_bank_account_id_fkey" FOREIGN KEY ("tenant_id", "tenant_bank_account_id") REFERENCES "bank_accounts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_lists" ADD CONSTRAINT "price_lists_tenant_id_parent_list_id_fkey" FOREIGN KEY ("tenant_id", "parent_list_id") REFERENCES "price_lists"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_tenant_id_price_list_id_fkey" FOREIGN KEY ("tenant_id", "price_list_id") REFERENCES "price_lists"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_list_items" ADD CONSTRAINT "price_list_items_tenant_id_variant_id_fkey" FOREIGN KEY ("tenant_id", "variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_manufacturer_id_fkey" FOREIGN KEY ("tenant_id", "manufacturer_id") REFERENCES "manufacturers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_commodity_code_fkey" FOREIGN KEY ("commodity_code") REFERENCES "intrastat_commodity_codes"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_tenant_id_category_id_fkey" FOREIGN KEY ("tenant_id", "category_id") REFERENCES "categories"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_parent_role_id_fkey" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdi_transmissions" ADD CONSTRAINT "sdi_transmissions_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tenant_membership_roles" ADD CONSTRAINT "user_tenant_membership_roles_tenant_id_membership_id_fkey" FOREIGN KEY ("tenant_id", "membership_id") REFERENCES "user_tenant_memberships"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warehouses" ADD CONSTRAINT "warehouses_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_document_line_id_fkey" FOREIGN KEY ("tenant_id", "document_line_id") REFERENCES "document_lines"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_stocks" ADD CONSTRAINT "virtual_stocks_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_batches" ADD CONSTRAINT "stock_batches_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_document_line_id_fkey" FOREIGN KEY ("tenant_id", "document_line_id") REFERENCES "document_lines"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;
