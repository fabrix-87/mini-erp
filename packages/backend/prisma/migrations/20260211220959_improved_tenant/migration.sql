/*
  Warnings:

  - You are about to drop the column `companyName` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `countryCode` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `fiscalAddress` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `pec` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `sdiCode` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `taxCode` on the `TenantSettings` table. All the data in the column will be lost.
  - You are about to drop the column `vatNumber` on the `TenantSettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `TenantSettings` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_countryCode_fkey";

-- AlterTable
ALTER TABLE "TenantSettings" DROP COLUMN "companyName",
DROP COLUMN "countryCode",
DROP COLUMN "fiscalAddress",
DROP COLUMN "pec",
DROP COLUMN "sdiCode",
DROP COLUMN "taxCode",
DROP COLUMN "vatNumber",
ADD COLUMN     "companyId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_companyId_key" ON "TenantSettings"("companyId");

-- CreateIndex
CREATE INDEX "TenantSettings_companyId_idx" ON "TenantSettings"("companyId");

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
