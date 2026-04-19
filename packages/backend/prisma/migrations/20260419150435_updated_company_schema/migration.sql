/*
  Warnings:

  - You are about to drop the column `vatExempt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `vatExemptReason` on the `Company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Company" DROP COLUMN "vatExempt",
DROP COLUMN "vatExemptReason";
