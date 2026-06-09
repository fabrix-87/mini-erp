/*
  Warnings:

  - You are about to drop the column `customValue` on the `product_features` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "product_features" DROP COLUMN "customValue",
ADD COLUMN     "custom_value" JSONB;

ADD CONSTRAINT "product_features_feature_xor_custom_chk"
CHECK (
  ("feature_id" IS NOT NULL AND "custom_value" IS NULL)
  OR
  ("feature_id" IS NULL AND "custom_value" IS NOT NULL)
);