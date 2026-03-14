/*
  Warnings:

  - The `status` column on the `DocumentPaymentInstallment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "InstallmentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED', 'PARTIAL');

-- AlterTable
ALTER TABLE "DocumentPaymentInstallment" DROP COLUMN "status",
ADD COLUMN     "status" "InstallmentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_status_dueDate_idx" ON "DocumentPaymentInstallment"("status", "dueDate");

-- CreateIndex
CREATE INDEX "DocumentPaymentInstallment_status_idx" ON "DocumentPaymentInstallment"("status");
