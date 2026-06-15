/*
Warnings:

- You are about to drop the column `bank_account` on the `suppliers` table. All the data in the column will be lost.
- You are about to drop the column `payment_terms` on the `suppliers` table. All the data in the column will be lost.
- You are about to drop the `tenant_bank_accounts` table. If the table is not empty, all the data it contains will be lost.
- A unique constraint covering the columns `[tenant_id,email]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.
- Added the required column `tenant_id` to the `contacts` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `customers` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `suppliers` table without a default value. This is not possible if the table is not empty.

 */
-- CreateEnum
CREATE TYPE "DocumentDirection" AS ENUM ('OUTBOUND', 'INBOUND');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "DocumentType" ADD VALUE 'SUPPLIER_INVOICE';

ALTER TYPE "DocumentType" ADD VALUE 'SUPPLIER_CREDIT_NOTE';

ALTER TYPE "DocumentType" ADD VALUE 'SUPPLIER_DELIVERY_NOTE';

ALTER TYPE "DocumentType" ADD VALUE 'SELF_INVOICE';

-- DropForeignKey
ALTER TABLE "payment_methods"
DROP CONSTRAINT "payment_methods_default_bank_account_id_fkey";

-- DropForeignKey
ALTER TABLE "tenant_bank_accounts"
DROP CONSTRAINT "tenant_bank_accounts_currency_code_fkey";

-- DropForeignKey
ALTER TABLE "tenant_bank_accounts"
DROP CONSTRAINT "tenant_bank_accounts_tenant_id_fkey";

-- DropIndex
DROP INDEX "contacts_email_idx";

-- DropIndex
DROP INDEX "contacts_email_key";

-- DropIndex
DROP INDEX "documents_tenant_id_status_idx";

-- AlterTable
ALTER TABLE "contacts"
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "customers"
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "documents"
ADD COLUMN "direction" "DocumentDirection" NOT NULL DEFAULT 'OUTBOUND';

-- AlterTable
ALTER TABLE "suppliers"
DROP COLUMN "bank_account",
DROP COLUMN "payment_terms",
ADD COLUMN "default_contribution_percent" DECIMAL(5, 2),
ADD COLUMN "default_withholding_percent" DECIMAL(5, 2),
ADD COLUMN "fiscal_regime_code" VARCHAR(4),
ADD COLUMN "is_withholding_subject" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "payment_method_id" INTEGER,
ADD COLUMN "social_security_fund_code" VARCHAR(4),
ADD COLUMN "tenant_id" TEXT NOT NULL,
ADD COLUMN "withholding_tax_type" VARCHAR(4);

-- DropTable
DROP TABLE "tenant_bank_accounts";

-- CreateTable
CREATE TABLE
  "bank_accounts" (
    "id" SERIAL NOT NULL,
    "tenant_id" TEXT,
    "company_id" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "iban" VARCHAR(34) NOT NULL,
    "bic" VARCHAR(11),
    "account_holder" VARCHAR(255),
    "currency_code" CHAR(3) NOT NULL DEFAULT 'EUR',
    "note" VARCHAR(250) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
  );

-- CreateIndex
CREATE INDEX "bank_accounts_tenant_id_active_idx" ON "bank_accounts" ("tenant_id", "active");

-- CreateIndex
CREATE INDEX "bank_accounts_company_id_active_idx" ON "bank_accounts" ("company_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_tenant_id_iban_key" ON "bank_accounts" ("tenant_id", "iban");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_company_id_iban_key" ON "bank_accounts" ("company_id", "iban");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tenant_default_bank_account" ON "bank_accounts" ("tenant_id", "currency_code")
WHERE
  ("is_default" = true);

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_default_bank_account" ON "bank_accounts" ("company_id", "currency_code")
WHERE
  ("is_default" = true);

-- CreateIndex
CREATE INDEX "contacts_tenant_id_idx" ON "contacts" ("tenant_id");

-- CreateIndex
CREATE INDEX "contacts_tenant_id_active_idx" ON "contacts" ("tenant_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "unique_tenant_contact_email" ON "contacts" ("tenant_id", "email")
WHERE
  ("email" IS NOT NULL);

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers" ("tenant_id");

-- CreateIndex
CREATE INDEX "customers_tenant_id_type_idx" ON "customers" ("tenant_id", "type");

-- CreateIndex
CREATE INDEX "customers_tenant_id_segment_idx" ON "customers" ("tenant_id", "segment");

-- CreateIndex
CREATE INDEX "customers_tenant_id_creditStatus_idx" ON "customers" ("tenant_id", "creditStatus");

-- CreateIndex
CREATE INDEX "customers_tenant_id_deleted_at_idx" ON "customers" ("tenant_id", "deleted_at");

-- CreateIndex
CREATE INDEX "documents_tenant_id_direction_status_idx" ON "documents" ("tenant_id", "direction", "status");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers" ("tenant_id");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_deleted_at_idx" ON "suppliers" ("tenant_id", "deleted_at");

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_currency_code_fkey" FOREIGN KEY ("currency_code") REFERENCES "currencies" ("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_default_bank_account_id_fkey" FOREIGN KEY ("default_bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE bank_accounts ADD CONSTRAINT chk_bank_account_owner CHECK (num_nonnulls (tenant_id, company_id) = 1)