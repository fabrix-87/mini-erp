/*
  Warnings:

  - You are about to drop the column `shipping_cost` on the `documents` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_tax_amount` on the `documents` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_default_price_list_id_fkey";

-- AlterTable
ALTER TABLE "documents" DROP COLUMN "shipping_cost",
DROP COLUMN "shipping_tax_amount",
ADD COLUMN     "price_list_id" TEXT;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_default_price_list_id_fkey" FOREIGN KEY ("tenant_id", "default_price_list_id") REFERENCES "price_lists"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_price_list_id_fkey" FOREIGN KEY ("tenant_id", "price_list_id") REFERENCES "price_lists"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
