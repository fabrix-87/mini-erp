/*
  Warnings:

  - The values [CANCELLED] on the enum `MovementStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `reserved` on the `stock_batches` table. All the data in the column will be lost.
  - You are about to alter the column `quantity` on the `stock_batches` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,6)`.
  - You are about to alter the column `quantity` on the `stock_movements` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,6)`.
  - You are about to alter the column `quantity` on the `stock_reservations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,6)`.
  - You are about to alter the column `quantity` on the `virtual_stocks` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,6)`.
  - A unique constraint covering the columns `[tenant_id,id]` on the table `stock_movements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StockSerialStatus" AS ENUM ('IN_STOCK', 'RESERVED', 'SOLD', 'RETURNED', 'QUARANTINE', 'SCRAPPED');

-- AlterEnum
BEGIN;
CREATE TYPE "MovementStatus_new" AS ENUM ('PENDING', 'CONFIRMED');
ALTER TABLE "public"."stock_movements" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "stock_movements" ALTER COLUMN "status" TYPE "MovementStatus_new" USING ("status"::text::"MovementStatus_new");
ALTER TYPE "MovementStatus" RENAME TO "MovementStatus_old";
ALTER TYPE "MovementStatus_new" RENAME TO "MovementStatus";
DROP TYPE "public"."MovementStatus_old";
ALTER TABLE "stock_movements" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_tenant_id_document_line_id_fkey";

-- AlterTable
ALTER TABLE "stock_batches" DROP COLUMN "reserved",
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(20,6);

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "reversed_by_movement_id" TEXT,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(20,6);

-- AlterTable
ALTER TABLE "stock_reservations" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(20,6);

-- AlterTable
ALTER TABLE "virtual_stocks" ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(20,6),
ALTER COLUMN "lead_time_days" DROP NOT NULL,
ALTER COLUMN "lead_time_days" DROP DEFAULT;

-- CreateTable
CREATE TABLE "stock_serials" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "warehouse_id" TEXT NOT NULL,
    "serial_number" VARCHAR(100) NOT NULL,
    "status" "StockSerialStatus" NOT NULL DEFAULT 'IN_STOCK',
    "last_movement_id" TEXT,
    "batch_number" VARCHAR(50),
    "reservation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_serials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_serials_tenant_id_warehouse_id_status_idx" ON "stock_serials"("tenant_id", "warehouse_id", "status");

-- CreateIndex
CREATE INDEX "stock_serials_tenant_id_batch_number_idx" ON "stock_serials"("tenant_id", "batch_number") WHERE ("batch_number" IS NOT NULL);

-- CreateIndex
CREATE INDEX "stock_serials_tenant_id_reservation_id_idx" ON "stock_serials"("tenant_id", "reservation_id") WHERE ("reservation_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "stock_serials_tenant_id_id_key" ON "stock_serials"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_serials_tenant_id_product_variant_id_serial_number_key" ON "stock_serials"("tenant_id", "product_variant_id", "serial_number");

-- CreateIndex
CREATE INDEX "stock_movements_tenant_id_reversed_by_movement_id_idx" ON "stock_movements"("tenant_id", "reversed_by_movement_id") WHERE ("reversed_by_movement_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "stock_movements_tenant_id_id_key" ON "stock_movements"("tenant_id", "id");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_reversed_by_movement_id_fkey" FOREIGN KEY ("tenant_id", "reversed_by_movement_id") REFERENCES "stock_movements"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_tenant_id_document_id_document_line_id_fkey" FOREIGN KEY ("tenant_id", "document_id", "document_line_id") REFERENCES "document_lines"("tenant_id", "document_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_serials" ADD CONSTRAINT "stock_serials_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_serials" ADD CONSTRAINT "stock_serials_tenant_id_product_variant_id_fkey" FOREIGN KEY ("tenant_id", "product_variant_id") REFERENCES "product_variants"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_serials" ADD CONSTRAINT "stock_serials_tenant_id_warehouse_id_fkey" FOREIGN KEY ("tenant_id", "warehouse_id") REFERENCES "warehouses"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_serials" ADD CONSTRAINT "stock_serials_tenant_id_last_movement_id_fkey" FOREIGN KEY ("tenant_id", "last_movement_id") REFERENCES "stock_movements"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_serials" ADD CONSTRAINT "stock_serials_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "stock_reservations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
