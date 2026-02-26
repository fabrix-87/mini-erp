/*
  Warnings:

  - You are about to drop the `ProductVariantTranslation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariantTranslation" DROP CONSTRAINT "ProductVariantTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantTranslation" DROP CONSTRAINT "ProductVariantTranslation_productVariantId_fkey";

-- DropTable
DROP TABLE "ProductVariantTranslation";

-- CreateTable
CREATE TABLE "ProductTranslation" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "languageId" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "shortDescription" VARCHAR(500),
    "tags" VARCHAR(500),
    "metaTitle" VARCHAR(255),
    "metaDescription" TEXT,
    "metaKeywords" VARCHAR(500),
    "linkRewrite" VARCHAR(255),
    "availableNowLabel" VARCHAR(100) NOT NULL DEFAULT 'In stock',
    "availableLaterLabel" VARCHAR(100) NOT NULL DEFAULT 'Available soon',
    "deliveryTimeInStockNote" VARCHAR(255),
    "deliveryTimeOutOfStockNote" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_linkRewrite_key" ON "ProductTranslation"("linkRewrite");

-- CreateIndex
CREATE INDEX "ProductTranslation_productId_idx" ON "ProductTranslation"("productId");

-- CreateIndex
CREATE INDEX "ProductTranslation_languageId_idx" ON "ProductTranslation"("languageId");

-- CreateIndex
CREATE INDEX "ProductTranslation_linkRewrite_idx" ON "ProductTranslation"("linkRewrite");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTranslation_productId_languageId_key" ON "ProductTranslation"("productId", "languageId");

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTranslation" ADD CONSTRAINT "ProductTranslation_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
