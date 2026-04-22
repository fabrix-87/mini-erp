/*
  Warnings:

  - You are about to drop the column `firstOrderDate` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `openingHours` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `taxRegime` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `totalOrders` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `totalRevenue` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `isLegal` on the `CompanyAddress` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimaryContact` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `Contact` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[companyId]` on the table `CompanyAddress` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_companyId_fkey";

-- DropIndex
DROP INDEX "CompanyAddress_addressType_idx";

-- DropIndex
DROP INDEX "CompanyAddress_companyId_addressType_isPrimary_key";

-- DropIndex
DROP INDEX "CompanyAddress_companyId_isLegal_idx";

-- DropIndex
DROP INDEX "CompanyAddress_provinceCode_idx";

-- DropIndex
DROP INDEX "Contact_companyId_email_key";

-- DropIndex
DROP INDEX "Contact_companyId_idx";

-- DropIndex
DROP INDEX "Contact_companyId_isPrimaryContact_idx";

-- DropIndex
DROP INDEX "Contact_isPrimaryContact_idx";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "firstOrderDate",
DROP COLUMN "openingHours",
DROP COLUMN "taxRegime",
DROP COLUMN "totalOrders",
DROP COLUMN "totalRevenue";

-- AlterTable
ALTER TABLE "CompanyAddress" DROP COLUMN "isLegal",
ALTER COLUMN "addressType" SET DEFAULT 'BILLING';

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "companyId",
DROP COLUMN "department",
DROP COLUMN "isPrimaryContact",
DROP COLUMN "position",
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "parentCustomerId" INTEGER;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "parentSupplierId" INTEGER;

-- CreateTable
CREATE TABLE "CompanyContact" (
    "id" SERIAL NOT NULL,
    "contactId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "position" VARCHAR(100),
    "department" VARCHAR(100),
    "isPrimaryContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyContact_contactId_idx" ON "CompanyContact"("contactId");

-- CreateIndex
CREATE INDEX "CompanyContact_companyId_idx" ON "CompanyContact"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyContact_companyId_contactId_key" ON "CompanyContact"("companyId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_primary_contact_per_company" ON "CompanyContact"("companyId") WHERE ("isPrimaryContact" = true);

-- CreateIndex
CREATE INDEX "CompanyAddress_companyId_idx" ON "CompanyAddress"("companyId");

-- CreateIndex
CREATE INDEX "CompanyAddress_companyId_addressType_idx" ON "CompanyAddress"("companyId", "addressType");

-- CreateIndex
CREATE UNIQUE INDEX "unique_company_legal_address" ON "CompanyAddress"("companyId") WHERE ("addressType" = 'LEGAL');

-- CreateIndex
CREATE INDEX "CompanyNote_companyId_idx" ON "CompanyNote"("companyId");

-- CreateIndex
CREATE INDEX "CompanyNote_authorId_idx" ON "CompanyNote"("authorId");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_email_key" ON "Contact"("email");

-- CreateIndex
CREATE INDEX "Customer_parentCustomerId_idx" ON "Customer"("parentCustomerId");

-- CreateIndex
CREATE INDEX "Supplier_parentSupplierId_idx" ON "Supplier"("parentSupplierId");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_parentCustomerId_fkey" FOREIGN KEY ("parentCustomerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_parentSupplierId_fkey" FOREIGN KEY ("parentSupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContact" ADD CONSTRAINT "CompanyContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContact" ADD CONSTRAINT "CompanyContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
