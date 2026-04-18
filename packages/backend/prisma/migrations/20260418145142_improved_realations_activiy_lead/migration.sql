/*
  Warnings:

  - You are about to drop the column `followUpDate` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `requiresFollowUp` on the `Activity` table. All the data in the column will be lost.
  - You are about to drop the column `nextFollowUpDate` on the `Lead` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Lead_nextFollowUpDate_idx";

-- AlterTable
ALTER TABLE "Activity" DROP COLUMN "followUpDate",
DROP COLUMN "requiresFollowUp";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "nextFollowUpDate";
