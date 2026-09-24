/*
  Warnings:

  - A unique constraint covering the columns `[tenant_id,company_id,iban]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,company_id,currency_code]` on the table `bank_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bank_accounts_company_id_iban_key";

-- DropIndex
DROP INDEX "unique_company_default_bank_account";

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_tenant_id_company_id_iban_key" ON "bank_accounts"("tenant_id", "company_id", "iban");

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_default_bank_account" ON "bank_accounts"("tenant_id", "company_id", "currency_code") WHERE ("is_default" = true);
