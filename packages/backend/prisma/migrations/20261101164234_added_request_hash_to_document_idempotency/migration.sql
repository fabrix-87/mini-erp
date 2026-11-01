/*
  Warnings:

  - Added the required column `request_hash` to the `document_idempotency_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_idempotency_keys" ADD COLUMN     "request_hash" CHAR(64) NOT NULL;
