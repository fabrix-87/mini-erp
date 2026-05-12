/*
  Warnings:

  - You are about to drop the column `companyId` on the `Document` table. All the data in the column will be lost.
  - The `lineType` column on the `DocumentLine` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `TenantSettings` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tenantId,documentType,year]` on the table `DocumentSequence` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenantId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DocumentLine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenantId` to the `DocumentSequence` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentLineType" AS ENUM ('PRODUCT', 'SERVICE', 'DISCOUNT', 'SUBTOTAL', 'TEXT', 'PAGE_BREAK');

-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TRIAL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('RF01', 'RF02', 'RF04', 'RF05', 'RF06', 'RF07', 'RF08', 'RF09', 'RF10', 'RF11', 'RF12', 'RF13', 'RF14', 'RF15', 'RF16', 'RF17', 'RF18', 'RF19');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_companyId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_defaultLanguageId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_defaultPurchasesTaxRuleId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_defaultSalesTaxRuleId_fkey";

-- DropIndex
DROP INDEX "Document_companyId_idx";

-- DropIndex
DROP INDEX "DocumentSequence_documentType_year_key";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "companyId",
ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DocumentLine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "lineType",
ADD COLUMN     "lineType" "DocumentLineType" NOT NULL DEFAULT 'PRODUCT';

-- AlterTable
ALTER TABLE "DocumentPaymentInstallment" ALTER COLUMN "amount" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "DocumentSequence" ADD COLUMN     "tenantId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tenantId" INTEGER;

-- DropTable
DROP TABLE "TenantSettings";

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "companyId" INTEGER NOT NULL,
    "taxRegime" "TaxRegime" NOT NULL DEFAULT 'RF01',
    "defaultSalesTaxRuleId" INTEGER,
    "defaultPurchasesTaxRuleId" INTEGER,
    "defaultCurrency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "defaultLanguageId" INTEGER,
    "sdiTransmissionFormat" VARCHAR(10),
    "sdiCertificatePath" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_code_key" ON "Tenant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_companyId_key" ON "Tenant"("companyId");

-- CreateIndex
CREATE INDEX "Tenant_companyId_idx" ON "Tenant"("companyId");

-- CreateIndex
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");

-- CreateIndex
CREATE INDEX "Document_tenantId_idx" ON "Document"("tenantId");

-- CreateIndex
CREATE INDEX "Document_tenantId_documentType_idx" ON "Document"("tenantId", "documentType");

-- CreateIndex
CREATE INDEX "Document_tenantId_status_idx" ON "Document"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Document_deletedAt_documentType_idx" ON "Document"("deletedAt", "documentType");

-- CreateIndex
CREATE INDEX "Document_deletedAt_customerId_idx" ON "Document"("deletedAt", "customerId");

-- CreateIndex
CREATE INDEX "Document_deletedAt_supplierId_idx" ON "Document"("deletedAt", "supplierId");

-- CreateIndex
CREATE INDEX "Document_deletedAt_status_idx" ON "Document"("deletedAt", "status");

-- CreateIndex
CREATE INDEX "DocumentSequence_tenantId_idx" ON "DocumentSequence"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentSequence_tenantId_documentType_year_key" ON "DocumentSequence"("tenantId", "documentType", "year");

-- CreateIndex
CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentSequence" ADD CONSTRAINT "DocumentSequence_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultSalesTaxRuleId_fkey" FOREIGN KEY ("defaultSalesTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultPurchasesTaxRuleId_fkey" FOREIGN KEY ("defaultPurchasesTaxRuleId") REFERENCES "TaxRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_defaultLanguageId_fkey" FOREIGN KEY ("defaultLanguageId") REFERENCES "Language"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
