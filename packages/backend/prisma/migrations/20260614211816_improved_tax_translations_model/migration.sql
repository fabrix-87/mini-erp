/*
  Warnings:

  - You are about to drop the `TaxRuleTranslation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TaxRuleTranslation" DROP CONSTRAINT "TaxRuleTranslation_languageId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRuleTranslation" DROP CONSTRAINT "TaxRuleTranslation_taxRuleId_fkey";

-- DropTable
DROP TABLE "TaxRuleTranslation";

-- CreateTable
CREATE TABLE "tax_rule_translations" (
    "id" SERIAL NOT NULL,
    "tax_rule_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rule_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tax_rule_translations_language_id_idx" ON "tax_rule_translations"("language_id");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rule_translations_tax_rule_id_language_id_key" ON "tax_rule_translations"("tax_rule_id", "language_id");

-- AddForeignKey
ALTER TABLE "tax_rule_translations" ADD CONSTRAINT "tax_rule_translations_tax_rule_id_fkey" FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rule_translations" ADD CONSTRAINT "tax_rule_translations_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
