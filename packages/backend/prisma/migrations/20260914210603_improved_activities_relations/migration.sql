/*
  Warnings:

  - You are about to drop the column `companyId` on the `activities` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "activities" DROP CONSTRAINT "activities_companyId_fkey";

-- DropIndex
DROP INDEX "activities_companyId_idx";

-- DropIndex
DROP INDEX "activities_customer_id_idx";

-- DropIndex
DROP INDEX "activities_lead_id_idx";

-- DropIndex
DROP INDEX "activities_opportunity_id_idx";

-- DropIndex
DROP INDEX "activities_priority_idx";

-- DropIndex
DROP INDEX "activities_type_idx";

-- AlterTable
ALTER TABLE "activities" DROP COLUMN "companyId",
ADD COLUMN     "supplierId" TEXT;

-- CreateIndex
CREATE INDEX "activities_tenant_id_customer_id_idx" ON "activities"("tenant_id", "customer_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_supplierId_idx" ON "activities"("tenant_id", "supplierId");

-- CreateIndex
CREATE INDEX "activities_tenant_id_opportunity_id_idx" ON "activities"("tenant_id", "opportunity_id");

-- CreateIndex
CREATE INDEX "activities_tenant_id_lead_id_idx" ON "activities"("tenant_id", "lead_id");

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
