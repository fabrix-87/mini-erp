/*
  Warnings:

  - The primary key for the `company_addresses` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "company_addresses" DROP CONSTRAINT "company_addresses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "company_addresses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "company_addresses_id_seq";
