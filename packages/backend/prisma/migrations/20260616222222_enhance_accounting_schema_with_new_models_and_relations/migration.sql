/*
Warnings:

- The primary key for the `PaymentMethodTranslation` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `bank_accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `customer_address` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_city` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_country_code` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_email` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_name` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_pec` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_phone` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_postal_code` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_province` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_sdi_code` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_tax_code` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `customer_vat_number` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `payment_method` on the `documents` table. All the data in the column will be lost.
- You are about to drop the column `payment_terms` on the `documents` table. All the data in the column will be lost.
- You are about to alter the column `bank_iban` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(34)`.
- You are about to alter the column `bank_swift` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(11)`.
- The primary key for the `payment_methods` table will be changed. If it partially fails, the table could be left without primary key constraint.
- The primary key for the `payment_term_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
- You are about to drop the column `social_security_fund_code` on the `suppliers` table. All the data in the column will be lost.
- You are about to drop the column `withholding_tax_type` on the `suppliers` table. All the data in the column will be lost.
- A unique constraint covering the columns `[tenant_id,code]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[source_document_id]` on the table `document_relations` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,direction,vat_register_year,vat_register_protocol]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,supplier_id,counterparty_document_number,document_date]` on the table `documents` will be added. If there are existing duplicate values, this will fail.
- Added the required column `tenant_id` to the `document_lines` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `document_payment_installments` table without a default value. This is not possible if the table is not empty.
- Added the required column `counterparty_name` to the `documents` table without a default value. This is not possible if the table is not empty.
- Added the required column `payment_method_code` to the `documents` table without a default value. This is not possible if the table is not empty.

 */
-- CreateEnum
CREATE TYPE "FiscalYearStatus" AS ENUM ('OPEN', 'CLOSING', 'CLOSED');

-- CreateEnum
CREATE TYPE "AccountingPeriodStatus" AS ENUM ('OPEN', 'LOCKED', 'CLOSED');

-- CreateEnum
CREATE TYPE "JournalEntryLineDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "JournalEntryStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JournalEntryOrigin" AS ENUM (
    'CUSTOMER_INVOICE',
    'CUSTOMER_PAYMENT',
    'SUPPLIER_INVOICE',
    'SUPPLIER_PAYMENT',
    'REVERSE_CHARGE_PURCHASE',
    'REVERSE_CHARGE_SALES',
    'WITHHOLDING_TAX_PAYMENT',
    'BANK_RECONCILIATION',
    'MANUAL'
);

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE',
    'TAX',
    'BANK',
    'ACCOUNTS_RECEIVABLE',
    'ACCOUNTS_PAYABLE',
    'WITHHOLDING_TAX',
    'INTERCOMPANY'
);

-- CreateEnum
CREATE TYPE "AmountSourceType" AS ENUM (
    'SUBTOTAL',
    'DISCOUNT_AMOUNT',
    'SHIPPING_COST',
    'SHIPPING_TAX_AMOUNT',
    'TAXABLE_AMOUNT',
    'TAX_AMOUNT',
    'TOTAL_AMOUNT',
    'WITHHOLDING_TAX_AMOUNT',
    'CONTRIBUTION_AMOUNT',
    'NET_PAYABLE_AMOUNT',
    'INSTALLMENT_AMOUNT',
    'LATE_FEE_AMOUNT'
);

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM (
    'NOT_MATCHED',
    'MATCHED',
    'MATCHED_WITH_VARIANCE',
    'DISPUTED'
);

-- CreateEnum
CREATE TYPE "PaymentBatchStatus" AS ENUM ('DRAFT', 'EXPORTED', 'EXECUTED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "SdiNotificationType" AS ENUM ('RC', 'MC', 'NS', 'NE', 'DT', 'AT');

-- CreateEnum
CREATE TYPE "SdiTransmissionStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'DELIVERY_FAILED',
    'REJECTED',
    'ACCEPTED',
    'DISPUTED',
    'EXPIRED',
    'UNDELIVERABLE'
);

-- CreateEnum
CREATE TYPE "WithholdingTaxSettlementStatus" AS ENUM ('DRAFT', 'LOCKED', 'SUBMITTED', 'PAID');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "DocumentRelationType" ADD VALUE 'FULFILLS';

ALTER TYPE "DocumentRelationType" ADD VALUE 'MIRRORS';

-- DropForeignKey
ALTER TABLE "PaymentMethodTranslation"
DROP CONSTRAINT "PaymentMethodTranslation_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "customers"
DROP CONSTRAINT "customers_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "document_payment_installments"
DROP CONSTRAINT "document_payment_installments_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "documents"
DROP CONSTRAINT "documents_customer_country_code_fkey";

-- DropForeignKey
ALTER TABLE "documents"
DROP CONSTRAINT "documents_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_methods"
DROP CONSTRAINT "payment_methods_default_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_term_details"
DROP CONSTRAINT "payment_term_details_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "suppliers"
DROP CONSTRAINT "suppliers_payment_method_id_fkey";

-- DropIndex
DROP INDEX "companies_code_key";

-- DropIndex
DROP INDEX "companies_vat_number_idx";

-- DropIndex
DROP INDEX "document_lines_document_id_idx";

-- DropIndex
DROP INDEX "document_lines_parent_line_id_idx";

-- DropIndex
DROP INDEX "document_lines_product_id_idx";

-- DropIndex
DROP INDEX "document_lines_product_variant_id_idx";

-- DropIndex
DROP INDEX "document_lines_tax_rule_id_idx";

-- DropIndex
DROP INDEX "document_lines_warehouse_id_idx";

-- DropIndex
DROP INDEX "document_payment_installments_due_date_idx";

-- DropIndex
DROP INDEX "document_payment_installments_status_due_date_idx";

-- DropIndex
DROP INDEX "document_payment_installments_status_idx";

-- DropIndex
DROP INDEX "document_sequences_tenant_id_idx";

-- DropIndex
DROP INDEX "documents_customer_country_code_idx";

-- DropIndex
DROP INDEX "documents_customer_id_idx";

-- DropIndex
DROP INDEX "documents_deleted_at_customer_id_idx";

-- DropIndex
DROP INDEX "documents_deleted_at_document_type_idx";

-- DropIndex
DROP INDEX "documents_deleted_at_status_idx";

-- DropIndex
DROP INDEX "documents_deleted_at_supplier_id_idx";

-- DropIndex
DROP INDEX "documents_document_type_idx";

-- DropIndex
DROP INDEX "documents_document_year_idx";

-- DropIndex
DROP INDEX "documents_lead_id_idx";

-- DropIndex
DROP INDEX "documents_opportunity_id_idx";

-- DropIndex
DROP INDEX "documents_shipping_country_code_idx";

-- DropIndex
DROP INDEX "documents_status_idx";

-- DropIndex
DROP INDEX "documents_supplier_id_idx";

-- DropIndex
DROP INDEX "documents_tenant_id_direction_status_idx";

-- DropIndex
DROP INDEX "documents_tenant_id_document_type_idx";

-- DropIndex
DROP INDEX "documents_tenant_id_idx";

-- DropIndex
DROP INDEX "payment_term_details_position_idx";

-- AlterTable
ALTER TABLE "PaymentMethodTranslation"
DROP CONSTRAINT "PaymentMethodTranslation_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
    DATA TYPE TEXT,
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT,
    ADD CONSTRAINT "PaymentMethodTranslation_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "PaymentMethodTranslation_id_seq";

-- AlterTable
ALTER TABLE "bank_accounts"
DROP CONSTRAINT "bank_accounts_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
    DATA TYPE TEXT,
ALTER COLUMN "note"
DROP NOT NULL,
ADD CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "bank_accounts_id_seq";

-- AlterTable
ALTER TABLE "customers"
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "document_lines"
ADD COLUMN "is_reverse_charge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_self_invoice" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "match_status" "MatchStatus",
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "document_payment_installments"
ADD COLUMN "payment_batch_id" TEXT,
ADD COLUMN "tenant_id" TEXT NOT NULL,
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "documents"
DROP COLUMN "customer_address",
DROP COLUMN "customer_city",
DROP COLUMN "customer_country_code",
DROP COLUMN "customer_email",
DROP COLUMN "customer_name",
DROP COLUMN "customer_pec",
DROP COLUMN "customer_phone",
DROP COLUMN "customer_postal_code",
DROP COLUMN "customer_province",
DROP COLUMN "customer_sdi_code",
DROP COLUMN "customer_tax_code",
DROP COLUMN "customer_vat_number",
DROP COLUMN "payment_method",
DROP COLUMN "payment_terms",
ADD COLUMN "bank_account_holder" VARCHAR(255),
ADD COLUMN "bank_details_mismatch" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bank_details_verified_at" TIMESTAMP(3),
ADD COLUMN "bank_details_verified_by_user_id" TEXT,
ADD COLUMN "contribution_amount" DECIMAL(15, 2),
ADD COLUMN "contribution_percent" DECIMAL(5, 2),
ADD COLUMN "counterparty_address" TEXT,
ADD COLUMN "counterparty_city" TEXT,
ADD COLUMN "counterparty_country_code" CHAR(2) NOT NULL DEFAULT 'IT',
ADD COLUMN "counterparty_document_number" VARCHAR(50),
ADD COLUMN "counterparty_email" TEXT,
ADD COLUMN "counterparty_name" TEXT NOT NULL,
ADD COLUMN "counterparty_pec" TEXT,
ADD COLUMN "counterparty_phone" TEXT,
ADD COLUMN "counterparty_postal_code" TEXT,
ADD COLUMN "counterparty_province" TEXT,
ADD COLUMN "counterparty_sdi_code" TEXT,
ADD COLUMN "counterparty_tax_code" TEXT,
ADD COLUMN "counterparty_vat_number" TEXT,
ADD COLUMN "net_payable_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
ADD COLUMN "payment_bank_account_id" TEXT,
ADD COLUMN "payment_method_code" VARCHAR(50) NOT NULL,
ADD COLUMN "payment_terms_label" VARCHAR(100),
ADD COLUMN "received_date" TIMESTAMP(3),
ADD COLUMN "registration_date" TIMESTAMP(3),
ADD COLUMN "vat_register_protocol" INTEGER,
ADD COLUMN "vat_register_year" INTEGER,
ADD COLUMN "withholding_tax_amount" DECIMAL(15, 2),
ADD COLUMN "withholding_tax_base" DECIMAL(15, 2),
ADD COLUMN "withholding_tax_percent" DECIMAL(5, 2),
ADD COLUMN "withholding_tax_type_code" VARCHAR(10),
ADD COLUMN "withholding_tax_type_id" TEXT,
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT,
ALTER COLUMN "bank_iban"
SET
    DATA TYPE VARCHAR(34),
ALTER COLUMN "bank_swift"
SET
    DATA TYPE VARCHAR(11);

-- AlterTable
ALTER TABLE "payment_methods"
DROP CONSTRAINT "payment_methods_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
    DATA TYPE TEXT,
ALTER COLUMN "default_bank_account_id"
SET
    DATA TYPE TEXT,
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "payment_methods_id_seq";

-- AlterTable
ALTER TABLE "payment_term_details"
DROP CONSTRAINT "payment_term_details_pkey",
ALTER COLUMN "id"
DROP DEFAULT,
ALTER COLUMN "id"
SET
    DATA TYPE TEXT,
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT,
    ADD CONSTRAINT "payment_term_details_pkey" PRIMARY KEY ("id");

DROP SEQUENCE "payment_term_details_id_seq";

-- AlterTable
ALTER TABLE "suppliers"
DROP COLUMN "social_security_fund_code",
DROP COLUMN "withholding_tax_type",
ADD COLUMN "default_withholding_tax_type_id" TEXT,
ADD COLUMN "social_security_fund_id" TEXT,
ALTER COLUMN "payment_method_id"
SET
    DATA TYPE TEXT;

-- CreateTable
CREATE TABLE
    "fiscal_years" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "name" VARCHAR(20) NOT NULL,
        "start_date" DATE NOT NULL,
        "end_date" DATE NOT NULL,
        "status" "FiscalYearStatus" NOT NULL DEFAULT 'OPEN',
        "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
        "closed_by_user_id" TEXT,
        "closed_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "fiscal_years_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "accounting_periods" (
        "id" TEXT NOT NULL,
        "fiscal_year_id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "period_number" INTEGER NOT NULL,
        "name" VARCHAR(10) NOT NULL,
        "start_date" DATE NOT NULL,
        "end_date" DATE NOT NULL,
        "status" "AccountingPeriodStatus" NOT NULL DEFAULT 'OPEN',
        "locked_by_user_id" TEXT,
        "locked_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "accounting_periods_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "chart_of_accounts" (
        "id" TEXT NOT NULL,
        "code" VARCHAR(20) NOT NULL,
        "tenant_id" TEXT,
        "account_type" "AccountType" NOT NULL,
        "normal_balance" "JournalEntryLineDirection" NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "parent_account_id" TEXT,
        "is_postable" BOOLEAN NOT NULL DEFAULT true,
        "is_vat_account" BOOLEAN NOT NULL DEFAULT false,
        "is_bank_account" BOOLEAN NOT NULL DEFAULT false,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "chart_of_account_translations" (
        "id" SERIAL NOT NULL,
        "chart_of_account_id" TEXT NOT NULL,
        "language_id" INTEGER NOT NULL,
        "name" VARCHAR(150) NOT NULL,
        "description" TEXT,
        CONSTRAINT "chart_of_account_translations_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "cost_centers" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "code" VARCHAR(20) NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "parent_cost_center_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "cost_centers_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "cost_center_translations" (
        "id" SERIAL NOT NULL,
        "cost_center_id" TEXT NOT NULL,
        "language_id" INTEGER NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "description" TEXT,
        CONSTRAINT "cost_center_translations_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "journal_entry_templates" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT,
        "origin" "JournalEntryOrigin" NOT NULL,
        "description" VARCHAR(255) NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "journal_entry_templates_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "journal_entry_template_lines" (
        "id" SERIAL NOT NULL,
        "template_id" TEXT NOT NULL,
        "direction" "JournalEntryLineDirection" NOT NULL,
        "chart_of_account_id" TEXT NOT NULL,
        "amount_source" "AmountSourceType" NOT NULL,
        "position" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "journal_entry_template_lines_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "journal_entries" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "fiscal_year_id" TEXT NOT NULL,
        "period_id" TEXT NOT NULL,
        "entry_number" INTEGER,
        "entry_date" DATE NOT NULL,
        "origin" "JournalEntryOrigin" NOT NULL,
        "status" "JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
        "description" VARCHAR(500) NOT NULL,
        "document_id" TEXT,
        "installment_id" TEXT,
        "withholding_settlement_id" TEXT,
        "reversed_by_entry_id" TEXT,
        "created_by_user_id" TEXT NOT NULL,
        "posted_by_user_id" TEXT,
        "posted_at" TIMESTAMP(3),
        "notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "journal_entry_lines" (
        "id" SERIAL NOT NULL,
        "entry_id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "chart_of_account_id" TEXT NOT NULL,
        "direction" "JournalEntryLineDirection" NOT NULL,
        "amount" DECIMAL(15, 2) NOT NULL,
        "amount_base" DECIMAL(15, 2) NOT NULL,
        "cost_center_id" TEXT,
        "vat_code" VARCHAR(10),
        "vat_percent" DECIMAL(5, 2),
        "description" VARCHAR(255),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "journal_entry_lines_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "payment_batches" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "execution_date" TIMESTAMP(3) NOT NULL,
        "tenant_bank_account_id" TEXT,
        "total_amount" DECIMAL(15, 2) NOT NULL DEFAULT 0,
        "status" "PaymentBatchStatus" NOT NULL DEFAULT 'DRAFT',
        "sepa_file_reference" TEXT,
        "notes" TEXT,
        "created_by_user_id" TEXT NOT NULL,
        "approved_by_user_id" TEXT,
        "approved_at" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "payment_batches_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "sdi_transmissions" (
        "id" TEXT NOT NULL,
        "document_id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "sdi_identifier" VARCHAR(20),
        "file_name" VARCHAR(100) NOT NULL,
        "xml_storage_path" VARCHAR(500) NOT NULL,
        "signed_xml_storage_path" VARCHAR(500),
        "status" "SdiTransmissionStatus" NOT NULL DEFAULT 'PENDING',
        "transmitted_at" TIMESTAMP(3),
        "last_event_at" TIMESTAMP(3),
        "conservation_ref" VARCHAR(500),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "sdi_transmissions_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "sdi_notifications" (
        "id" SERIAL NOT NULL,
        "transmission_id" TEXT NOT NULL,
        "notification_type" "SdiNotificationType" NOT NULL,
        "raw_payload_path" VARCHAR(500),
        "sdi_message_code" VARCHAR(10),
        "sdi_message_desc" TEXT,
        "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "sdi_notifications_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "withholding_tax_types" (
        "id" TEXT NOT NULL,
        "code" VARCHAR(10) NOT NULL,
        "taxable_base_percent" DECIMAL(5, 2) NOT NULL,
        "rate" DECIMAL(5, 2) NOT NULL,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "tenant_id" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "withholding_tax_types_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "social_security_funds" (
        "id" TEXT NOT NULL,
        "code" VARCHAR(4) NOT NULL,
        "description" VARCHAR(255) NOT NULL,
        "default_rate" DECIMAL(5, 2),
        "adds_taxable_base" BOOLEAN NOT NULL DEFAULT false,
        "active" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "social_security_funds_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "withholding_tax_settlements" (
        "id" TEXT NOT NULL,
        "tenant_id" TEXT NOT NULL,
        "period_month" INTEGER NOT NULL,
        "period_year" INTEGER NOT NULL,
        "payment_date" TIMESTAMP(3) NOT NULL,
        "f24_tax_code" VARCHAR(10) NOT NULL,
        "total_amount" DECIMAL(15, 2) NOT NULL,
        "bank_account_id" TEXT,
        "payment_reference" VARCHAR(100),
        "status" "WithholdingTaxSettlementStatus" NOT NULL DEFAULT 'DRAFT',
        "submitted_by_user_id" TEXT,
        "submitted_at" TIMESTAMP(3),
        "notes" TEXT,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "withholding_tax_settlements_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "withholding_tax_settlement_lines" (
        "id" TEXT NOT NULL,
        "settlement_id" TEXT NOT NULL,
        "document_id" TEXT NOT NULL,
        "supplier_id" TEXT NOT NULL,
        "withholding_tax_type_id" TEXT NOT NULL,
        "taxable_base" DECIMAL(15, 2) NOT NULL,
        "withholding_percent" DECIMAL(5, 2) NOT NULL,
        "withholding_amount" DECIMAL(15, 2) NOT NULL,
        "document_registration_date" TIMESTAMP(3) NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "withholding_tax_settlement_lines_pkey" PRIMARY KEY ("id")
    );

-- CreateIndex
CREATE INDEX "fiscal_years_tenant_id_status_idx" ON "fiscal_years" ("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_years_tenant_id_name_key" ON "fiscal_years" ("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "fiscal_years_tenant_id_start_date_key" ON "fiscal_years" ("tenant_id", "start_date");

-- CreateIndex
CREATE INDEX "accounting_periods_tenant_id_status_idx" ON "accounting_periods" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "accounting_periods_tenant_id_start_date_end_date_idx" ON "accounting_periods" ("tenant_id", "start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_fiscal_year_id_period_number_key" ON "accounting_periods" ("fiscal_year_id", "period_number");

-- CreateIndex
CREATE UNIQUE INDEX "accounting_periods_tenant_id_name_key" ON "accounting_periods" ("tenant_id", "name");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_account_type_idx" ON "chart_of_accounts" ("tenant_id", "account_type");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenant_id_active_idx" ON "chart_of_accounts" ("tenant_id", "active");

-- CreateIndex
CREATE INDEX "chart_of_accounts_parent_account_id_idx" ON "chart_of_accounts" ("parent_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_accounts_tenant_id_code_key" ON "chart_of_accounts" ("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_chart_of_account_code" ON "chart_of_accounts" ("code")
WHERE
    ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "chart_of_account_translations_language_id_idx" ON "chart_of_account_translations" ("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_account_translations_chart_of_account_id_language__key" ON "chart_of_account_translations" ("chart_of_account_id", "language_id");

-- CreateIndex
CREATE INDEX "cost_centers_tenant_id_active_idx" ON "cost_centers" ("tenant_id", "active");

-- CreateIndex
CREATE INDEX "cost_centers_parent_cost_center_id_idx" ON "cost_centers" ("parent_cost_center_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_centers_tenant_id_code_key" ON "cost_centers" ("tenant_id", "code");

-- CreateIndex
CREATE INDEX "cost_center_translations_language_id_idx" ON "cost_center_translations" ("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "cost_center_translations_cost_center_id_language_id_key" ON "cost_center_translations" ("cost_center_id", "language_id");

-- CreateIndex
CREATE INDEX "journal_entry_templates_tenant_id_active_idx" ON "journal_entry_templates" ("tenant_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entry_templates_tenant_id_origin_key" ON "journal_entry_templates" ("tenant_id", "origin");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_journal_entry_template_origin" ON "journal_entry_templates" ("origin")
WHERE
    ("tenant_id" IS NULL);

-- CreateIndex
CREATE INDEX "journal_entry_template_lines_template_id_idx" ON "journal_entry_template_lines" ("template_id");

-- CreateIndex
CREATE INDEX "journal_entry_template_lines_chart_of_account_id_idx" ON "journal_entry_template_lines" ("chart_of_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_reversed_by_entry_id_key" ON "journal_entries" ("reversed_by_entry_id");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_status_idx" ON "journal_entries" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_origin_idx" ON "journal_entries" ("tenant_id", "origin");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_entry_date_idx" ON "journal_entries" ("tenant_id", "entry_date");

-- CreateIndex
CREATE INDEX "journal_entries_period_id_idx" ON "journal_entries" ("period_id");

-- CreateIndex
CREATE INDEX "journal_entries_document_id_idx" ON "journal_entries" ("document_id");

-- CreateIndex
CREATE INDEX "journal_entries_installment_id_idx" ON "journal_entries" ("installment_id");

-- CreateIndex
CREATE UNIQUE INDEX "journal_entries_tenant_id_fiscal_year_id_entry_number_key" ON "journal_entries" ("tenant_id", "fiscal_year_id", "entry_number")
WHERE
    ("entry_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "journal_entry_lines_entry_id_idx" ON "journal_entry_lines" ("entry_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_chart_of_account_id_idx" ON "journal_entry_lines" ("tenant_id", "chart_of_account_id");

-- CreateIndex
CREATE INDEX "journal_entry_lines_tenant_id_chart_of_account_id_direction_idx" ON "journal_entry_lines" ("tenant_id", "chart_of_account_id", "direction");

-- CreateIndex
CREATE INDEX "journal_entry_lines_cost_center_id_idx" ON "journal_entry_lines" ("cost_center_id");

-- CreateIndex
CREATE INDEX "payment_batches_tenant_id_idx" ON "payment_batches" ("tenant_id");

-- CreateIndex
CREATE INDEX "payment_batches_tenant_id_status_idx" ON "payment_batches" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payment_batches_execution_date_idx" ON "payment_batches" ("execution_date");

-- CreateIndex
CREATE UNIQUE INDEX "sdi_transmissions_document_id_key" ON "sdi_transmissions" ("document_id");

-- CreateIndex
CREATE INDEX "sdi_transmissions_tenant_id_status_idx" ON "sdi_transmissions" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "sdi_transmissions_sdi_identifier_idx" ON "sdi_transmissions" ("sdi_identifier");

-- CreateIndex
CREATE INDEX "sdi_transmissions_tenant_id_transmitted_at_idx" ON "sdi_transmissions" ("tenant_id", "transmitted_at");

-- CreateIndex
CREATE INDEX "sdi_notifications_transmission_id_received_at_idx" ON "sdi_notifications" ("transmission_id", "received_at");

-- CreateIndex
CREATE INDEX "sdi_notifications_notification_type_idx" ON "sdi_notifications" ("notification_type");

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_types_tenant_id_code_key" ON "withholding_tax_types" ("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_global_withholding_tax_type_code" ON "withholding_tax_types" ("code")
WHERE
    ("tenant_id" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "social_security_funds_code_key" ON "social_security_funds" ("code");

-- CreateIndex
CREATE INDEX "withholding_tax_settlements_tenant_id_status_idx" ON "withholding_tax_settlements" ("tenant_id", "status");

-- CreateIndex
CREATE INDEX "withholding_tax_settlements_tenant_id_payment_date_idx" ON "withholding_tax_settlements" ("tenant_id", "payment_date");

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_settlements_tenant_id_period_year_period_mo_key" ON "withholding_tax_settlements" ("tenant_id", "period_year", "period_month");

-- CreateIndex
CREATE INDEX "withholding_tax_settlement_lines_settlement_id_idx" ON "withholding_tax_settlement_lines" ("settlement_id");

-- CreateIndex
CREATE INDEX "withholding_tax_settlement_lines_supplier_id_idx" ON "withholding_tax_settlement_lines" ("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_settlement_lines_document_id_key" ON "withholding_tax_settlement_lines" ("document_id");

-- CreateIndex
CREATE INDEX "companies_tenant_id_vat_number_idx" ON "companies" ("tenant_id", "vat_number");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tenant_id_code_key" ON "companies" ("tenant_id", "code");

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_product_id_idx" ON "document_lines" ("tenant_id", "product_id");

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_product_variant_id_idx" ON "document_lines" ("tenant_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_match_status_idx" ON "document_lines" ("tenant_id", "match_status")
WHERE
    ("match_status" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_tax_rule_id_idx" ON "document_lines" ("tenant_id", "tax_rule_id")
WHERE
    ("tax_rule_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_lines_tenant_id_warehouse_id_idx" ON "document_lines" ("tenant_id", "warehouse_id")
WHERE
    ("warehouse_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_lines_parent_line_id_idx" ON "document_lines" ("parent_line_id")
WHERE
    ("parent_line_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "document_payment_installments_tenant_id_status_due_date_idx" ON "document_payment_installments" ("tenant_id", "status", "due_date");

-- CreateIndex
CREATE INDEX "document_payment_installments_tenant_id_due_date_idx" ON "document_payment_installments" ("tenant_id", "due_date")
WHERE
    (status <> 'CANCELLED');

-- CreateIndex
CREATE UNIQUE INDEX "document_relations_source_document_id_key" ON "document_relations" ("source_document_id")
WHERE
    (relation_type = 'MIRRORS');

-- CreateIndex
CREATE INDEX "documents_tenant_id_status_idx" ON "documents" ("tenant_id", "status")
WHERE
    ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "documents_tenant_id_document_type_idx" ON "documents" ("tenant_id", "document_type")
WHERE
    ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "documents_tenant_id_direction_status_idx" ON "documents" ("tenant_id", "direction", "status")
WHERE
    ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "documents_tenant_id_customer_id_idx" ON "documents" ("tenant_id", "customer_id")
WHERE
    ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "documents_tenant_id_supplier_id_idx" ON "documents" ("tenant_id", "supplier_id")
WHERE
    ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "documents_tenant_id_bank_details_mismatch_idx" ON "documents" ("tenant_id", "bank_details_mismatch")
WHERE
    ("bank_details_mismatch" = true);

-- CreateIndex
CREATE INDEX "documents_tenant_id_document_year_idx" ON "documents" ("tenant_id", "document_year");

-- CreateIndex
CREATE INDEX "documents_tenant_id_lead_id_idx" ON "documents" ("tenant_id", "lead_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_opportunity_id_idx" ON "documents" ("tenant_id", "opportunity_id");

-- CreateIndex
CREATE INDEX "documents_tenant_id_counterparty_country_code_idx" ON "documents" ("tenant_id", "counterparty_country_code");

-- CreateIndex
CREATE UNIQUE INDEX "documents_tenant_id_direction_vat_register_year_vat_registe_key" ON "documents" (
    "tenant_id",
    "direction",
    "vat_register_year",
    "vat_register_protocol"
)
WHERE
    ("vat_register_protocol" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "unique_inbound_supplier_document" ON "documents" (
    "tenant_id",
    "supplier_id",
    "counterparty_document_number",
    "document_date"
)
WHERE
    ("direction" = 'INBOUND');

-- CreateIndex
CREATE INDEX "payment_methods_tenant_id_idx" ON "payment_methods" ("tenant_id");

-- CreateIndex
CREATE INDEX "payment_methods_tenant_id_active_idx" ON "payment_methods" ("tenant_id", "active");

-- AddForeignKey
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies" ("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiscal_years" ADD CONSTRAINT "fiscal_years_closed_by_user_id_fkey" FOREIGN KEY ("closed_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "fiscal_years" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounting_periods" ADD CONSTRAINT "accounting_periods_locked_by_user_id_fkey" FOREIGN KEY ("locked_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_parent_account_id_fkey" FOREIGN KEY ("parent_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_account_translations" ADD CONSTRAINT "chart_of_account_translations_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_account_translations" ADD CONSTRAINT "chart_of_account_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_parent_cost_center_id_fkey" FOREIGN KEY ("parent_cost_center_id") REFERENCES "cost_centers" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_center_translations" ADD CONSTRAINT "cost_center_translations_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cost_center_translations" ADD CONSTRAINT "cost_center_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_templates" ADD CONSTRAINT "journal_entry_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_template_lines" ADD CONSTRAINT "journal_entry_template_lines_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "journal_entry_templates" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_template_lines" ADD CONSTRAINT "journal_entry_template_lines_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_fiscal_year_id_fkey" FOREIGN KEY ("fiscal_year_id") REFERENCES "fiscal_years" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "accounting_periods" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_installment_id_fkey" FOREIGN KEY ("installment_id") REFERENCES "document_payment_installments" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_withholding_settlement_id_fkey" FOREIGN KEY ("withholding_settlement_id") REFERENCES "withholding_tax_settlements" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_reversed_by_entry_id_fkey" FOREIGN KEY ("reversed_by_entry_id") REFERENCES "journal_entries" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_posted_by_user_id_fkey" FOREIGN KEY ("posted_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "journal_entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_accounts" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "journal_entry_lines_cost_center_id_fkey" FOREIGN KEY ("cost_center_id") REFERENCES "cost_centers" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_default_withholding_tax_type_id_fkey" FOREIGN KEY ("default_withholding_tax_type_id") REFERENCES "withholding_tax_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_social_security_fund_id_fkey" FOREIGN KEY ("social_security_fund_id") REFERENCES "social_security_funds" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_counterparty_country_code_fkey" FOREIGN KEY ("counterparty_country_code") REFERENCES "countries" ("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_payment_bank_account_id_fkey" FOREIGN KEY ("payment_bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_bank_details_verified_by_user_id_fkey" FOREIGN KEY ("bank_details_verified_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_withholding_tax_type_id_fkey" FOREIGN KEY ("withholding_tax_type_id") REFERENCES "withholding_tax_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_payment_batch_id_fkey" FOREIGN KEY ("payment_batch_id") REFERENCES "payment_batches" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_payment_installments" ADD CONSTRAINT "document_payment_installments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_default_bank_account_id_fkey" FOREIGN KEY ("default_bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_term_details" ADD CONSTRAINT "payment_term_details_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethodTranslation" ADD CONSTRAINT "PaymentMethodTranslation_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_tenant_bank_account_id_fkey" FOREIGN KEY ("tenant_bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_batches" ADD CONSTRAINT "payment_batches_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdi_transmissions" ADD CONSTRAINT "sdi_transmissions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdi_transmissions" ADD CONSTRAINT "sdi_transmissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sdi_notifications" ADD CONSTRAINT "sdi_notifications_transmission_id_fkey" FOREIGN KEY ("transmission_id") REFERENCES "sdi_transmissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_types" ADD CONSTRAINT "withholding_tax_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlements" ADD CONSTRAINT "withholding_tax_settlements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlements" ADD CONSTRAINT "withholding_tax_settlements_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlements" ADD CONSTRAINT "withholding_tax_settlements_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "withholding_tax_settlements" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_withholding_tax_type_id_fkey" FOREIGN KEY ("withholding_tax_type_id") REFERENCES "withholding_tax_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Check document type -> direction
ALTER TABLE documents ADD CONSTRAINT chk_document_counterparty CHECK (
    (
        -- Standard outbound: fatture/DDT/ordini verso cliente
        direction = 'OUTBOUND'
        AND document_type <> 'SELF_INVOICE'
        AND customer_id IS NOT NULL
        AND supplier_id IS NULL
    )
    OR (
        -- Standard inbound: fatture/ordini da fornitore
        direction = 'INBOUND'
        AND document_type <> 'SELF_INVOICE'
        AND supplier_id IS NOT NULL
        AND customer_id IS NULL
    )
    OR (
        -- Self-invoice OUTBOUND mirror (TD17/TD18/TD19 reverse charge):
        -- generated from an INBOUND supplier invoice; carries supplierId for traceability.
        direction = 'OUTBOUND'
        AND document_type = 'SELF_INVOICE'
        AND supplier_id IS NOT NULL
        AND customer_id IS NULL
    )
    OR (
        -- Self-invoice INBOUND (omaggi, art. 2 c.2 DPR 633/72):
        -- tenant is both issuer and recipient; no external counterparty.
        direction = 'INBOUND'
        AND document_type = 'SELF_INVOICE'
        AND supplier_id IS NULL
        AND customer_id IS NULL
    )
);