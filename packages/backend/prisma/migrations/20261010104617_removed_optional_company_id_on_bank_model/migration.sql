/*
Warnings:

- Made the column `company_id` on table `bank_accounts` required. This step will fail if there are existing NULL values in that column.

 */
-- Rimuovi il vincolo unique personalizzato
ALTER TABLE "bank_accounts"
DROP CONSTRAINT "unique_company_default_bank_account";

UPDATE bank_accounts b
SET
  company_id = t.company_id
FROM
  tenants t
WHERE
  b.tenant_id = t.id
  AND b.company_id IS NULL;

-- DropIndex
DROP INDEX "bank_accounts_tenant_id_iban_key";

-- DropIndex
DROP INDEX "unique_tenant_default_bank_account";

-- AlterTable
ALTER TABLE "bank_accounts"
ALTER COLUMN "company_id"
SET
  NOT NULL;