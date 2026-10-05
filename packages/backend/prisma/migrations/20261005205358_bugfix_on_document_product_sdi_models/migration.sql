/*
  Warnings:

  - You are about to drop the column `carrier_reference_ids` on the `products` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tenant_id,reference]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transmission_id,file_name]` on the table `sdi_notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,document_id,attempt]` on the table `sdi_transmissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file_name` to the `sdi_notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `xml_sha256` to the `sdi_transmissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "SdiTransmissionStatus" ADD VALUE 'RECEIVED';

-- DropForeignKey
ALTER TABLE "documents" DROP CONSTRAINT "documents_payment_bank_account_id_fkey";

-- DropIndex
DROP INDEX "products_active_idx";

-- DropIndex
DROP INDEX "products_deleted_at_idx";

-- DropIndex
DROP INDEX "products_manufacturer_id_idx";

-- DropIndex
DROP INDEX "products_reference_idx";

-- DropIndex
DROP INDEX "products_supplier_id_idx";

-- DropIndex
DROP INDEX "products_tenant_id_reference_key";

-- DropIndex
DROP INDEX "sdi_transmissions_tenant_id_document_id_key";

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "carrier_code" VARCHAR(20),
ADD COLUMN     "carrier_name" VARCHAR(100),
ADD COLUMN     "tracking_number" VARCHAR(100),
ALTER COLUMN "carrier_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" DROP COLUMN "carrier_reference_ids";

-- AlterTable
ALTER TABLE "sdi_notifications" ADD COLUMN     "file_name" VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE "sdi_transmissions" ADD COLUMN     "attempt" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "xml_sha256" CHAR(64) NOT NULL;

-- CreateIndex
CREATE INDEX "products_tenant_id_supplier_id_idx" ON "products"("tenant_id", "supplier_id") WHERE ("supplier_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "products_tenant_id_manufacturer_id_idx" ON "products"("tenant_id", "manufacturer_id") WHERE ("manufacturer_id" IS NOT NULL);

-- CreateIndex
CREATE INDEX "products_tenant_id_deleted_at_idx" ON "products"("tenant_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenant_id_reference_key" ON "products"("tenant_id", "reference") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "sdi_notifications_transmission_id_file_name_key" ON "sdi_notifications"("transmission_id", "file_name");

-- CreateIndex
CREATE UNIQUE INDEX "sdi_transmissions_tenant_id_document_id_attempt_key" ON "sdi_transmissions"("tenant_id", "document_id", "attempt");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_payment_bank_account_id_fkey" FOREIGN KEY ("tenant_id", "payment_bank_account_id") REFERENCES "bank_accounts"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
