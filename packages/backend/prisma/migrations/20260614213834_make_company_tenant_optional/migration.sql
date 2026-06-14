-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_tenant_id_fkey";

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "tenant_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
