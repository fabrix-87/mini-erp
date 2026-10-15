/*
Warnings:

- A unique constraint covering the columns `[tenant_id,id]` on the table `payment_methods` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,id]` on the table `payment_term_details` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,id]` on the table `price_list_items` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,id]` on the table `withholding_tax_settlement_lines` will be added. If there are existing duplicate values, this will fail.
- A unique constraint covering the columns `[tenant_id,id]` on the table `withholding_tax_types` will be added. If there are existing duplicate values, this will fail.
- Added the required column `tenant_id` to the `document_relations` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `payment_term_details` table without a default value. This is not possible if the table is not empty.
- Added the required column `tenant_id` to the `withholding_tax_settlement_lines` table without a default value. This is not possible if the table is not empty.

 */
-- DropForeignKey
ALTER TABLE "document_lines"
DROP CONSTRAINT "document_lines_tenant_id_parent_line_id_fkey";

-- DropForeignKey
ALTER TABLE "document_relations"
DROP CONSTRAINT "document_relations_source_document_id_fkey";

-- DropForeignKey
ALTER TABLE "document_relations"
DROP CONSTRAINT "document_relations_target_document_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products"
DROP CONSTRAINT "opportunity_products_price_list_item_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products"
DROP CONSTRAINT "opportunity_products_tenant_id_product_id_fkey";

-- DropForeignKey
ALTER TABLE "opportunity_products"
DROP CONSTRAINT "opportunity_products_tenant_id_product_variant_id_fkey";

-- DropForeignKey
ALTER TABLE "payment_term_details"
DROP CONSTRAINT "payment_term_details_payment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_reservations"
DROP CONSTRAINT "stock_reservations_tenant_id_document_line_id_fkey";

-- DropForeignKey
ALTER TABLE "withholding_tax_settlement_lines"
DROP CONSTRAINT "withholding_tax_settlement_lines_document_id_fkey";

-- DropForeignKey
ALTER TABLE "withholding_tax_settlement_lines"
DROP CONSTRAINT "withholding_tax_settlement_lines_settlement_id_fkey";

-- DropForeignKey
ALTER TABLE "withholding_tax_settlement_lines"
DROP CONSTRAINT "withholding_tax_settlement_lines_supplier_id_fkey";

-- DropForeignKey
ALTER TABLE "withholding_tax_settlement_lines"
DROP CONSTRAINT "withholding_tax_settlement_lines_withholding_tax_type_id_fkey";

-- DropIndex
DROP INDEX "document_relations_target_document_id_idx";

-- DropIndex
DROP INDEX "products_tenant_id_deleted_at_idx";

-- DropIndex
DROP INDEX "products_tenant_id_status_idx";

-- DropIndex
DROP INDEX "withholding_tax_settlement_lines_settlement_id_idx";

-- DropIndex
DROP INDEX "withholding_tax_settlement_lines_supplier_id_idx";

-- AlterTable
ALTER TABLE "document_relations"
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment_term_details"
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "withholding_tax_settlement_lines"
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "document_relations_tenant_id_target_document_id_idx" ON "document_relations" ("tenant_id", "target_document_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_tenant_id_id_key" ON "payment_methods" ("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_term_details_tenant_id_id_key" ON "payment_term_details" ("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "price_list_items_tenant_id_id_key" ON "price_list_items" ("tenant_id", "id");

-- CreateIndex
CREATE INDEX "products_tenant_id_status_idx" ON "products" ("tenant_id", "status")
WHERE
  ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "products_tenant_id_deleted_at_idx" ON "products" ("tenant_id", "deleted_at")
WHERE
  ("deleted_at" IS NOT NULL);

-- CreateIndex
CREATE INDEX "withholding_tax_settlement_lines_tenant_id_settlement_id_idx" ON "withholding_tax_settlement_lines" ("tenant_id", "settlement_id");

-- CreateIndex
CREATE INDEX "withholding_tax_settlement_lines_tenant_id_supplier_id_idx" ON "withholding_tax_settlement_lines" ("tenant_id", "supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_settlement_lines_tenant_id_id_key" ON "withholding_tax_settlement_lines" ("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "withholding_tax_types_tenant_id_id_key" ON "withholding_tax_types" ("tenant_id", "id");

-- AddForeignKey
ALTER TABLE "document_lines" ADD CONSTRAINT "document_lines_tenant_id_document_id_parent_line_id_fkey" FOREIGN KEY ("tenant_id", "document_id", "parent_line_id") REFERENCES "document_lines" ("tenant_id", "document_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relations" ADD CONSTRAINT "document_relations_tenant_id_source_document_id_fkey" FOREIGN KEY ("tenant_id", "source_document_id") REFERENCES "documents" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_relations" ADD CONSTRAINT "document_relations_tenant_id_target_document_id_fkey" FOREIGN KEY ("tenant_id", "target_document_id") REFERENCES "documents" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_product_id_product_variant__fkey" FOREIGN KEY ("tenant_id", "product_id", "product_variant_id") REFERENCES "product_variants" ("tenant_id", "product_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_products" ADD CONSTRAINT "opportunity_products_tenant_id_price_list_item_id_fkey" FOREIGN KEY ("tenant_id", "price_list_item_id") REFERENCES "price_list_items" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_term_details" ADD CONSTRAINT "payment_term_details_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_term_details" ADD CONSTRAINT "payment_term_details_tenant_id_payment_method_id_fkey" FOREIGN KEY ("tenant_id", "payment_method_id") REFERENCES "payment_methods" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_tenant_id_settlement_id_fkey" FOREIGN KEY ("tenant_id", "settlement_id") REFERENCES "withholding_tax_settlements" ("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_tenant_id_document_id_fkey" FOREIGN KEY ("tenant_id", "document_id") REFERENCES "documents" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withholding_tax_settlement_lines" ADD CONSTRAINT "withholding_tax_settlement_lines_tenant_id_withholding_tax_fkey" FOREIGN KEY ("tenant_id", "withholding_tax_type_id") REFERENCES "withholding_tax_types" ("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservations" ADD CONSTRAINT "stock_reservations_tenant_id_document_id_document_line_id_fkey" FOREIGN KEY ("tenant_id", "document_id", "document_line_id") REFERENCES "document_lines" ("tenant_id", "document_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE document_payment_installments ADD CONSTRAINT ck_installment_paid_amount CHECK (
  paid_amount >= 0
  AND late_fee_amount >= 0
);

ALTER TABLE payment_batches ADD CONSTRAINT ck_batch_total_amount CHECK (total_amount >= 0);