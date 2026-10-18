/*
  Warnings:

  - The values [PURCHASE] on the enum `PriceListType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `min_quantity` on the `price_list_items` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(15,6)`.
  - A unique constraint covering the columns `[price_list_id,variant_id,min_quantity]` on the table `price_list_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[price_list_id,variant_id,min_quantity,valid_from]` on the table `price_list_items` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_id,currency_code]` on the table `price_lists` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PriceListType_new" AS ENUM ('SALE', 'PROMOTION', 'CONTRACT');
ALTER TABLE "public"."price_lists" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "price_lists" ALTER COLUMN "type" TYPE "PriceListType_new" USING ("type"::text::"PriceListType_new");
ALTER TYPE "PriceListType" RENAME TO "PriceListType_old";
ALTER TYPE "PriceListType_new" RENAME TO "PriceListType";
DROP TYPE "public"."PriceListType_old";
ALTER TABLE "price_lists" ALTER COLUMN "type" SET DEFAULT 'SALE';
COMMIT;

-- DropIndex
DROP INDEX "price_list_items_price_list_id_variant_id_min_quantity_key";

-- AlterTable
ALTER TABLE "price_list_items" ALTER COLUMN "min_quantity" SET DEFAULT 1,
ALTER COLUMN "min_quantity" SET DATA TYPE DECIMAL(15,6);

-- AlterTable
ALTER TABLE "price_lists" ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "price_list_items_price_list_id_variant_id_idx" ON "price_list_items"("price_list_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_pli_undated" ON "price_list_items"("price_list_id", "variant_id", "min_quantity") WHERE ("valid_from" IS NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_pli_dated" ON "price_list_items"("price_list_id", "variant_id", "min_quantity", "valid_from") WHERE ("valid_from" IS NOT NULL);

-- CreateIndex
CREATE UNIQUE INDEX "uq_price_list_one_default" ON "price_lists"("tenant_id", "currency_code") WHERE ("is_default" = true);

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE price_list_items
  ADD CONSTRAINT chk_pli_min_quantity CHECK (min_quantity > 0),
  ADD CONSTRAINT chk_pli_price CHECK (price > 0),
  ADD CONSTRAINT chk_pli_dates CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from),
  ADD CONSTRAINT chk_pli_valid_to_needs_from CHECK (valid_to IS NULL OR valid_from IS NOT NULL);

ALTER TABLE price_list_items
  ADD CONSTRAINT ex_pli_no_overlap
  EXCLUDE USING gist (
    price_list_id WITH =, variant_id WITH =, min_quantity WITH =,
    tsrange(valid_from, valid_to, '[]') WITH &&
  ) WHERE (valid_from IS NOT NULL);