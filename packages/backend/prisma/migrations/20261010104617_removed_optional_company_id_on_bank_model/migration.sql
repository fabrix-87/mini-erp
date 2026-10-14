/*
Warnings:

- Made the column `company_id` on table `bank_accounts` required. This step will fail if there are existing NULL values in that column.

 */
-- Drop custom unique (may be an index or a constraint depending on history)
ALTER TABLE "bank_accounts"
DROP CONSTRAINT IF EXISTS "unique_company_default_bank_account";
DROP INDEX IF EXISTS "unique_company_default_bank_account";

UPDATE bank_accounts b
SET
  company_id = t.company_id
FROM
  tenants t
WHERE
  b.tenant_id = t.id
  AND b.company_id IS NULL;

DROP INDEX IF EXISTS "bank_accounts_tenant_id_iban_key";
DROP INDEX IF EXISTS "unique_tenant_default_bank_account";

-- AlterTable
ALTER TABLE "bank_accounts"
ALTER COLUMN "company_id"
SET
  NOT NULL;