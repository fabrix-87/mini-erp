/*
  Warnings:

  - Made the column `preferredLanguageId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_preferredLanguageId_fkey";

UPDATE "User" SET "preferredLanguageId" = 1 WHERE "preferredLanguageId" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "preferredLanguageId" SET NOT NULL,
ALTER COLUMN "preferredLanguageId" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_preferredLanguageId_fkey" FOREIGN KEY ("preferredLanguageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
