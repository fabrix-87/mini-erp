/*
  Warnings:

  - Added the required column `carrier_id` to the `documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "carrier_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "supplier_id" TEXT,
    "tracking_url_template" VARCHAR(500),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "custom_fields" JSONB,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_carriers" (
    "tenant_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "carrier_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_carriers_pkey" PRIMARY KEY ("product_id","carrier_id")
);

-- CreateIndex
CREATE INDEX "carriers_tenant_id_active_position_idx" ON "carriers"("tenant_id", "active", "position");

-- CreateIndex
CREATE INDEX "carriers_tenant_id_supplier_id_idx" ON "carriers"("tenant_id", "supplier_id") WHERE ("supplier_id" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "carriers_tenant_id_id_key" ON "carriers"("tenant_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "carriers_tenant_id_code_key" ON "carriers"("tenant_id", "code") WHERE ("deleted_at" IS NULL);

-- CreateIndex
CREATE INDEX "product_carriers_tenant_id_carrier_id_idx" ON "product_carriers"("tenant_id", "carrier_id");

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_tenant_id_supplier_id_fkey" FOREIGN KEY ("tenant_id", "supplier_id") REFERENCES "suppliers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_carriers" ADD CONSTRAINT "product_carriers_tenant_id_product_id_fkey" FOREIGN KEY ("tenant_id", "product_id") REFERENCES "products"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_carriers" ADD CONSTRAINT "product_carriers_tenant_id_carrier_id_fkey" FOREIGN KEY ("tenant_id", "carrier_id") REFERENCES "carriers"("tenant_id", "id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_tenant_id_carrier_id_fkey" FOREIGN KEY ("tenant_id", "carrier_id") REFERENCES "carriers"("tenant_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
